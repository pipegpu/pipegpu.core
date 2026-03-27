import type { Context } from "../Context";
import type { FrameStageFormat, TypedArray1DFormat, TypedArray2DFormat } from "../Format";
import type { BufferArrayHandle } from "../Handle";
import { StorageBuffer } from "./StorageBuffer";

/**
 * 
 * mapbuffer is cpu-gps sync buffer.
 * - map read buffer.
 * - map write buffer.
 * - map self buffer. support storage buffer as default. also support query set usage.
 * 
 */
class MapBuffer extends StorageBuffer {
    /**
     * 
     */
    protected mapReadBuffer!: GPUBuffer;

    /**
     * 
     */
    protected mapWriteBuffer!: GPUBuffer;

    /**
     * 
     * @param opts 
     */
    constructor(
        opts: {
            id: number,
            label: string,
            context: Context,
            totalByteLength: number,
            appendixBufferUsageFlags?: number,
            rawDataArray?: TypedArray2DFormat,
            handler?: BufferArrayHandle
        }
    ) {
        super({
            id: opts.id,
            label: opts.label,
            context: opts.context,
            bufferUsageFlags: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC | (opts.appendixBufferUsageFlags || 0),
            totalByteLength: opts.totalByteLength,
            rawDataArray: opts.rawDataArray,
            handler: opts.handler,
        });
    }

    /**
     * 
     *  read buffer.
     *  - copy gpu buffer to read buffer in each frame.
     *  - read buffer support PullSync in CPU stage.
     */
    private createMapReadBuffer = () => {
        let desc: GPUBufferDescriptor = {
            size: this.getByteLength(),
            label: `[MapBuffer][createMapReadBuffer][${this.label}]`,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
        };
        this.mapReadBuffer = this.context?.getGpuDevice().createBuffer(desc) as GPUBuffer;
    }

    /**
     * 
     * write buffer.
     * - copy wirte buffer to gpu-side buffer in each frame.
     * - wirte buffer support PushSnyc in CPU stage.
     * 
     */
    private createMapWriteBuffer = () => {
        let desc: GPUBufferDescriptor = {
            size: this.getByteLength(),
            label: `[MapBuffer][createMapWriteBuffer][${this.label}]`,
            usage: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC
        };
        this.mapWriteBuffer = this.context?.getGpuDevice().createBuffer(desc) as GPUBuffer;
    }

    /**
     * 
     * @description TODO:: fit typedarray format.
     * @deprecated 
     * @param byteOffset 
     * @param byteLength 
     * @param typedArray 
     * @returns 
     * 
     */
    public async PushDataAsync(byteOffset: number, byteLength: number, typedArray: TypedArray1DFormat) {
        if (!this.buffer) {
            this.createGpuBuffer();
        }
        if (!this.mapWriteBuffer) {
            this.createMapWriteBuffer();
        }
        const totalByteLength: number = this.getByteLength();
        if (byteOffset + byteLength > totalByteLength) {
            console.log(`[E][MapBuffer][PushDataAsync] write buffer leak/out of memory: ${byteOffset + byteLength}.`);
            return;
        }
        await this.mapWriteBuffer.mapAsync(GPUMapMode.WRITE, 0, totalByteLength);
        // TODO:: fit typedarray format.
        const resultData: Float32Array = new Float32Array(this.mapWriteBuffer.getMappedRange());
        resultData.set(typedArray, byteOffset);
        this.mapWriteBuffer.unmap();
    }

    /**
     * 
     * @param byteOffset 
     * @param byteLength 
     * @returns 
     */
    public async PullDataAsync(byteOffset?: number, byteLength?: number): Promise<ArrayBuffer | undefined> {
        if (!this.buffer) {
            this.createGpuBuffer();
        }
        if (!this.mapReadBuffer) {
            this.createMapReadBuffer();
        }
        const totalByteLength: number = this.getByteLength();
        const offset = byteOffset || 0;
        const len = byteLength || 0;
        if (offset + len > totalByteLength) {
            throw new Error(`[E][MapBuffer][PullDataAsync] pull gpu-side buffer failed. byte length oversize: ${offset + len}.`);
        }
        await this.mapReadBuffer.mapAsync(GPUMapMode.READ, 0, totalByteLength);
        const arrayBuffer = this.mapReadBuffer.getMappedRange();
        const slicedArrayBuffer = arrayBuffer.slice(0);
        this.mapReadBuffer.unmap();
        return slicedArrayBuffer;
    }

    /**
     * 
     * @param encoder 
     * @param frameStage 
     * @returns 
     * 
     */
    override getGpuBuffer = (encoder: GPUCommandEncoder, frameStage: FrameStageFormat): GPUBuffer => {
        super.getGpuBuffer(encoder, frameStage);
        if (!this.mapReadBuffer) {
            this.createMapReadBuffer();
        }
        if (!this.mapWriteBuffer) {
            this.createMapWriteBuffer();
        }
        if (!this.buffer) {
            this.createGpuBuffer();
        }
        if ('frameFinish' === frameStage && encoder) {
            const byteLength = this.getByteLength();
            encoder.copyBufferToBuffer(this.buffer, this.mapReadBuffer, byteLength);
        }
        return this.buffer as GPUBuffer;
    }
}

export {
    MapBuffer
}
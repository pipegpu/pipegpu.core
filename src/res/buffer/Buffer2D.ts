import { uniqueID } from "../../util/uniqueID";
import type { Context } from "../Context";
import type { FrameStageFormat, TypedArray1DFormat, TypedArray2DFormat } from "../Format";
import type { BufferArrayHandle } from "../Handle";
import { BaseBuffer } from "./BaseBuffer";

/**
 * @description
 * @class Buffer2D
 */
class Buffer2D extends BaseBuffer {
    /**
     * @description
     */
    protected handler?: BufferArrayHandle;

    /**
     * @description
     */
    protected rawDataArray?: TypedArray2DFormat | Array<ArrayBuffer>;

    /**
     * 
     * @param {number}              opts.id 
     * @param {Context}             opts.context
     * @param {number}              opts.totalByteLength
     * @param {GPUBufferUsageFlags} opts.bufferUsageFlags
     * @param {TypedArray2DFormat}  opts.typedArrayData2D
     * @param {BufferArrayHandle}            opts.handler
     * 
     */
    constructor(
        opts: {
            id: number,
            label: string,
            context: Context,
            totalByteLength: number,
            bufferUsageFlags: GPUBufferUsageFlags
            rawData?: TypedArray2DFormat | Array<ArrayBuffer>,
            handler?: BufferArrayHandle,
        }
    ) {
        super({
            id: opts.id,
            label: opts.label,
            context: opts.context,
            totalByteLength: opts.totalByteLength,
            bufferUsageFlags: opts.bufferUsageFlags | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });
        this.rawDataArray = opts.rawData;
        this.handler = opts.handler;
    }

    /**
     * @description
     * @param {number}              offset
     * @param {number}              byteLength
     * @param {TypedArray1DFormat}  rawData
     */
    protected updateGpuBuffer = (offset: number, byteLength: number, rawData: TypedArray1DFormat | ArrayBuffer) => {
        if (offset + byteLength > this.totalByteLength || rawData.byteLength > this.totalByteLength) {
            throw new Error(`[E][VertexBuffer][updateGpuBuffer] ${this.debugLabel}, buffer bytelength oversized, maximum bytelength: ${this.totalByteLength}`);
        }
        try {
            // rawdata perphaps typeof ArrayBuffer
            this.context?.getGpuQueue().writeBuffer(
                this.buffer as GPUBuffer,
                offset,
                rawData as GPUAllowSharedBufferSource,
                // rawData instanceof ArrayBuffer ? rawData : rawData.buffer,
                0
            );
        }
        catch (err) {
            console.error(`[updateGpuBuffer] ${this.debugLabel} error. message: ${err} `);
        }
    }

    /**
     * @description
     * create gpu buffer
     * - with maximum byte length.
     * - write data if typedArrayData2D is valid.
     * - wirte data if handler is valid.
     */
    protected createGpuBuffer = () => {
        if (!this.buffer) {
            const desc: GPUBufferDescriptor = {
                label: `[${this.debugLabel}]`,
                size: this.totalByteLength,
                usage: this.bufferUsageFlags as GPUBufferUsageFlags
            };
            this.buffer = this.context!.getGpuDevice().createBuffer(desc);
        }
        if (this.rawDataArray) {
            let offset: number = 0;
            this.rawDataArray?.forEach(typedArray => {
                this.updateGpuBuffer(offset, typedArray.byteLength, typedArray);
                offset += typedArray.byteLength;
            });
        } 
        else if (this.handler) {
            const handData = this.handler();
            if (handData.rewrite) {
                handData.details.forEach(detail => {
                    if (detail.rawData) {
                        this.updateGpuBuffer(detail.offset, detail.byteLength, detail.rawData);
                    }
                });
            }
        }
    }

    /**
     * @description
     * @param encoder 
     * @param frameStage 
     */
    override refreshGpuBuffer(encoder: GPUCommandEncoder, frameStage: FrameStageFormat): boolean {
        let bDirty: boolean = false;
        if (this.latestTotalByteLength !== this.totalByteLength) {
            this.totalByteLength = this.latestTotalByteLength;
            bDirty ||= true;
            if (!this.buffer) {
                this.createGpuBuffer();
            }
            else {
                const desc: GPUBufferDescriptor = {
                    label: `[${this.debugLabel}]-refresh-${uniqueID()}`,
                    size: this.totalByteLength,
                    usage: this.bufferUsageFlags as GPUBufferUsageFlags
                };
                const releaseBuf = this.buffer;
                this.buffer = this.context!.getGpuDevice().createBuffer(desc);
                encoder.copyBufferToBuffer(releaseBuf, this.buffer);
                this.context?.getGpuDevice().queue.onSubmittedWorkDone().then(() => {
                    releaseBuf.destroy();
                });
            }
        }
        if (!this.buffer) {
            this.createGpuBuffer();
        }
        else {
            if (frameStage === "recordingCommandStart" && this.handler) {
                const handData = this.handler();
                if (handData.rewrite) {
                    handData.details.forEach(detail => {
                        if (detail.rawData) {
                            this.updateGpuBuffer(detail.offset, detail.byteLength, detail.rawData);
                        }
                    });
                }
            }
        }
        return bDirty;
    }

    /**
     * @description
     * @returns
     */
    override getGpuBuffer(): GPUBuffer {
        if (!this.buffer) {
            this.createGpuBuffer();
        }
        return this.buffer as GPUBuffer;
    }

}

export {
    Buffer2D
}
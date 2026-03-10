import { BaseBuffer } from "./BaseBuffer";
import type { Context } from "../Context"
import type { FrameStageFormat, TypedArray1DFormat } from "../Format";
import type { BufferHandle } from "../Handle";

/**
 * @description
 * @class Buffer1D
 */
class Buffer1D extends BaseBuffer {
    /**
     * @description
     */
    protected handler?: BufferHandle;

    /**
    * @description
    */
    protected typedArrayData1D?: TypedArray1DFormat | ArrayBuffer;

    /**
     * 
     * @param {number}              opts.id 
     * @param {Context}             opts.context
     * @param {number}              opts.totalByteLength
     * @param {GPUBufferUsageFlags} opts.bufferUsageFlags
     * @param {TypedArray1DFormat}  [opts.typedArrayData1D]     - either opts.handler or opts.typedArrayData1D must be assigned a value.
     * @param {BufferHandle}       [opts.handler]              - either opts.handler or opts.typedArrayData1D must be assigned a value.
     * 
     */
    constructor(
        opts: {
            id: number,
            context: Context,
            totalByteLength: number,
            bufferUsageFlags: GPUBufferUsageFlags
            rawData?: TypedArray1DFormat | ArrayBuffer,
            handler?: BufferHandle,
        }
    ) {
        super({
            id: opts.id,
            context: opts.context,
            bufferUsageFlags: opts.bufferUsageFlags,
            totalByteLength: opts.totalByteLength,
        });
        this.handler = opts.handler;
        this.typedArrayData1D = opts.rawData;
        if (!this.handler && !this.typedArrayData1D) {
            throw new Error(`[E][Buffer1D][constructor] create buffer error, either opts.handler or opts.typedArrayData1D must be assigned a value.`);
        }
    }

    /**
     * @description
     * @param {number}              offset
     * @param {number}              byteLength
     * @param {TypedArray1DFormat}  rawData
     */
    protected updateGpuBuffer = (offset: number, byteLength: number, rawData: TypedArray1DFormat | ArrayBuffer) => {
        if (offset + byteLength > this.totalByteLength || rawData.byteLength > this.totalByteLength) {
            throw new Error(`[E][VertexBuffer][updateGpuBuffer] buffer bytelength oversized, maximum bytelength: ${this.totalByteLength}`);
        }
        // align 4 byte for input byteLength
        // const algin4 = align4Byte(byteLength);
        this.context?.getGpuQueue().writeBuffer(
            this.buffer as GPUBuffer,
            offset,
            rawData as GPUAllowSharedBufferSource,
            // rawData instanceof ArrayBuffer ? rawData : rawData.buffer,
            0
        );
    }

    /**
     * @description
     */
    protected createGpuBuffer = () => {
        if (!this.buffer) {
            const desc: GPUBufferDescriptor = {
                size: this.totalByteLength,
                usage: this.bufferUsageFlags as GPUBufferUsageFlags
            };
            this.buffer = this.context!.getGpuDevice().createBuffer(desc);
        }
        if (this.typedArrayData1D) {
            this.updateGpuBuffer(0, this.typedArrayData1D!.byteLength, this.typedArrayData1D!);
        } else if (this.handler) {
            const handData = this.handler();
            if (handData.rewrite) {
                this.updateGpuBuffer(handData.detail.offset, handData.detail.byteLength, handData.detail.rawData);
            }
        } else {
            throw new Error(`[E][Buffer1D][createGpuBuffer] create gpu buffer. unsupport source data array.`);
        }
    }

    /**
     * @description
     * @param {(GPUCommandEncoder|null)} encoder 
     * @param {FrameStageFormat} frameStage 
     */
    override getGpuBuffer(encoder: GPUCommandEncoder | null, frameStage: FrameStageFormat): GPUBuffer {
        if (this.latestTotalByteLength !== this.totalByteLength) {
            this.totalByteLength = this.latestTotalByteLength;
            if (!this.buffer) {
                this.createGpuBuffer();
            } else {
                const desc: GPUBufferDescriptor = {
                    size: this.totalByteLength,
                    usage: this.bufferUsageFlags as GPUBufferUsageFlags
                };
                const latestBuffer = this.context!.getGpuDevice().createBuffer(desc);
                encoder?.copyBufferToBuffer(this.buffer, latestBuffer);
                this.buffer.destroy();
                this.buffer = latestBuffer;
            }
        }
        if (!this.buffer) {
            this.createGpuBuffer();
        } else {
            if (frameStage === "frameBegin" && this.handler) {
                const handData = this.handler();
                if (handData.rewrite) {
                    this.updateGpuBuffer(handData.detail.offset, handData.detail.byteLength, handData.detail.rawData);
                }
            }
        }
        return this.buffer as GPUBuffer;
    }

}

export {
    Buffer1D
}
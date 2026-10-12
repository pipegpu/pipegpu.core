import { BaseBuffer } from "./BaseBuffer";
import type { Context } from "../Context"
import type { FrameStageFormat, TypedArray1DFormat } from "../Format";
import type { BufferHandle } from "../Handle";
import { uniqueID } from "../../util/uniqueID";

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
     * @description
     * @param {number}              opts.id 
     * @param {Context}             opts.context
     * @param {number}              opts.totalByteLength
     * @param {GPUBufferUsageFlags} opts.bufferUsageFlags
     * @param {TypedArray1DFormat}  [opts.typedArrayData1D]     - either opts.handler or opts.typedArrayData1D must be assigned a value.
     * @param {BufferHandle}        [opts.handler]              - either opts.handler or opts.typedArrayData1D must be assigned a value.
     */
    constructor(
        opts: {
            id: number,
            label: string,
            context: Context,
            totalByteLength: number,
            bufferUsageFlags: GPUBufferUsageFlags
            rawData?: TypedArray1DFormat | ArrayBuffer,
            handler?: BufferHandle,
        }
    ) {
        super({
            id: opts.id,
            label: opts.label,
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
        try {
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
        catch (err) {
            console.error(`[updateGpuBuffer] ${this.debugLabel} error. message: ${err} `);
        }
    }

    /**
     * @description
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
        if (this.typedArrayData1D) {
            this.updateGpuBuffer(0, this.typedArrayData1D!.byteLength, this.typedArrayData1D!);
        }
        else if (this.handler) {
            const handData = this.handler();
            if (handData.rewrite && handData.detail.rawData) {
                this.updateGpuBuffer(handData.detail.offset, handData.detail.byteLength, handData.detail.rawData);
            }
            handData.detail.rawData = undefined;
        }
        else {
            throw new Error(`[E][Buffer1D][createGpuBuffer] create gpu buffer. unsupport source data array.`);
        }
    }

    /**
     * @description
     *  only pass build stage need call refresh GPUBuffer.
     * @param encoder 
     * @param frameStage 
     */
    override refreshGpuBuffer(encoder: GPUCommandEncoder, frameStage: FrameStageFormat): boolean {
        let bDirty = false;
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
                if (handData.rewrite && handData.detail.rawData) {
                    this.updateGpuBuffer(handData.detail.offset, handData.detail.byteLength, handData.detail.rawData);
                }
                handData.detail.rawData = undefined;
            }
        }
        return bDirty;
    }

    /**
     * @description
     */
    override getGpuBuffer(): GPUBuffer {
        if (!this.buffer) {
            this.createGpuBuffer();
        }
        return this.buffer as GPUBuffer;
    }
}

export {
    Buffer1D
}
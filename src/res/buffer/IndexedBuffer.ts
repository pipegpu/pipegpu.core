import type { Context } from "../Context";
import type { FrameStageFormat } from "../Format";
import { Buffer1D } from "./Buffer1D";

/**
 * 
 * @class IndexedBuffer
 * 
 */
class IndexedBuffer extends Buffer1D {
    /**
     * 
     */
    private indexFormat: GPUIndexFormat;

    /**
     * 
     */
    private drawCount: number;

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
            typedArrayData1D: Uint16Array | Uint32Array,
        }
    ) {
        super({
            id: opts.id,
            label: opts.label,
            context: opts.context,
            totalByteLength: opts.totalByteLength,
            bufferUsageFlags: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            rawData: opts.typedArrayData1D,
        });
        if (this.typedArrayData1D! instanceof Uint16Array) {
            this.indexFormat = 'uint16';
            this.drawCount = this.typedArrayData1D!.byteLength / this.typedArrayData1D!.BYTES_PER_ELEMENT;
        } else if (this.typedArrayData1D! instanceof Uint32Array) {
            this.indexFormat = 'uint32';
            this.drawCount = this.typedArrayData1D!.byteLength / this.typedArrayData1D!.BYTES_PER_ELEMENT;
        } else {
            throw new Error(`[E][IndexBuffer][constructor] index data type error.`);
        }
    }

    /**
     * 
     * @returns {number}
     * 
     */
    getMaxDrawCount = (): number => {
        return this.drawCount;
    }

    /**
     * 
     * @returns {GPUIndexFormat}
     * 
     */
    getIndexFormat = (): GPUIndexFormat => {
        return this.indexFormat;
    }

    /**
     * 
     * @param _encoder 
     * @param frameStage 
     */
    override getGpuBuffer = (_encoder: GPUCommandEncoder | null = null, _frameStage: FrameStageFormat = 'frameBegin'): GPUBuffer => {
        if (!this.buffer) {
            this.createGpuBuffer();
        }
        return this.buffer as GPUBuffer;
    }

}

export {
    IndexedBuffer
}
import type { Context } from "../Context";
import { Buffer1D } from "./Buffer1D";

/**
 * @description
 * @class IndexedBuffer
 */
class IndexedBuffer extends Buffer1D {
    /**
     * @description
     */
    private indexFormat: GPUIndexFormat;

    /**
     * @description
     */
    private drawCount: number;

    /**
     * @description
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
        }
        else if (this.typedArrayData1D! instanceof Uint32Array) {
            this.indexFormat = 'uint32';
            this.drawCount = this.typedArrayData1D!.byteLength / this.typedArrayData1D!.BYTES_PER_ELEMENT;
        }
        else {
            throw new Error(`[E][IndexBuffer][constructor] index data type error.`);
        }
    }

    /**
     * @description
     * @returns {number}
     */
    getMaxDrawCount = (): number => {
        return this.drawCount;
    }

    /**
     * @description
     * @returns {GPUIndexFormat}
     */
    getIndexFormat = (): GPUIndexFormat => {
        return this.indexFormat;
    }

    /**
     * @description
     * @param _encoder 
     * @param frameStage 
     */
    override getGpuBuffer(): GPUBuffer {
        if (!this.buffer) {
            this.createGpuBuffer();
        }
        return this.buffer as GPUBuffer;
    }
}

export {
    IndexedBuffer
}
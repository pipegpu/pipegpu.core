import type { Context } from "../Context";
import type { TypedArray2DFormat } from "../Format";
import type { BufferArrayHandle } from "../Handle";
import { StorageBuffer } from "./StorageBuffer";

/**
 * 
 * https://gpuweb.github.io/gpuweb/#dom-gpurendercommandsmixin-drawindexedindirect
 *   
 * - index_count { 0 };
 * - instance_count { 1 };
 * - first_index { 0 };
 * - vertex_offset { 0 };
 * - first_instance { 0 };
 * 
 */
class IndexedIndirectBuffer extends StorageBuffer {
    /**
     * 
     * @param opts 
     */
    constructor(
        opts: {
            id: number,
            context: Context,
            totalByteLength: number,
            rawDataArray?: TypedArray2DFormat | Array<ArrayBuffer>,
            handler?: BufferArrayHandle,
        }
    ) {
        super({
            id: opts.id,
            context: opts.context,
            totalByteLength: opts.totalByteLength,
            bufferUsageFlags: GPUBufferUsage.INDIRECT | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
            rawDataArray: opts.rawDataArray,
            handler: opts.handler
        });
        // check total bytelength align by 20.
        if (this.totalByteLength % 20 !== 0) {
            throw new Error(`[E][IndirectBuffer] indexed indirect buffer align byte length is 20, please cheack buffer total byte length. current total byte length: ${this.totalByteLength}`);
        }
    }

    /**
     * 
     * @returns 
     */
    getStride = (): number => {
        return 5 * 4;
    }

    /**
     * 
     * @returns 
     */
    getOffset = (): number => {
        return 0;
    }

    /**
     * 
     * @returns 
     */
    getIndexIndirectCount = (): number => {
        return this.rawDataArray?.length || 0;
    }

}

export {
    IndexedIndirectBuffer
}
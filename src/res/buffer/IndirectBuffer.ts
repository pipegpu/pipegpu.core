import { type Context } from "../Context";
import { type TypedArray2DFormat } from "../Format";
import type { BufferArrayHandle } from "../Handle";
import { StorageBuffer } from "./StorageBuffer";

/**
 * 
 * ref:
 * https://toji.dev/webgpu-best-practices/indirect-draws.html
 * 
 * - vertex_count { 0 };
 * - instance_count { 1 };
 * - first_vertex { 0 };
 * - first_instance { 0 };
 * 
 */
class IndirectBuffer extends StorageBuffer {

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
            rawDataArray?: TypedArray2DFormat | Array<ArrayBuffer>,
            handler?: BufferArrayHandle,
        }
    ) {
        super({
            id: opts.id,
            label: opts.label,
            context: opts.context,
            totalByteLength: opts.totalByteLength,
            bufferUsageFlags: GPUBufferUsage.INDIRECT | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
            rawDataArray: opts.rawDataArray,
            handler: opts.handler,
        });
        // check total bytelength align by 16.
        if (this.totalByteLength % 16 !== 0) {
            throw new Error(`[E][IndirectBuffer] indirect buffer align byte length is 16, please cheack buffer total byte length. current total byte length: ${this.totalByteLength}`);
        }
    }

    getStride = (): number => {
        return 4 * 4;
    }

    getOffset = (): number => {
        return 0;
    }

    getIndexIndirectCount = (): number => {
        return this.rawDataArray?.length || 0;
    }

}

export {
    IndirectBuffer
}
import { type Context } from "../Context";
import { type TypedArray1DFormat } from "../Format";
import type { BufferHandle } from "../Handle";
import { Buffer1D } from "./Buffer1D";

/**
 * 
 */
class UniformBuffer extends Buffer1D {

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
            rawData?: TypedArray1DFormat | ArrayBuffer,
            handler?: BufferHandle
        }
    ) {
        super({
            id: opts.id,
            label: opts.label,
            context: opts.context,
            totalByteLength: opts.totalByteLength,
            bufferUsageFlags: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            rawData: opts.rawData,
            handler: opts.handler
        });
    }

}

export {
    UniformBuffer
}
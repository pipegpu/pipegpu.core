import { type Context } from "../Context";
import { type TypedArray2DFormat } from "../Format";
import type { BufferArrayHandle } from "../Handle";
import { Buffer2D } from "./Buffer2D";

/**
 * 
 * @class StorageBuffer
 * 
 */
class StorageBuffer extends Buffer2D {

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
            bufferUsageFlags?: GPUBufferUsageFlags
            rawDataArray?: TypedArray2DFormat | Array<ArrayBuffer>,
            handler?: BufferArrayHandle
        }
    ) {
        super({
            id: opts.id,
            label: opts.label,
            context: opts.context,
            totalByteLength: opts.totalByteLength,
            bufferUsageFlags: opts.bufferUsageFlags || GPUBufferUsage.STORAGE | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            rawData: opts.rawDataArray,
            handler: opts.handler
        });
    }

}

export {
    StorageBuffer
}
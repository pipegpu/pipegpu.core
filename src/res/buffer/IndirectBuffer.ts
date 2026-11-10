import { type Context } from "../Context";
import type { BufferArrayHandle } from "../Handle";
import { StorageBuffer } from "./StorageBuffer";

/**
 * @description
 *  Enumeration of indirect buffer types and their corresponding stride in bytes.
 */
const INDIRECT = {
    DISPATCH_WORKGROUPS_INDIRECT: 12,
    DRAW_INDIRECT: 16,
    MULTI_DRAW_INDIRECT: 16,
    DRAW_INDEXED_INDIRECT: 20,
    MULTI_DRAW_INDEXED_INDIRECT: 20,
};

type INDIRECT_TYPE = keyof typeof INDIRECT;

/**
 * @description
 *  Represents an indirect buffer used for GPU indirect draw calls.
 *  The buffer must be aligned to 16 bytes and contains draw parameters such as vertex count, instance count, etc.
 * 
 * ref:
 * https://developer.mozilla.org/en-US/docs/Web/API/GPURenderPassEncoder/drawIndirect
 * https://developer.mozilla.org/en-US/docs/Web/API/GPURenderPassEncoder/drawIndexedIndirect
 * https://toji.dev/webgpu-best-practices/indirect-draws.html
 * https://developer.mozilla.org/en-US/docs/Web/API/GPUComputePassEncoder/dispatchWorkgroupsIndirect
 * 
 * style 1, drawIndexedIndirect
 * const uint32 = new Uint32Array(5);
 * uint32[0] = 3; // The indexCount value
 * uint32[1] = 1; // The instanceCount value
 * uint32[2] = 0; // The firstIndex value
 * uint32[3] = 0; // The baseVertex value
 * uint32[4] = 0; // The firstInstance value
 * 
 * style 2, drawIndirect
 * const uint32 = new Uint32Array(4);
 * uint32[0] = 3; // The vertexCount value
 * uint32[1] = 1; // The instanceCount value
 * uint32[2] = 0; // The firstVertex value
 * uint32[3] = 0; // The firstInstance value
 * 
 * style 3, dispatchWorkgroupsIndirect
 * const uint32 = new Uint32Array(3);
 * uint32[0] = 25; // The X value
 * uint32[1] = 1; // The Y value
 * uint32[2] = 1; // The Z value
 */
class IndirectBuffer extends StorageBuffer {
    /**
     * @description
     *  Creates an indirect buffer with the specified options.
     *  The buffer must be aligned to 16, 20, or 12 bytes depending on the type of indirect draw call.
     */
    private stride_: number = 0;

    /**
     * @description
     *  The offset within the indirect buffer.
     */
    private offset_: number = 0;

    /**
     * @description
     *  The number of indirect draw calls contained in the buffer.
     */
    private count_: number = 0;

    /**
     * @description
     *  The type of indirect draw call this buffer is used for.
     */
    private indirectType_: INDIRECT_TYPE = 'DRAW_INDIRECT'

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
            rawDataArr?: Uint32Array[],
            handler?: BufferArrayHandle,
        }
    ) {
        super({
            id: opts.id,
            label: opts.label,
            context: opts.context,
            totalByteLength: opts.totalByteLength,
            bufferUsageFlags: GPUBufferUsage.INDIRECT | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
            rawDataArray: opts.rawDataArr,
            handler: opts.handler,
        });

        let item: Uint32Array | undefined = undefined
        if (opts.rawDataArr && opts.rawDataArr.length > 0) {
            item = opts.rawDataArr[0];
        }
        else if (this.handler) {
            const details = this.handler().details;
            if (details && details.length > 0) {
                item = details[0].rawData as Uint32Array;
            }
        }
        if (!item) {
            throw new Error(`[E][IndirectBuffer] buffer: ${opts.label} invalid indirect buffer.`);
        }

        if (item.length === 4 && this.totalByteLength % INDIRECT.DRAW_INDIRECT === 0) {
            this.stride_ = INDIRECT.DRAW_INDIRECT;
            this.count_ = this.totalByteLength / this.stride_;
            this.indirectType_ = this.count_ > 1 ? 'MULTI_DRAW_INDIRECT' : 'DRAW_INDIRECT';
        }
        else if (item.length === 5 && this.totalByteLength % INDIRECT.DRAW_INDEXED_INDIRECT === 0) {
            this.stride_ = INDIRECT.DRAW_INDEXED_INDIRECT;
            this.count_ = this.totalByteLength / this.stride_;
            this.indirectType_ = this.count_ > 1 ? 'MULTI_DRAW_INDEXED_INDIRECT' : 'DRAW_INDEXED_INDIRECT';
        }
        else if (item.length === 3 && this.totalByteLength % INDIRECT.DISPATCH_WORKGROUPS_INDIRECT === 0) {
            this.stride_ = INDIRECT.DISPATCH_WORKGROUPS_INDIRECT;
            this.count_ = this.totalByteLength / this.stride_;
            this.indirectType_ = 'DISPATCH_WORKGROUPS_INDIRECT';
        }
        else {
            throw new Error(`[E][IndirectBuffer] indirect buffer align byte length is 16/20/12, please cheack buffer total byte length. current total byte length: ${this.totalByteLength}`);
        }
    }

    getIndirectType = (): INDIRECT_TYPE => {
        return this.indirectType_;
    }

    getStride = (): number => {
        return this.stride_;
    }

    getOffset = (): number => {
        return this.offset_
    }

    getCount = (): number => {
        return this.count_;
    }
}

export {
    type INDIRECT_TYPE,
    IndirectBuffer
}
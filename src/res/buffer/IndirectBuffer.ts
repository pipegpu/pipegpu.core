import { type Context } from "../Context";
import { type TypedArray2DFormat } from "../Format";
import type { BufferArrayHandle } from "../Handle";
import { StorageBuffer } from "./StorageBuffer";

/**
 * @description
 *  Enumeration of indirect buffer types and their corresponding stride in bytes.
 */
enum INDIRECT_TYPE {
    DISPATCH_WORKGROUPS_INDIRECT = 12,
    DRAW_INDIRECT = 16,
    DRAW_INDEXED_INDIRECT = 20,
    MULTI_DRAW_INDIRECT,
    MULTI_DRAW_INDEXED_INDIRECT
};

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
    private indirectType_: INDIRECT_TYPE = INDIRECT_TYPE.DRAW_INDIRECT;

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

        // align 16, use draw indirect.
        if (this.totalByteLength % INDIRECT_TYPE.DRAW_INDIRECT === 0) {
            this.stride_ = INDIRECT_TYPE.DRAW_INDIRECT;
            this.count_ = this.totalByteLength / this.stride_;
            this.indirectType_ = this.count_ > 1 ? INDIRECT_TYPE.MULTI_DRAW_INDIRECT : INDIRECT_TYPE.DRAW_INDIRECT;
        }
        // align 20, use drawIndexedIndirect.
        else if (this.totalByteLength % INDIRECT_TYPE.DRAW_INDEXED_INDIRECT === 0) {
            this.stride_ = INDIRECT_TYPE.DRAW_INDEXED_INDIRECT;
            this.count_ = this.totalByteLength / this.stride_;
            this.indirectType_ = this.count_ > 1 ? INDIRECT_TYPE.MULTI_DRAW_INDEXED_INDIRECT : INDIRECT_TYPE.DRAW_INDEXED_INDIRECT;
        }
        // align 12, use dispatchWorkgroupsIndirect.
        else if (this.totalByteLength % INDIRECT_TYPE.DISPATCH_WORKGROUPS_INDIRECT === 0) {
            this.stride_ = INDIRECT_TYPE.DISPATCH_WORKGROUPS_INDIRECT;
            this.indirectType_ = INDIRECT_TYPE.DISPATCH_WORKGROUPS_INDIRECT;
            this.count_ = this.totalByteLength / this.stride_;
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
    INDIRECT_TYPE,
    IndirectBuffer
}
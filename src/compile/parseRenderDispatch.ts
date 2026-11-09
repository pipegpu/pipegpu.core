import type { RenderProperty } from "../property/dispatch/RenderProperty";
import type { IndexedBuffer } from "../res/buffer/IndexedBuffer";
import type { IndirectBuffer } from "../res/buffer/IndirectBuffer";
import type { StorageBuffer } from "../res/buffer/StorageBuffer";
import type { PropertyFormat } from "../res/Format";
import type { RenderHandle } from "../res/Handle";

/**
 * @description Parses the render dispatch and returns a render handle.
 */
const parseRenderDispatch = (
    opts: {
        debugLabel: string,
        dispatch: RenderProperty,
        supportsMultiDrawIndirect?: boolean,
    }
): RenderHandle => {
    if (!opts.dispatch) {
        throw new Error(`[E][parseRenderDispatch] ${opts.debugLabel} missing render 'dispatch' in 'RenderLetDesc'.`)
    }
    const t: PropertyFormat = opts.dispatch.getPropertyFormat();
    switch (t) {
        case 'drawCount':
            {
                return (pEncoder: GPURenderPassEncoder, _cEncoder: GPUCommandEncoder): void => {
                    const maxDrawCount: number = opts.dispatch.getMaxDrawCount()!;
                    const instanceCount: number = opts.dispatch.getInstanceCount()!;
                    pEncoder.draw(maxDrawCount, instanceCount);
                };
            }
        case 'drawIndexed':
            {
                return (pEncoder: GPURenderPassEncoder, cEncoder: GPUCommandEncoder): void => {
                    const indexBuffer: IndexedBuffer = opts.dispatch.getIndexBuffer()!;
                    const instanceCount: number = opts.dispatch.getInstanceCount()!;
                    indexBuffer.refreshGpuBuffer(cEncoder, 'recordingCommandStart');
                    pEncoder.setIndexBuffer(indexBuffer.getGpuBuffer(), indexBuffer.getIndexedFormat());
                    pEncoder.drawIndexed(indexBuffer.getMaxDrawCount(), instanceCount, 0, 0, 0);
                };
            }
        case 'drawIndexedStorage':
            {
                return (pEncoder: GPURenderPassEncoder, _cEncoder: GPUCommandEncoder): void => {
                    const indexedBuffer: IndexedBuffer = opts.dispatch.getIndexBuffer()!;
                    const instanceCount: number = opts.dispatch.getInstanceCount()!;
                    pEncoder.setIndexBuffer(indexedBuffer.getGpuBuffer(), indexedBuffer.getIndexedFormat());
                    pEncoder.drawIndexed(indexedBuffer.getMaxDrawCount(), instanceCount, 0, 0, 0);
                };
            };
        case 'drawIndirect':
            {
                return (pEncoder: GPURenderPassEncoder, _cEncoder: GPUCommandEncoder): void => {
                    const indirectBuffer: IndirectBuffer = opts.dispatch.getIndirectBuffer()!;
                    pEncoder.drawIndirect(indirectBuffer.getGpuBuffer(), 0);
                };
            }
        case 'multiDrawIndirect':
            {
                /**
                 * needs:
                 * chromium-experimental-multi-draw-indirect
                 */
                return (pEncoder: GPURenderPassEncoder, cEncoder: GPUCommandEncoder): void => {
                    const indirectBuffer: IndirectBuffer = opts.dispatch.getIndirectBuffer()!;
                    const indirectCountBuffer: StorageBuffer = opts.dispatch.getIndirectCountBuffer()!;
                    const maxDrawCount: number = Math.min(opts.dispatch.getMaxDrawCount()!, 65535 * 64);
                    indirectBuffer.refreshGpuBuffer(cEncoder, 'recordingCommandStart');
                    indirectCountBuffer.refreshGpuBuffer(cEncoder, 'recordingCommandStart');
                    if (opts.supportsMultiDrawIndirect) {
                        (pEncoder as any).multiDrawIndirect(indirectBuffer.getGpuBuffer(), 0, maxDrawCount, indirectCountBuffer.getGpuBuffer(), 0);
                    }
                    else {
                        for (let drawIndex = 0; drawIndex < indirectBuffer.getCount(); drawIndex++) {
                            pEncoder.drawIndirect(indirectBuffer.getGpuBuffer(), drawIndex * indirectBuffer.getStride());
                        }
                    }
                };
            }
        case 'drawIndexedIndirect':
            {
                return (pEncoder: GPURenderPassEncoder, cEncoder: GPUCommandEncoder): void => {
                    const indexedBuffer: IndexedBuffer = opts.dispatch.getIndexBuffer()!;
                    const indexedIndirectBuffer: IndirectBuffer = opts.dispatch.getIndirectBuffer()!;
                    indexedBuffer.refreshGpuBuffer(cEncoder, 'recordingCommandStart');
                    indexedIndirectBuffer.refreshGpuBuffer(cEncoder, 'recordingCommandStart');
                    pEncoder.setIndexBuffer(indexedBuffer.getGpuBuffer(), indexedBuffer.getIndexedFormat());
                    pEncoder.drawIndexedIndirect(indexedIndirectBuffer.getGpuBuffer(), 0);
                };
            }
        case 'multiDrawIndexedIndirect':
            {
                return (pEncoder: GPURenderPassEncoder, cEncoder: GPUCommandEncoder): void => {
                    const indexedBuffer: IndexedBuffer = opts.dispatch.getIndexBuffer()!;
                    const indirectBuffer: IndirectBuffer = opts.dispatch.getIndirectBuffer()!;
                    const indirectCountBuffer: StorageBuffer = opts.dispatch.getIndirectCountBuffer()!;
                    const maxDrawCount: number = Math.min(opts.dispatch.getMaxDrawCount()!, 65535 * 64);
                    indexedBuffer.refreshGpuBuffer(cEncoder, 'recordingCommandStart');
                    pEncoder.setIndexBuffer(indexedBuffer.getGpuBuffer(), indexedBuffer.getIndexedFormat());
                    indirectBuffer.refreshGpuBuffer(cEncoder, 'recordingCommandStart');
                    indirectCountBuffer.refreshGpuBuffer(cEncoder, 'recordingCommandStart');
                    if (opts.supportsMultiDrawIndirect) {
                        (pEncoder as any).multiDrawIndexedIndirect(indirectBuffer.getGpuBuffer(), 0, maxDrawCount, indirectCountBuffer.getGpuBuffer(), 0);
                    }
                    else {
                        for (let drawIndex = 0; drawIndex < indirectBuffer.getCount(); drawIndex++) {
                            pEncoder.drawIndexedIndirect(indirectBuffer.getGpuBuffer(), drawIndex * indirectBuffer.getStride());
                        }
                    }
                };
            }
        default:
            {
                throw new Error(`[E][parseRenderDispatch] ${opts.debugLabel} unsupport render dispatch type:${t} in render 'RenderLetDesc'.`);
            }
    }
}

export {
    parseRenderDispatch
}
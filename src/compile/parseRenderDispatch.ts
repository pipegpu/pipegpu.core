import type { RenderProperty } from "../property/dispatch/RenderProperty"
import type { IndexedBuffer } from "../res/buffer/IndexedBuffer";
import type { IndexedIndirectBuffer } from "../res/buffer/IndexedIndirectBuffer";
import type { IndexedStorageBuffer } from "../res/buffer/IndexedStorageBuffer";
import type { IndirectBuffer } from "../res/buffer/IndirectBuffer";
import type { StorageBuffer } from "../res/buffer/StorageBuffer";
import type { PropertyFormat } from "../res/Format";
import type { RenderHandle } from "../res/Handle";

/**
 * @function parseRenderDispatch
 * @param bufferState 
 * @param dispatch 
 * @param _handler 
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
                    pEncoder.setIndexBuffer(indexBuffer.getGpuBuffer(), indexBuffer.getIndexFormat());
                    pEncoder.drawIndexed(indexBuffer.getMaxDrawCount(), instanceCount, 0, 0, 0);
                };
            }
        case 'drawIndexedStorage':
            {
                return (pEncoder: GPURenderPassEncoder, _cEncoder: GPUCommandEncoder): void => {
                    const indexedStorageBuffer: IndexedStorageBuffer = opts.dispatch.getIndexStorageBuffer()!;
                    const instanceCount: number = opts.dispatch.getInstanceCount()!;
                    pEncoder.setIndexBuffer(indexedStorageBuffer.getGpuBuffer(), indexedStorageBuffer.getIndexedFormat());
                    pEncoder.drawIndexed(indexedStorageBuffer.getMaxDrawCount(), instanceCount, 0, 0, 0);
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
                        for (let drawIndex = 0; drawIndex < maxDrawCount; drawIndex++) {
                            pEncoder.drawIndirect(indirectBuffer.getGpuBuffer(), drawIndex * 16);
                        }
                    }
                };
            }
        case 'drawIndexedIndirect':
            {
                return (pEncoder: GPURenderPassEncoder, cEncoder: GPUCommandEncoder): void => {
                    const indexedStorageBuffer: IndexedStorageBuffer = opts.dispatch.getIndexStorageBuffer()!;
                    const indexedIndirectBuffer: IndexedIndirectBuffer = opts.dispatch.getIndexedIndirectBuffer()!;
                    indexedStorageBuffer.refreshGpuBuffer(cEncoder, 'recordingCommandStart');
                    indexedIndirectBuffer.refreshGpuBuffer(cEncoder, 'recordingCommandStart');
                    pEncoder.setIndexBuffer(indexedStorageBuffer.getGpuBuffer(), indexedStorageBuffer.getIndexedFormat());
                    pEncoder.drawIndexedIndirect(indexedIndirectBuffer.getGpuBuffer(), 0);
                };
            }
        case 'multiDrawIndexedIndirect':
            {
                return (pEncoder: GPURenderPassEncoder, cEncoder: GPUCommandEncoder): void => {
                    const indexedStorageBuffer: IndexedStorageBuffer = opts.dispatch.getIndexStorageBuffer()!;
                    const indexedIndirectBuffer: IndexedIndirectBuffer = opts.dispatch.getIndexedIndirectBuffer()!;
                    const indirectCountBuffer: StorageBuffer = opts.dispatch.getIndirectCountBuffer()!;
                    const maxDrawCount: number = Math.min(opts.dispatch.getMaxDrawCount()!, 65535 * 64);
                    indexedStorageBuffer.refreshGpuBuffer(cEncoder, 'recordingCommandStart');
                    pEncoder.setIndexBuffer(indexedStorageBuffer.getGpuBuffer(), indexedStorageBuffer.getIndexedFormat());
                    indexedIndirectBuffer.refreshGpuBuffer(cEncoder, 'recordingCommandStart');
                    indirectCountBuffer.refreshGpuBuffer(cEncoder, 'recordingCommandStart');
                    if (opts.supportsMultiDrawIndirect) {
                        (pEncoder as any).multiDrawIndexedIndirect(indexedIndirectBuffer.getGpuBuffer(), 0, maxDrawCount, indirectCountBuffer.getGpuBuffer(), 0);
                    }
                    else {
                        for (let drawIndex = 0; drawIndex < maxDrawCount; drawIndex++) {
                            pEncoder.drawIndexedIndirect(indexedIndirectBuffer.getGpuBuffer(), drawIndex * 20);
                        }
                    }
                };
            }
        default:
            {
                throw new Error(`[E][parseRenderDispatch] ${opts.debugLabel} unsupport render dispatch type:${t} in render 'RenderLetDesc'.`)
            }
    }
}

export {
    parseRenderDispatch
}
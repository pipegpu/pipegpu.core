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
    }
): RenderHandle => {
    if (!opts.dispatch) {
        throw new Error(`[E][parseRenderDispatch] ${opts.debugLabel} missing render 'dispatch' in 'RenderHolderDesc'`)
    }
    const t: PropertyFormat = opts.dispatch.getPropertyFormat();
    switch (t) {
        case 'drawCount':
            {
                return (encoder: GPURenderPassEncoder): void => {
                    const maxDrawCount: number = opts.dispatch.getMaxDrawCount()!;
                    const instanceCount: number = opts.dispatch.getInstanceCount()!;
                    encoder.draw(maxDrawCount, instanceCount);
                };
            }
        case 'drawIndexed':
            {
                return (encoder: GPURenderPassEncoder): void => {
                    const indexBuffer: IndexedBuffer = opts.dispatch.getIndexBuffer()!;
                    const instanceCount: number = opts.dispatch.getInstanceCount()!;
                    encoder.setIndexBuffer(indexBuffer.getGpuBuffer(null, 'frameBegin'), indexBuffer.getIndexFormat());
                    encoder.drawIndexed(indexBuffer.getMaxDrawCount(), instanceCount, 0, 0, 0);
                };
            }
        case 'drawIndexedStorage':
            {
                return (encoder: GPURenderPassEncoder): void => {
                    const indexedStorageBuffer: IndexedStorageBuffer = opts.dispatch.getIndexStorageBuffer()!;
                    const instanceCount: number = opts.dispatch.getInstanceCount()!;
                    encoder.setIndexBuffer(indexedStorageBuffer.getGpuBuffer(null, 'frameBegin'), indexedStorageBuffer.getIndexedFormat());
                    encoder.drawIndexed(indexedStorageBuffer.getMaxDrawCount(), instanceCount, 0, 0, 0);
                };
            };
        case 'drawIndirect':
            {
                return (encoder: GPURenderPassEncoder): void => {
                    const indirectBuffer: IndirectBuffer = opts.dispatch.getIndirectBuffer()!;
                    encoder.drawIndirect(indirectBuffer.getGpuBuffer(null, 'frameBegin'), 0);
                };
            }
        case 'multiDrawIndirect':
            {
                /**
                 * needs:
                 * chromium-experimental-multi-draw-indirect
                 */
                return (encoder: GPURenderPassEncoder): void => {
                    const indirectBuffer: IndirectBuffer = opts.dispatch.getIndirectBuffer()!;
                    const indirectCountBuffer: StorageBuffer = opts.dispatch.getIndirectCountBuffer()!;
                    const maxDrawCount: number = Math.min(opts.dispatch.getMaxDrawCount()!, 65535 * 64);
                    (encoder as any).multiDrawIndirect(indirectBuffer.getGpuBuffer(null, 'frameBegin'), 0, maxDrawCount, indirectCountBuffer.getGpuBuffer(null, 'frameBegin'), 0);
                };
            }
        case 'drawIndexedIndirect':
            {
                return (encoder: GPURenderPassEncoder): void => {
                    const indexedStorageBuffer: IndexedStorageBuffer = opts.dispatch.getIndexStorageBuffer()!;
                    const indexedIndirectBuffer: IndexedIndirectBuffer = opts.dispatch.getIndexedIndirectBuffer()!;
                    encoder.setIndexBuffer(indexedStorageBuffer.getGpuBuffer(null, 'frameBegin'), indexedStorageBuffer.getIndexedFormat());
                    encoder.drawIndexedIndirect(indexedIndirectBuffer.getGpuBuffer(null, 'frameBegin'), 0);
                };
            }
        case 'multiDrawIndexedIndirect':
            {
                return (encoder: GPURenderPassEncoder): void => {
                    const indexedStorageBuffer: IndexedStorageBuffer = opts.dispatch.getIndexStorageBuffer()!;
                    const indexedIndirectBuffer: IndexedIndirectBuffer = opts.dispatch.getIndexedIndirectBuffer()!;
                    const indirectCountBuffer: StorageBuffer = opts.dispatch.getIndirectCountBuffer()!;
                    const maxDrawCount: number = Math.min(opts.dispatch.getMaxDrawCount()!, 65535 * 64);
                    encoder.setIndexBuffer(indexedStorageBuffer.getGpuBuffer(null, 'frameBegin'), indexedStorageBuffer.getIndexedFormat());
                    (encoder as any).multiDrawIndexedIndirect(indexedIndirectBuffer.getGpuBuffer(null, 'frameBegin'), 0, maxDrawCount, indirectCountBuffer.getGpuBuffer(null, 'frameBegin'), 0);
                };
            }
        default:
            {
                throw new Error(`[E][parseRenderDispatch] ${opts.debugLabel} unsupport render dispatch type:${t} in render 'RenderHolderDesc'`)
            }
    }
}

export {
    parseRenderDispatch
}
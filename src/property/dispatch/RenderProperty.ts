import { IndexedBuffer } from "../../res/buffer/IndexedBuffer";
import { IndirectBuffer } from "../../res/buffer/IndirectBuffer";
import { StorageBuffer } from "../../res/buffer/StorageBuffer";
import { BaseProperty } from "../BaseProperty";

/**
 * 
 * support dynmaic max draw count.
 * - max draw count
 * @example
 * const maxDrawCountHandler = ():number => {
 *   return 0;
 * }
 * 
 */
type MaxDrawCountHandle = { (): number; }

/**
 * 
 * @class RenderProperty
 * 
 */
class RenderProperty extends BaseProperty {
    /**
     * 
     */
    private maxDrawCount: number = 0;

    /**
     * 
     */
    private maxDrawCountHandler?: MaxDrawCountHandle;

    /**
     * 
     */
    private instanceCount?: number = 1;

    /**
     * 
     */
    private indexBuffer?: IndexedBuffer;

    /**
     * 
     */
    private indirectDrawCountBuffer?: StorageBuffer;

    /**
     * 
     */
    private indirectBuffer?: IndirectBuffer;

    /**
     * 
     * @param maxDrawCount 
     */
    constructor(maxDrawCount: number)
    constructor(maxDrawCount: number, instanceCount: number)
    constructor(indexBuffer: IndexedBuffer)
    constructor(indexBuffer: IndexedBuffer, instanceCount: number)
    constructor(indexBuffer: IndexedBuffer, indexedIndirectBuffer: IndirectBuffer)
    constructor(indexBuffer: IndexedBuffer, indexedIndirectBuffer: IndirectBuffer, indirectDrawCountBuffer: StorageBuffer, maxDrawCount: number)
    constructor(indexBuffer: IndexedBuffer, indexedIndirectBuffer: IndirectBuffer, indirectDrawCountBuffer: StorageBuffer, handler: MaxDrawCountHandle)
    constructor(indirectBuffer: IndirectBuffer)
    constructor(indirectBuffer: IndirectBuffer, indirectDrawCountBuffer: StorageBuffer, maxDrawCount: number)
    constructor(indirectBuffer: IndirectBuffer, indirectDrawCountBuffer: StorageBuffer, handler: MaxDrawCountHandle)
    constructor(a?: IndexedBuffer | IndirectBuffer | number | IndexedBuffer, b?: number | IndirectBuffer | StorageBuffer, c?: StorageBuffer | number | MaxDrawCountHandle, d?: number | MaxDrawCountHandle) {
        super('[RenderProperty][constructor]');
        // maxDrawCount: number
        if (
            typeof a === 'number' &&
            b === undefined &&
            c === undefined &&
            d === undefined
        ) {
            this.propertyFormat = 'drawCount';
            this.maxDrawCount = a;
            this.instanceCount = 1;
        }
        //  maxDrawCount: number, instanceCount: number
        else if (
            typeof a === 'number' &&
            typeof b === 'number' &&
            c === undefined &&
            d === undefined
        ) {
            this.propertyFormat = 'drawCount';
            this.maxDrawCount = a;
            this.instanceCount = b;
        }
        // indexBuffer: IndexedBuffer
        else if (
            a instanceof IndexedBuffer &&
            b == undefined &&
            c === undefined &&
            d == undefined
        ) {
            this.propertyFormat = 'drawIndexed';
            this.indexBuffer = a;
            this.instanceCount = 1;
        }
        // indexBuffer: IndexedBuffer, instanceCount: number
        else if (a instanceof IndexedBuffer && typeof b === 'number' && c === undefined && d === undefined) {
            this.propertyFormat = 'drawIndexed';
            this.indexBuffer = a;
            this.instanceCount = b;
        }
        // indexBuffer: IndexedBuffer, instanceCount: number
        else if (
            a instanceof IndexedBuffer &&
            typeof b === 'number' &&
            c === undefined &&
            d === undefined
        ) {
            this.propertyFormat = 'drawIndexedStorage';
            this.indexBuffer = a;
            this.instanceCount = b;
        }
        // indexStorageBuffer: IndexedStorageBuffer, indexedIndirectBuffer: IndexedIndirectBuffer
        else if (
            a instanceof IndexedBuffer &&
            b instanceof IndirectBuffer &&
            b.getIndirectType() === 'DRAW_INDEXED_INDIRECT' &&
            c == undefined && d == undefined
        ) {
            this.propertyFormat = 'drawIndexedIndirect'
            this.indexBuffer = a;
            this.indirectBuffer = b;
        }
        // indexStorageBuffer: IndexedStorageBuffer, indexedIndirectBuffer: IndexedIndirectBuffer, indirectDrawCountBuffer: StorageBuffer, maxDrawCount: number
        else if (
            a instanceof IndexedBuffer &&
            b instanceof IndirectBuffer &&
            b.getIndirectType() === 'MULTI_DRAW_INDEXED_INDIRECT' &&
            c instanceof StorageBuffer &&
            typeof d === 'number'
        ) {
            this.propertyFormat = 'multiDrawIndexedIndirect'
            this.indexBuffer = a;
            this.indirectBuffer = b;
            this.indirectDrawCountBuffer = c;
            this.maxDrawCount = d;
        }
        // indexStorageBuffer: IndexedStorageBuffer, indexedIndirectBuffer: IndexedIndirectBuffer, indirectDrawCountBuffer: StorageBuffer, handler: MaxDrawCountHandle
        else if (
            a instanceof IndexedBuffer &&
            b instanceof IndirectBuffer &&
            b.getIndirectType() === 'MULTI_DRAW_INDEXED_INDIRECT' &&
            c instanceof StorageBuffer &&
            typeof d === "function" &&
            d.length === 0
        ) {
            this.propertyFormat = 'multiDrawIndexedIndirect'
            this.indexBuffer = a;
            this.indirectBuffer = b;
            this.indirectDrawCountBuffer = c;
            this.maxDrawCountHandler = d;
        }
        // indirectBuffer: IndirectBuffer
        else if (
            a instanceof IndirectBuffer &&
            a.getIndirectType() === 'DRAW_INDIRECT' &&
            b === undefined &&
            c == undefined &&
            d == undefined
        ) {
            this.propertyFormat = 'drawIndirect';
            this.indirectBuffer = a;
        }
        // indirectBuffer: IndirectBuffer, indirectDrawCountBuffer: StorageBuffer, maxDrawCount: number
        else if (
            a instanceof IndirectBuffer &&
            a.getIndirectType() === 'MULTI_DRAW_INDIRECT' &&
            b instanceof StorageBuffer &&
            typeof c === 'number' &&
            d == undefined
        ) {
            this.propertyFormat = 'multiDrawIndirect';
            this.indirectBuffer = a;
            this.indirectDrawCountBuffer = b;
            this.maxDrawCount = c;
        }
        // indirectBuffer: IndirectBuffer, indirectDrawCountBuffer: StorageBuffer, maxDrawCount: MaxDrawCountHandle
        else if (
            a instanceof IndirectBuffer &&
            a.getIndirectType() === 'MULTI_DRAW_INDEXED_INDIRECT' &&
            b instanceof StorageBuffer &&
            typeof c === "function" &&
            c.length === 0 &&
            d === undefined
        ) {
            this.propertyFormat = 'multiDrawIndirect';
            this.indirectBuffer = a;
            this.indirectDrawCountBuffer = b;
            this.maxDrawCountHandler = c;
        }
        else {
            throw new Error(`[E] unsupported 'RenderProperty' constructor.`);
        }
    }

    /**
     * @description Gets the maximum draw count for this render property.
     * @returns The maximum draw count.
     */
    getMaxDrawCount = (): number => {
        if (this.maxDrawCountHandler) {
            return this.maxDrawCountHandler();
        } else {
            return this.maxDrawCount;
        }
    }

    /**
     * @description Gets the instance count for this render property.
     * @returns The instance count.
     */
    getInstanceCount(): number | undefined {
        if (this.instanceCount) {
            return this.instanceCount;
        }
        throw new Error(`[E][RenderProperty][getInstanceCount] indvalid instance count.`);
    }

    /**
     * @description Gets the index buffer associated with this render property.
     * @returns The index buffer.
     */
    getIndexBuffer(): IndexedBuffer | undefined {
        if (this.indexBuffer) {
            return this.indexBuffer;
        }
        throw new Error(`[E][RenderProperty][getIndexBufferID] missing indexBuffer in 'RenderProperty'.`);
    }

    /**
     * @description Gets the index format of the index buffer associated with this render property.
     * @returns The index format of the index buffer.
     */
    getIndexFormat(): GPUIndexFormat {
        if (this.indexBuffer) {
            return this.indexBuffer.getIndexedFormat();
        }
        throw new Error(`[E][RenderProperty][getIndexFormat] missing indexBuffer in 'RenderProperty'.`);
    }

    /**
     * @description Gets the indirect count buffer associated with this render property.
     * @returns The indirect count buffer.
     */
    getIndirectCountBuffer = (): StorageBuffer | undefined => {
        if (this.indirectDrawCountBuffer) {
            return this.indirectDrawCountBuffer;
        }
        throw new Error(`[E][RenderProperty][getIndirectCountBuffer] invalid indirect draw count buffer for multiDrawIndirect.`);
    }

    /**
     * @description Gets the indirect buffer associated with this render property.
     * @returns The indirect buffer.
     */
    getIndirectBuffer = (): IndirectBuffer | undefined => {
        if (this.indirectBuffer) {
            return this.indirectBuffer;
        }
        throw new Error(`[E][RenderProperty][getIndirectCountBuffer] invalid indirect buffer.`)
    }

}

export { RenderProperty };
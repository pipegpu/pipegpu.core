import type { BaseBuffer } from "../res/buffer/BaseBuffer";
import { IndexedBuffer } from "../res/buffer/IndexedBuffer";
import { IndirectBuffer } from "../res/buffer/IndirectBuffer";
import { MapBuffer } from "../res/buffer/Mapbuffer";
import { StorageBuffer } from "../res/buffer/StorageBuffer";
import { UniformBuffer } from "../res/buffer/UniformBuffer";
import { VertexBuffer } from "../res/buffer/VertexBuffer";
import type { Context } from "../res/Context";
import type { TypedArray1DFormat, TypedArray2DFormat } from "../res/Format";
import type { BufferHandle, BufferArrayHandle } from "../res/Handle";
import { uniqueID } from "../util/uniqueID";

/**
 * @description
 */
class BufferState {
    /**
     * @description BufferState manages the creation and storage of various GPU buffer types.
     */
    private static BUFFER_SET: Map<number, BaseBuffer> = new Map();

    /**
     * @description The context associated with this BufferState instance.
     */
    private context: Context;

    /**
     * @description Constructs a new BufferState instance with the given context.
     * @param context The context to associate with this BufferState instance.
     */
    constructor(context: Context) {
        this.context = context;
    }

    /**
     * @description Retrieves a buffer by its ID.
     */
    getBuffer = (bufferID: number): BaseBuffer => {
        if (!BufferState.BUFFER_SET.has(bufferID)) {
            throw new Error(`[E][BufferState][getBuffer] find buffer failed.`);
        }
        else {
            return BufferState.BUFFER_SET.get(bufferID)!;
        }
    }

    /**
     * @description Creates a uniform buffer with the given options.
     * @param opts The options for creating the uniform buffer.
     * @returns The created UniformBuffer instance.
     */
    createUniformBuffer = (
        opts: {
            label: string,
            totalByteLength: number,
            rawData?: TypedArray1DFormat | ArrayBuffer,
            handler?: BufferHandle,
        }
    ): UniformBuffer => {
        const bufferID = uniqueID();
        const buffer: UniformBuffer = new UniformBuffer({
            id: bufferID,
            label: opts.label,
            context: this.context,
            totalByteLength: opts.totalByteLength,
            rawData: opts.rawData,
            handler: opts.handler
        });
        BufferState.BUFFER_SET.set(bufferID, buffer);
        return BufferState.BUFFER_SET.get(bufferID) as UniformBuffer;
    }

    /**
     * @description Creates a map buffer with the given options.
     * @param opts The options for creating the map buffer.
     * @returns The created MapBuffer instance.
     */
    createMapBuffer = (
        opts: {
            label: string,
            totalByteLength: number,
            appendixBufferUsageFlags?: number,
            rawDataArray?: TypedArray2DFormat,
            handler?: BufferArrayHandle
        }
    ): MapBuffer => {
        const bufferID: number = uniqueID();
        const buffer: MapBuffer = new MapBuffer({
            id: bufferID,
            label: opts.label,
            context: this.context,
            totalByteLength: opts.totalByteLength,
            appendixBufferUsageFlags: opts.appendixBufferUsageFlags,
            rawDataArray: opts.rawDataArray,
            handler: opts.handler
        });
        BufferState.BUFFER_SET.set(bufferID, buffer);
        return BufferState.BUFFER_SET.get(bufferID) as MapBuffer;
    }

    /**
     * @description Creates a storage buffer with the given options.
     * @param opts The options for creating the storage buffer.
     * @returns The created StorageBuffer instance.
     */
    createStorageBuffer = (
        opts: {
            label: string,
            totalByteLength: number,
            bufferUsageFlags?: GPUBufferUsageFlags,
            rawDataArray?: TypedArray2DFormat | Array<ArrayBuffer>,
            handler?: BufferArrayHandle
        }
    ): StorageBuffer => {
        const bufferID: number = uniqueID();
        const buffer: StorageBuffer = new StorageBuffer({
            id: bufferID,
            label: opts.label,
            context: this.context,
            totalByteLength: opts.totalByteLength,
            rawDataArray: opts.rawDataArray,
            bufferUsageFlags: opts.bufferUsageFlags,
            handler: opts.handler
        });
        BufferState.BUFFER_SET.set(bufferID, buffer);
        return BufferState.BUFFER_SET.get(bufferID) as StorageBuffer;
    }

    /**
     * @description Creates an indexed buffer with the given options.
     * @param opts The options for creating the indexed buffer.
     * @returns The created IndexedBuffer instance.
     */
    createIndexedBuffer = (
        opts: {
            label: string,
            totalByteLength: number,
            rawDataArray?: Array<Uint16Array> | Array<Uint32Array>,
            handler?: BufferArrayHandle
        }
    ): IndexedBuffer => {
        const bufferID: number = uniqueID();
        const buffer: IndexedBuffer = new IndexedBuffer({
            id: bufferID,
            label: opts.label,
            context: this.context,
            totalByteLength: opts.totalByteLength,
            rawDataArray: opts.rawDataArray,
            handler: opts.handler
        });
        BufferState.BUFFER_SET.set(bufferID, buffer);
        return BufferState.BUFFER_SET.get(bufferID) as IndexedBuffer;
    }

    /**
     * @description Creates a vertex buffer with the given options.
     * @param opts The options for creating the vertex buffer.
     * @returns The created VertexBuffer instance.
     */
    createVertexBuffer = (
        opts: {
            label: string,
            totalByteLength: number,
            rawData?: TypedArray1DFormat
            handler?: BufferHandle
        }
    ): VertexBuffer => {
        const bufferID: number = uniqueID();
        const buffer: VertexBuffer = new VertexBuffer({
            id: bufferID,
            label: opts.label,
            context: this.context,
            totalByteLength: opts.totalByteLength,
            rawData: opts.rawData,
            handler: opts.handler
        });
        BufferState.BUFFER_SET.set(bufferID, buffer);
        return BufferState.BUFFER_SET.get(bufferID) as VertexBuffer;
    }

    /**
     * @description Creates an indirect buffer with the given options.
     * @param opts The options for creating the indirect buffer.
     * @returns The created IndirectBuffer instance.
     */
    createIndirectBuffer = (
        opts: {
            label: string,
            totalByteLength: number,
            rawDataArray?: TypedArray2DFormat | Array<ArrayBuffer>,
            handler?: BufferArrayHandle,
        }
    ): IndirectBuffer => {
        const bufferID: number = uniqueID();
        const buffer: IndirectBuffer = new IndirectBuffer({
            id: bufferID,
            label: opts.label,
            context: this.context,
            totalByteLength: opts.totalByteLength,
            rawDataArray: opts.rawDataArray,
            handler: opts.handler
        });
        BufferState.BUFFER_SET.set(bufferID, buffer);
        return BufferState.BUFFER_SET.get(bufferID) as IndirectBuffer;
    }
}

export {
    BufferState
}
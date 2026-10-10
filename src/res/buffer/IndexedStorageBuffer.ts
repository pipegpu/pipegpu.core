import { uniqueID } from "../../util/uniqueID";
import type { Context } from "../Context";
import type { FrameStageFormat } from "../Format";
import type { BufferArrayHandle } from "../Handle";
import { StorageBuffer } from "./StorageBuffer";

/**
 * @description
 * @class IndexedStorageBuffer
 */
class IndexedStorageBuffer extends StorageBuffer {
    /**
     * @description
     */
    private indexedFormat: GPUIndexFormat = 'uint32';

    /**
     * @description
     */
    private drawCount: number = 0;

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
            rawDataArray?: Array<Uint16Array> | Array<Uint32Array>,
            handler?: BufferArrayHandle
        }
    ) {
        super({
            id: opts.id,
            label: opts.label,
            context: opts.context,
            totalByteLength: opts.totalByteLength,
            bufferUsageFlags: GPUBufferUsage.INDEX | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            rawDataArray: opts.rawDataArray,
            handler: opts.handler,
        });
        // check silced indexed buffer type.
        // TODO runtime 'handle' check WIP.
        if (this.rawDataArray) {
            let format = 'none';
            this.rawDataArray.forEach(typedarray => {
                if (typedarray instanceof Uint16Array && ('uint16' === format || 'none' === format)) {
                    format = 'uint16';
                    this.drawCount += typedarray.length;
                }
                else if (typedarray instanceof Uint32Array && ('uint32' === format || 'none' === format)) {
                    format = 'uint32';
                    this.drawCount += typedarray.length;
                }
                else {
                    throw new Error(`[E][IndexedStorageBuffer][constructor] raw data error. only one type of uint16/uint32 support. and all slice of raw must be the same type.`);
                }
            });
            this.indexedFormat = format as GPUIndexFormat;
        }
    }

    /**
     * TODO::
     * handler type need update.
     * 
     * @returns 
     */
    getIndexedFormat = (): GPUIndexFormat => {
        return this.indexedFormat;
    }

    /**
     * 
     * @returns 
     */
    getMaxDrawCount = (): number => {
        const BYTES_PER_ELEMENT = this.indexedFormat === 'uint16' ? Uint16Array.BYTES_PER_ELEMENT : Uint32Array.BYTES_PER_ELEMENT;
        return this.totalByteLength / BYTES_PER_ELEMENT;
    }

    /**
     * @description
     * @param encoder 
     * @param frameStage 
     */
    override refreshGpuBuffer(encoder: GPUCommandEncoder, frameStage: FrameStageFormat): boolean {
        let bDirty: boolean = false;
        if (this.latestTotalByteLength !== this.totalByteLength) {
            this.totalByteLength = this.latestTotalByteLength;
            bDirty ||= true;
            if (!this.buffer) {
                this.createGpuBuffer();
            }
            else {
                const desc: GPUBufferDescriptor = {
                    label: `[${this.debugLabel}]-refresh-${uniqueID()}`,
                    size: this.totalByteLength,
                    usage: this.bufferUsageFlags as GPUBufferUsageFlags
                };
                const releaseBuf = this.buffer;
                this.buffer = this.context!.getGpuDevice().createBuffer(desc);
                encoder.copyBufferToBuffer(releaseBuf, this.buffer);
                this.context?.getGpuDevice().queue.onSubmittedWorkDone().then(() => {
                    releaseBuf.destroy();
                });
            }
        }
        if (!this.buffer) {
            this.createGpuBuffer();
        }
        else {
            if (frameStage === "recordingCommandStart" && this.handler) {
                const handData = this.handler();
                if (handData.rewrite) {
                    this.drawCount = 0;
                    const BYTES_PER_ELEMENT = this.indexedFormat === 'uint16' ? Uint16Array.BYTES_PER_ELEMENT : Uint32Array.BYTES_PER_ELEMENT;
                    handData.details.forEach(detail => {
                        if (detail.rawData) {
                            this.updateGpuBuffer(detail.offset, detail.byteLength, detail.rawData);
                            this.drawCount += detail.rawData.byteLength / BYTES_PER_ELEMENT;
                        }
                    });
                }
            }
        }
        return bDirty;
    }

    /**
     * @description
     * @param _encoder 
     * @param frameStage 
     * @returns 
     */
    override getGpuBuffer(): GPUBuffer {
        if (!this.buffer) {
            this.createGpuBuffer();
        }
        return this.buffer as GPUBuffer;
    }
}

export {
    IndexedStorageBuffer
}
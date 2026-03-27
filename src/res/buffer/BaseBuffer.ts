import { Context } from "../Context.ts"
import type { FrameStageFormat } from "../Format.ts";

/**
 * @description
 */
abstract class BaseBuffer {
    /**
    * @description
    */
    private id: number;

    /**
     * @description
     */
    protected context: Context | undefined;

    /**
     * @description
     */
    protected bufferUsageFlags: GPUBufferUsageFlags;

    /**
     * @description
     */
    protected buffer!: GPUBuffer;

    /**
    * @description
    */
    protected totalByteLength: number = 0;

    /**
     * @description
     */
    protected latestTotalByteLength: number = 0;

    protected label: string;

    /**
     * 
     */
    constructor(
        opts: {
            id: number,
            label: string,
            context: Context,
            bufferUsageFlags: GPUBufferUsageFlags,
            totalByteLength: number,
        }
    ) {
        this.id = opts.id;
        this.context = opts.context;
        this.label = opts.label;
        this.bufferUsageFlags = opts.bufferUsageFlags;
        this.totalByteLength = this.latestTotalByteLength = opts.totalByteLength;
        if (!this.totalByteLength) {
            throw new Error(`[E][BaseBuffer][constructor] create buffer error, opts.totalByteLength value invalid.`);
        }
    }

    /**
     * 
     * @returns 
     */
    getID = (): number => {
        return this.id;
    }

    /**
     * @returns {number} buffer total byte length.
     */
    getByteLength = (): number => {
        return this.totalByteLength;
    }

    /**
     * @description
     *  expand buffer to new size.
     */
    /**
     * @description
     */
    public expand(byteLength: number): void {
        if (byteLength < this.totalByteLength) {
            return;
        }
        if (byteLength === this.latestTotalByteLength) {
            return;
        }
        this.latestTotalByteLength = byteLength;
    }

    /**
     * 
     * @param encoder 
     * @param frameStage 
     */
    abstract getGpuBuffer(encoder: GPUCommandEncoder | null, frameStage: FrameStageFormat): GPUBuffer;
}

export {
    BaseBuffer
}
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
    protected debugLabel: string;

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

    /**
     * @description
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
        this.debugLabel = opts.label;
        this.bufferUsageFlags = opts.bufferUsageFlags | GPUBufferUsage.COPY_SRC;
        this.totalByteLength = this.latestTotalByteLength = opts.totalByteLength;
        if (!this.totalByteLength) {
            throw new Error(`[E][BaseBuffer][constructor] create buffer error, opts.totalByteLength value invalid.`);
        }
    }

    /**
     * @description
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
    expand(byteLength: number): void {
        if (byteLength < this.totalByteLength) {
            return;
        }
        if (byteLength === this.latestTotalByteLength) {
            return;
        }
        this.latestTotalByteLength = byteLength;
    }

    /**
     * @description
     * @param cEncoder 
     * @param frameStage
     * @returns {boolean} indicate gpubuffer has changed, bind group layout need rebuild if true;
     */
    abstract refreshGpuBuffer(cEncoder: GPUCommandEncoder, frameStage: FrameStageFormat): boolean;

    /**
     * @description
     * @param encoder 
     * @param frameStage 
     */
    abstract getGpuBuffer(): GPUBuffer;
}

export {
    BaseBuffer
}
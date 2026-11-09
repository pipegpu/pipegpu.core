import type { Context } from "../Context";
import { BasePipeline } from "./BasePipeline";

/**
 * @description Compute pipeline class.
 */
class ComputePipeline extends BasePipeline {
    /**
     * @description Get the compute pipeline descriptor.
     */
    private computePipelineDescriptor: GPUComputePipelineDescriptor;

    /**
     * @description Get the GPU compute pipeline.
     */
    private computePipeline: GPUComputePipeline | undefined;

    /**
     * @description Create a compute pipeline.
     * @param opts 
     */
    constructor(
        opts: {
            id: number,
            context: Context,
            computePipelineDescriptor: GPUComputePipelineDescriptor
        }
    ) {
        super({
            id: opts.id,
            context: opts.context,
            propertyFormat: 'computePipeline'
        });
        this.computePipelineDescriptor = opts.computePipelineDescriptor;
    }

    /**
     * @description Create the GPU compute pipeline if it hasn't been created yet.
     */
    private createGpuComputePipeline = (): void => {
        this.computePipeline = this.context.getGpuDevice().createComputePipeline(this.computePipelineDescriptor);
    }

    /**
     * @description Get the GPU compute pipeline, creating it if necessary.
     * @returns {GPUComputePipeline}
     */
    getGpuComputePipeline = (): GPUComputePipeline => {
        if (!this.computePipeline) {
            this.createGpuComputePipeline();
        }

        return this.computePipeline as GPUComputePipeline;
    }
}

export {
    ComputePipeline
}
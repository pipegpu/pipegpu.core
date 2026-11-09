import type { Context } from "../Context";
import { BasePipeline } from "./BasePipeline";

/**
 * @description Render pipeline class.
 * @class RenderPipeline
 */
class RenderPipeline extends BasePipeline {

    /**
    * @description Get the render pipeline descriptor.
    */
    private renderPipelineDescriptor: GPURenderPipelineDescriptor

    /**
     * @description Get the GPU render pipeline.
     */
    private renderPipeline: GPURenderPipeline | undefined;

    /**
     * @description Create a render pipeline.
     * @param opts 
     */
    constructor(
        opts: {
            id: number,
            context: Context,
            renderPipelineDescriptor: GPURenderPipelineDescriptor
        }
    ) {
        super({
            id: opts.id,
            context: opts.context,
            propertyFormat: 'renderPipeline'
        });
        this.renderPipelineDescriptor = opts.renderPipelineDescriptor;
    }

    /**
     * @description Create the GPU render pipeline if it hasn't been created yet.
     */
    private createGpuRenderPipeline = (): void => {
        this.renderPipeline = this.context.getGpuDevice().createRenderPipeline(this.renderPipelineDescriptor);
    }

    /**
     * @description Get the GPU render pipeline, creating it if necessary.
     * @returns {GPURenderPipeline}
     */
    getGpuRenderPipeline = (): GPURenderPipeline => {
        if (!this.renderPipeline) {
            this.createGpuRenderPipeline();
        }

        return this.renderPipeline as GPURenderPipeline;
    }
}

export {
    RenderPipeline
}
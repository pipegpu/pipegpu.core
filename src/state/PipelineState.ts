import type { Context } from "../res/Context"
import type { BasePipeline } from "../res/pipeline/BasePipeline";
import { ComputePipeline } from "../res/pipeline/ComputePipeline";
import { RenderPipeline } from "../res/pipeline/RenderPipeline";
import { uniqueID } from "../util/uniqueID";

/**
 * @description Define the state for managing render and compute pipelines.
 */
class PipelineState {
    /**
     * @description The set of pipelines managed by this state.
     */
    private static PIPELINE_SET: Map<number, BasePipeline> = new Map();

    /**
     * @description The WebGPU context associated with this pipeline state.
     */
    private context: Context;

    /**
     * @description Creates a new PipelineState with the given WebGPU context.
     * @param context The WebGPU context to associate with this pipeline state.
     */
    constructor(context: Context) {
        this.context = context;
    }

    /**
     * @description Retrieves the pipeline with the given ID.
     * @param pipelineID The ID of the pipeline to retrieve.
     * @returns The pipeline with the specified ID, or undefined if not found.
     */
    getPipeline = (pipelineID: number): BasePipeline | undefined => {
        if (!PipelineState.PIPELINE_SET.has(pipelineID)) {
            throw new Error(`[E][PipelineState][getPipeline] find pipeline failed, id: ${pipelineID}`);
        } else {
            return PipelineState.PIPELINE_SET.get(pipelineID);
        }
    }

    /**
     * @description Creates a render pipeline with the given descriptor.
     */
    createRenderPipeline = (renderPipelineDescriptor: GPURenderPipelineDescriptor): RenderPipeline => {
        const renderPipelineID: number = uniqueID();
        const pipeline = new RenderPipeline({
            id: renderPipelineID,
            context: this.context,
            renderPipelineDescriptor: renderPipelineDescriptor
        });
        PipelineState.PIPELINE_SET.set(renderPipelineID, pipeline);
        return this.getPipeline(renderPipelineID) as RenderPipeline;
    }

    /**
     * @description Creates a compute pipeline with the given descriptor.
     * @param computePipelineDescriptor The descriptor for the compute pipeline to create.
     * @returns The created ComputePipeline instance.
     */
    createComputePipeline = (computePipelineDescriptor: GPUComputePipelineDescriptor): ComputePipeline => {
        const computePipelineID: number = uniqueID();
        const pipeline = new ComputePipeline({
            id: computePipelineID,
            context: this.context,
            computePipelineDescriptor: computePipelineDescriptor
        });
        PipelineState.PIPELINE_SET.set(computePipelineID, pipeline);
        return this.getPipeline(computePipelineID) as ComputePipeline;
    }
}

export {
    PipelineState
}
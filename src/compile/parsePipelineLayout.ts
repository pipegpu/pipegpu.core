import type { Context } from "../res/Context";

/**
 * @function parsePipelineLayout
 * @param context
 * @param bindGroupLayouts
 * @returns
 */
const parsePipelineLayout = (
    opts: {
        debugLabel: string,
        context: Context,
        bindGroupLayouts: GPUBindGroupLayout[]
    }
): GPUPipelineLayout => {
    const pipeLineLayoutDescriptor: GPUPipelineLayoutDescriptor = {
        bindGroupLayouts: opts.bindGroupLayouts,
    };
    const pipelineLayout: GPUPipelineLayout = opts.context.getGpuDevice().createPipelineLayout(pipeLineLayoutDescriptor);
    return pipelineLayout;
};

export {
    parsePipelineLayout
}
import type { DepthStencilAttachment } from "../res/attachment/DepthStencilAttachment";
import type { PipelineState } from "../state/PipelineState";

/**
 * @param opts 
 * @returns 
 * @function emitRenderPipeline
 */
const emitRenderPipeline = (
    opts: {
        debugLabel: string,
        vertexState: GPUVertexState,
        pipelineLayout: GPUPipelineLayout,
        pipelineState: PipelineState,
        depthStencilAttachment?: DepthStencilAttachment,
        fragmentState: GPUFragmentState,
        primitiveState: GPUPrimitiveState,
        multisampleState: GPUMultisampleState,
    }
) => {
    const renderPipelineDescriptor: GPURenderPipelineDescriptor = {
        vertex: opts.vertexState,
        layout: opts.pipelineLayout
    };
    renderPipelineDescriptor.multisample = opts.multisampleState;
    renderPipelineDescriptor.primitive = opts.primitiveState;
    renderPipelineDescriptor.fragment = opts.fragmentState;

    if (opts.depthStencilAttachment) {
        renderPipelineDescriptor.depthStencil = opts.depthStencilAttachment.getDepthStencilState();
    }

    return opts.pipelineState.createRenderPipeline(renderPipelineDescriptor);
};

export {
    emitRenderPipeline
}
import type { ColorAttachment } from "../res/attachment/ColorAttachment"
import type { DepthStencilAttachment } from "../res/attachment/DepthStencilAttachment"
import type { Context } from "../res/Context"
import type { RenderHandle, UniformHandle } from "../res/Handle"
import type { RenderPipeline } from "../res/pipeline/RenderPipeline"
import type { BufferState } from "../state/BufferState"
import type { TextureState } from "../state/TextureState"
import { BaseHolder } from "./BaseHolder"

/**
 * 
 */
class RenderHolder extends BaseHolder {
    /**
     * 
     */
    private renderPipeline: RenderPipeline;

    /**
     * 
     */
    private bufferState: BufferState;

    /**
     * 
     */
    private texturteState: TextureState;

    /**
     * 
     */
    private renderHandler: RenderHandle;

    /**
     * 
     */
    private uniformHandler: UniformHandle;

    /**
     * 
     */
    private slotAttributeBufferIDMap: Map<number, number>;

    /**
     * 
     */
    private slotBindGroupMap: Map<number, GPUBindGroup>;

    /**
     * 
     */
    private colorAttachments: ColorAttachment[];

    /**
     * 
     */
    private depthStencilAttachment?: DepthStencilAttachment;

    /**
     * 
     * @param opts 
     */
    constructor(
        opts: {
            debugLabel: string,
            id: number,
            context: Context,
            renderPipeline: RenderPipeline,
            bufferState: BufferState,
            texturteState: TextureState,
            renderHandler: RenderHandle,
            uniformHandler: UniformHandle,
            slotAttributeBufferIDMap: Map<number, number>,
            slotBindGroupMap: Map<number, GPUBindGroup>,
            colorAttachments: ColorAttachment[],
            depthStencilAttachment?: DepthStencilAttachment,
        }
    ) {
        super({
            debugLabel: opts.debugLabel,
            id: opts.id,
            context: opts.context,
            poropertyFormat: 'renderHolder'
        });
        this.renderPipeline = opts.renderPipeline;
        this.bufferState = opts.bufferState;
        this.texturteState = opts.texturteState;
        this.renderHandler = opts.renderHandler;
        this.uniformHandler = opts.uniformHandler;
        this.slotAttributeBufferIDMap = opts.slotAttributeBufferIDMap;
        this.slotBindGroupMap = opts.slotBindGroupMap;
        this.colorAttachments = opts.colorAttachments;
        this.depthStencilAttachment = opts.depthStencilAttachment;
    }

    /**
     * @param encoder 
     */
    override build = (encoder: GPUCommandEncoder): void => {
        // support:
        // uniform update
        // texture update
        // stage - frameBegin
        this.uniformHandler('frameBegin', encoder, this.bufferState, this.texturteState);

        if (this.colorAttachments.length === 0) {
            console.log(`[E][RenderHolder][build] missing color attachment.`);
            return;
        }

        const colorAttachments: GPURenderPassColorAttachment[] = [];
        this.colorAttachments.forEach(element => {
            colorAttachments.push(element.getGpuColorAttachment());
        });

        const desc: GPURenderPassDescriptor = {
            colorAttachments: colorAttachments
        };

        if (this.depthStencilAttachment) {
            desc.depthStencilAttachment = this.depthStencilAttachment.getGpuRenderPassDepthStencilAttachment();
        }

        const encoderRenderPass: GPURenderPassEncoder = encoder.beginRenderPass(desc);
        encoderRenderPass.setPipeline(this.renderPipeline.getGpuRenderPipeline());

        // assign vertex by slot index
        this.slotAttributeBufferIDMap.forEach((bufferID, slotID) => {
            encoderRenderPass.setVertexBuffer(slotID, this.bufferState.getBuffer(bufferID)?.getGpuBuffer(encoder, 'frameBegin'));
        });

        // uniform slot
        // in bind group, texture view settings in compile stage
        this.slotBindGroupMap.forEach((bindGroup, slotID) => {
            encoderRenderPass.setBindGroup(slotID, bindGroup);
        })

        // dispatch
        this.renderHandler(encoderRenderPass);

        // 
        encoderRenderPass.end();

        // update handler
        // stage - frameFinish
        this.uniformHandler('frameFinish', encoder, this.bufferState, this.texturteState);
    }

}

export {
    RenderHolder
}
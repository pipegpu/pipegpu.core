import { BaseLet } from "./BaseLet";

import type { IUniformRecord } from "../compile/parseUniform";
import type { ColorAttachment } from "../res/attachment/ColorAttachment";
import type { DepthStencilAttachment } from "../res/attachment/DepthStencilAttachment";
import type { Context } from "../res/Context";
import type { RenderHandle, UniformHandle } from "../res/Handle";
import type { RenderPipeline } from "../res/pipeline/RenderPipeline";
import type { FragmentShader } from "../res/shader/FragmentShader";
import type { VertexShader } from "../res/shader/VertexShader";
import type { BufferState } from "../state/BufferState";
import type { SamplerState } from "../state/SamplerState";
import type { TextureState } from "../state/TextureState";

/**
 * @description
 */
class RenderLet extends BaseLet {
    /**
     * 
     */
    private renderPipeline: RenderPipeline;

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
    private colorAttachments: ColorAttachment[];

    /**
     * 
     */
    private depthStencilAttachment?: DepthStencilAttachment;

    /**
     * 
     */
    private vs: VertexShader;

    /**
     * 
     */
    private fs: FragmentShader;

    /**
     * 
     * @param opts 
     */
    constructor(
        opts: {
            id: number,
            debugLabel: string,
            context: Context,
            bufferState: BufferState,
            texturteState: TextureState,
            samplerState: SamplerState,
            uniformRecordMap: Map<string, IUniformRecord>,
            gourpIDWithBindGroupLayoutMap: Map<number, GPUBindGroupLayout>,
            gourpIDWithBindGroupLayoutDescriptorMap: Map<number, GPUBindGroupLayoutDescriptor>,
            vs: VertexShader,
            fs: FragmentShader,
            renderPipeline: RenderPipeline,
            slotAttributeBufferIDMap: Map<number, number>,
            colorAttachments: ColorAttachment[],
            depthStencilAttachment?: DepthStencilAttachment,
            renderHandler: RenderHandle,
            uniformHandler: UniformHandle
        }
    ) {
        super({
            debugLabel: opts.debugLabel,
            id: opts.id,
            context: opts.context,
            poropertyFormat: 'renderLet',
            bufferState: opts.bufferState,
            textureState: opts.texturteState,
            samplerState: opts.samplerState,
            uniformRecordMap: opts.uniformRecordMap,
            gourpIDWithBindGroupLayoutMap: opts.gourpIDWithBindGroupLayoutMap,
            gourpIDWithBindGroupLayoutDescriptorMap: opts.gourpIDWithBindGroupLayoutDescriptorMap
        });
        this.vs = opts.vs;
        this.fs = opts.fs;
        this.renderPipeline = opts.renderPipeline;
        this.slotAttributeBufferIDMap = opts.slotAttributeBufferIDMap;
        this.colorAttachments = opts.colorAttachments;
        this.depthStencilAttachment = opts.depthStencilAttachment;
        this.renderHandler = opts.renderHandler;
        this.uniformHandler = opts.uniformHandler;
        this.refreshSlotBindGroupMap({ vs: this.vs, fs: this.fs });
    }

    /**
     * @param cEncoder 
     */
    override build = (cEncoder: GPUCommandEncoder): void => {
        // support:
        // uniform update
        // texture update
        const bDirty: boolean = this.uniformHandler('recordingCommandStart', cEncoder, this.bufferState, this.textureState);

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

        const pEncoder: GPURenderPassEncoder = cEncoder.beginRenderPass(desc);
        pEncoder.setPipeline(this.renderPipeline.getGpuRenderPipeline());

        // assign vertex by slot index
        this.slotAttributeBufferIDMap.forEach((bufferID, slotID) => {
            const vertexBuffer = this.bufferState.getBuffer(bufferID);
            vertexBuffer.refreshGpuBuffer(cEncoder, 'recordingCommandStart');
            pEncoder.setVertexBuffer(slotID, vertexBuffer.getGpuBuffer());
        });

        //
        bDirty ? this.refreshSlotBindGroupMap({ vs: this.vs, fs: this.fs }) : null;

        // uniform slot
        // in bind group, texture view settings in compile stage
        this.slotBindGroupMap.forEach((bindGroup, slotID) => {
            pEncoder.setBindGroup(slotID, bindGroup);
        });

        // dispatch
        this.renderHandler(pEncoder, cEncoder);

        // record pass end.
        pEncoder.end();

        // update handler
        this.uniformHandler('recordingCommandEnd', cEncoder, this.bufferState, this.textureState);
    }
}

export {
    RenderLet
}
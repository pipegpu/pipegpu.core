import { BaseLet, type LetStat } from "./BaseLet";

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
     * @description
     * The GPU render bundle encoder used to record rendering commands.
     */
    private bundleEncoder?: GPURenderBundleEncoder;

    /**
     * @description
     * The GPU render bundle created from the render bundle encoder.
     */
    private renderBundle?: GPURenderBundle;

    /**
     * @description
     * The GPU render handle used to issue rendering commands.  
     */
    private renderHandler: RenderHandle;

    /**
     * @description
     * The GPU uniform handle used to update uniform values.
     */
    private uniformHandler: UniformHandle;

    /**
     * @description
     * The mapping between slot indices and attribute buffer IDs.
     */
    private slotAttributeBufferIDMap: Map<number, number>;

    /**
     * @description
     * The list of color attachments for the render pass.
     */
    private colorAttachments: ColorAttachment[];

    /**
     * @description
     * The depth-stencil attachment for the render pass.
     */
    private depthStencilAttachment?: DepthStencilAttachment;

    /**
     * @description
     * The vertex shader used in the render pipeline.
     */
    private vs: VertexShader;

    /**
     * @description
     * The fragment shader used in the render pipeline.
     */
    private fs: FragmentShader;

    /**
     * @description
     *  Constructs a new RenderLet instance.
     * @param opts The options used to initialize the RenderLet instance.
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
    override build = (cEncoder: GPUCommandEncoder, letStat: LetStat): void => {
        // support:
        // uniform update
        // texture update
        const bDirty: boolean = this.uniformHandler('recordingCommandStart', cEncoder, this.bufferState, this.textureState);

        if (this.colorAttachments.length === 0) {
            console.log(`[E][RenderLet][build] missing color attachment.`);
            return;
        }

        if (bDirty) {
            this.refreshSlotBindGroupMap({ vs: this.vs, fs: this.fs })
        }

        const bSupportMultiDrawIndirect: boolean = this.context.isSupportMultiDrawIndirect();

        if (!bSupportMultiDrawIndirect && (bDirty || !this.bundleEncoder || !this.renderBundle)) {
            const colorFormats: GPUTextureFormat[] = [];
            this.colorAttachments.forEach(element => {
                colorFormats.push(element.getTextureFormat());
            });

            let depthStencilFormat: GPUTextureFormat | undefined = undefined;
            if (this.depthStencilAttachment) {
                depthStencilFormat = this.depthStencilAttachment.getTexture().getTextureFormat();
            }

            const bundleEncoder: GPURenderBundleEncoder = this.bundleEncoder = this.context.getGpuDevice().createRenderBundleEncoder({
                colorFormats: colorFormats,
                depthStencilFormat: depthStencilFormat
            });

            bundleEncoder.setPipeline(this.renderPipeline.getGpuRenderPipeline());

            this.slotAttributeBufferIDMap.forEach((bufferID, slotID) => {
                const vertexBuffer = this.bufferState.getBuffer(bufferID);
                vertexBuffer.refreshGpuBuffer(cEncoder, 'recordingCommandStart');
                bundleEncoder.setVertexBuffer(slotID, vertexBuffer.getGpuBuffer());
            });
            
            this.slotBindGroupMap.forEach((bindGroup, slotID) => {
                bundleEncoder.setBindGroup(slotID, bindGroup);
            });

            this.renderHandler(bundleEncoder, cEncoder);

            this.renderBundle = bundleEncoder.finish();
        }

        const colorAttachments: GPURenderPassColorAttachment[] = [];
        this.colorAttachments.forEach(element => {
            colorAttachments.push(element.getGpuColorAttachment());
        });

        const renderPassDesc: GPURenderPassDescriptor = {
            colorAttachments: colorAttachments,
            depthStencilAttachment: this.depthStencilAttachment?.getGpuRenderPassDepthStencilAttachment(),
            timestampWrites: {
                querySet: letStat.timeStampQuerySet,
                beginningOfPassWriteIndex: letStat.startIndex,
                endOfPassWriteIndex: letStat.endIndex
            }
        };

        const pEncoder = cEncoder.beginRenderPass(renderPassDesc);

        if (bSupportMultiDrawIndirect) {
            pEncoder.setPipeline(this.renderPipeline.getGpuRenderPipeline());

            this.slotAttributeBufferIDMap.forEach((bufferID, slotID) => {
                const vertexBuffer = this.bufferState.getBuffer(bufferID);
                vertexBuffer.refreshGpuBuffer(cEncoder, 'recordingCommandStart');
                pEncoder.setVertexBuffer(slotID, vertexBuffer.getGpuBuffer());
            });

            this.slotBindGroupMap.forEach((bindGroup, slotID) => {
                pEncoder.setBindGroup(slotID, bindGroup);
            });

            this.renderHandler(pEncoder, cEncoder);
        }
        else {
            pEncoder.executeBundles([this.renderBundle!]);
        }

        pEncoder.end();

        // update handler
        this.uniformHandler('recordingCommandEnd', cEncoder, this.bufferState, this.textureState);
    }
}

export {
    RenderLet
}
import type { BaseAttachment } from "../res/attachment/BaseAttachment";
import { ColorAttachment } from "../res/attachment/ColorAttachment";
import { DepthStencilAttachment } from "../res/attachment/DepthStencilAttachment";
import type { Context } from "../res/Context";
import type { BlendFormat, ColorLoadStoreFormat, DepthLoadStoreFormat, StencilLoadStoreFormat, StencilStateFormat } from "../res/Format";
import type { BaseTexture } from "../res/texture/BaseTexture";
import type { Texture2D } from "../res/texture/Texture2D";
import { uniqueID } from "../util/uniqueID";

/**
 * 
 */
class AttachmentState {

    /**
     * 
     */
    private static ATTACHMENT_SET: Map<number, BaseAttachment> = new Map();

    /**
     * 
     */
    private context: Context;

    /**
     * 
     * @param context 
     * 
     */
    constructor(context: Context) {
        this.context = context;
    }

    /**
     * 
     * @param attachmentID 
     * @returns 
     * 
     */
    getAttachment = (attachmentID: number): BaseAttachment | undefined => {
        if (!AttachmentState.ATTACHMENT_SET.has(attachmentID)) {
            throw new Error(`[E]][AttachmentState][getAttachment] find attachment id: ${attachmentID} failed.`);
        }
        return AttachmentState.ATTACHMENT_SET.get(attachmentID);
    }

    /**
     * 
     * @param opts 
     * @returns 
     */
    createColorAttachment = (
        opts: {
            texture: BaseTexture,
            blendFormat?: BlendFormat,
            colorLoadStoreFormat?: ColorLoadStoreFormat,
            clearColor?: number[]
        }
    ): ColorAttachment => {
        const colorAttachmentID: number = uniqueID();
        if (!AttachmentState.ATTACHMENT_SET.has(colorAttachmentID)) {
            const colorAttachment: ColorAttachment = new ColorAttachment({
                id: colorAttachmentID,
                context: this.context,
                texture: opts.texture,
                blendFormat: opts.blendFormat,
                colorLoadStoreFormat: opts.colorLoadStoreFormat,
                clearColor: opts.clearColor
            });
            AttachmentState.ATTACHMENT_SET.set(colorAttachmentID, colorAttachment);
        }
        return AttachmentState.ATTACHMENT_SET.get(colorAttachmentID) as ColorAttachment;
    }

    /**
     * 
     * @param opts 
     * @returns 
     */
    createDepthStencilAttachment = (
        opts: {
            texture: Texture2D,
            depthBias?: number,
            depthBiasSlopeScale?: number,
            depthLoadStoreFormat?: DepthLoadStoreFormat,
            depthCompareFunction?: GPUCompareFunction,
            stencilFunctionFormat?: StencilStateFormat,
            stencilLoadStoreFormat?: StencilLoadStoreFormat,
            depthReadOnly?: boolean,
            depthClearValue?: number,
            stencilReadOnly?: boolean
            stencilClearValue?: number,
        }
    ): DepthStencilAttachment => {
        const depthStencilAttachmentID: number = uniqueID();
        if (!AttachmentState.ATTACHMENT_SET.has(depthStencilAttachmentID)) {
            const depthStencilAttachment: DepthStencilAttachment = new DepthStencilAttachment({
                id: depthStencilAttachmentID,
                context: this.context,
                texture: opts.texture,
                depthBias: opts.depthBias,
                depthBiasSlopeScale: opts.depthBiasSlopeScale,
                depthLoadStoreFormat: opts.depthLoadStoreFormat,
                depthCompareFunction: opts.depthCompareFunction,
                stencilFunctionFormat: opts.stencilFunctionFormat,
                stencilLoadStoreFormat: opts.stencilLoadStoreFormat,
                depthReadOnly: opts.depthReadOnly,
                depthClearValue: opts.depthClearValue,
                stencilReadOnly: opts.stencilReadOnly,
                stencilClearValue: opts.stencilClearValue,
            });
            AttachmentState.ATTACHMENT_SET.set(depthStencilAttachmentID, depthStencilAttachment);
        }
        return AttachmentState.ATTACHMENT_SET.get(depthStencilAttachmentID) as DepthStencilAttachment;
    }

}

export {
    AttachmentState
}
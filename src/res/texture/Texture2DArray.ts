import type { Context } from "../Context";
import type { FrameStageFormat, TypedArray2DFormat } from "../Format";
import type { TextureArrayHandle } from "../Handle";
import { BaseTexture } from "./BaseTexture";

/**
 * @description
 * support:
 * - use as texture binding.
 * - use as render attachment.
 * @class Texture2DArray
 */
class Texture2DArray extends BaseTexture {
    /**
     * 
     */
    protected textureData2DArray?: TypedArray2DFormat;

    /**
     * 
     */
    protected handler?: TextureArrayHandle;

    /**
     * 
     * @param opts 
     */
    constructor(
        opts: {
            id: number,
            context: Context,
            width: number,
            height: number,
            depthOrArrayLayers: number,
            appendixTextureUsages?: number,
            textureDataArray?: TypedArray2DFormat,
            handler?: TextureArrayHandle,
            textureFormat?: GPUTextureFormat,
            mipmapCount?: number
        }
    ) {
        super({
            id: opts.id,
            context: opts.context,
            width: opts.width,
            height: opts.height,
            depthOrArrayLayers: opts.depthOrArrayLayers,
            textureUsageFlags: (opts.appendixTextureUsages || 0) | GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
            textureFormat: opts.textureFormat,
            mipmapCount: opts.mipmapCount,
            propertyFormat: 'texture2DArray'
        });
        this.textureData2DArray = opts.textureDataArray;
        this.handler = opts.handler;
    }

    /**
     * 
     */
    protected refreshTextureDataSource() {
        if (this.textureData2DArray && this.textureData2DArray.length > 0 && !this.isDetphTexture()) {
            const destination: GPUTexelCopyTextureInfo = {
                texture: this.texture!
            };
            const dataLayout: GPUTexelCopyBufferLayout = this.getTexelCopyBufferLayout();
            const oneLayerExtent3d: GPUExtent3DDict = {
                width: this.width,
                height: this.height,
                depthOrArrayLayers: 1,
            };
            for (let index: number = 0, len = this.textureData2DArray.length; index < len; index++) {
                destination.origin = [0, 0, index];
                this.context.getGpuQueue().writeTexture(destination, (this.textureData2DArray[index] as Uint8Array).buffer, dataLayout, oneLayerExtent3d);
            }
            // clear
            this.textureData2DArray.length = 0;
            this.textureData2DArray = undefined;
        } else if (this.handler && !this.isDetphTexture()) {
            const handData = this.handler();
            if (handData.rewrite) {
                const destination: GPUTexelCopyTextureInfo = {
                    texture: this.texture!
                };
                const dataLayout: GPUTexelCopyBufferLayout = this.getTexelCopyBufferLayout();
                const oneLayerExtent3d: GPUExtent3DDict = {
                    width: this.width,
                    height: this.height,
                    depthOrArrayLayers: 1,
                };
                handData.details.forEach(detail => {
                    destination.origin = [0, 0, detail.depthOrArrayLayerIndex];
                    this.context.getGpuQueue().writeTexture(destination, (detail.rawData as Uint8Array).buffer, dataLayout, oneLayerExtent3d);
                });
                // clear
                handData.details.length = 0
            }
        }
    }

    /**
     * 
     */
    protected override createGpuTexture(): void {
        const desc: GPUTextureDescriptor = {
            label: `[TextureArray]`,
            size: this.extent3d,
            format: this.textureFormat,
            usage: this.textureUsageFlags,
            dimension: this.getTextureDimension(),
            mipLevelCount: this.mipmapCount
        };
        this.texture = this.context.getGpuDevice().createTexture(desc);
        this.refreshTextureDataSource();
    }

    /**
     * 
     * @param _encoder 
     * @param frameStage 
     * @returns 
     */
    override getGpuTexture(_encoder?: GPUCommandEncoder, _frameStage?: FrameStageFormat): GPUTexture {
        if (!this.texture) {
            this.createGpuTexture();
        }
        this.refreshTextureDataSource();
        return this.texture!;
    }

    /**
     * 
     * @returns 
     */
    override getGpuTextureView(): GPUTextureView {
        switch (this.selectedUsage) {
            case 'RENDER_ATTACHMENT':
                {
                    return this.renderAttachmentView!;
                }
            case 'TEXTURE_BINDING':
                {
                    return this.textureBindingView!;
                }
            case 'STORAGE_BINDING':
                {
                    const mipView = this.storageBindingView![this.mipCurosr];
                    this.nextCursor();
                    return mipView;
                }
            case 'NONE':
            default: {
                throw new Error(`[E][Texture2DArray][getGpuTextureView] error occurs in get gpu texture array view. for no 'useAs..' function called before compiler.`);
            }
        }
    }

    /**
    * e.g use texture as storage binding for compute shader
    */
    override useAsStorageBinding = () => {
        if (!this.isUsageIncludeStorageBinding()) {
            throw Error(`[E][Texture][useAsStorageBinding] ${typeof (this)} has no usage include 'GPUTextureUsage.STORAGE_BINDING', please check.`);
        }
        this.selectedUsage = 'STORAGE_BINDING';
        if (!this.texture) {
            this.createGpuTexture();
        }
        if (!this.storageBindingView) {
            this.storageBindingView = [];
            for (let k = 0; k < this.mipmapCount; k++) {
                const desc: GPUTextureViewDescriptor = {};
                desc.baseArrayLayer = 0;
                desc.arrayLayerCount = (this.extent3d as GPUExtent3DDict).depthOrArrayLayers;
                desc.baseMipLevel = k;
                desc.mipLevelCount = 1;
                switch (this.textureFormat) {
                    case 'depth16unorm':
                    case 'depth24plus':
                    case 'depth32float':
                        {
                            desc.aspect = 'depth-only';
                            desc.mipLevelCount = 1;
                            break;
                        }
                    case 'stencil8':
                        {
                            desc.aspect = 'stencil-only';
                            desc.mipLevelCount = 1;
                            break;
                        }
                    case 'depth24plus-stencil8':
                    case 'depth32float-stencil8':
                        {
                            desc.aspect = 'depth-only';
                            desc.mipLevelCount = 1;
                            console.warn(`[W][Texture2D][getGpuTextureView] texture depth24plus-stencil8/depth32float-stencil8 are not 
                                        recommanded because we cannot guess it's aspect, so we use depth-only force. Therefore, we recommend using 
                                        depth16unorm'/'depth24plus'/'depth32float' for depth-only and 'stencil8' for stencil-only.`)
                            break;
                        };
                    default: {
                        desc.aspect = 'all';
                        break;
                    }
                }
                desc.dimension = this.getTextureViewDimension();
                desc.format = this.textureFormat;
                this.storageBindingView[k] = (this.texture as GPUTexture).createView(desc);
            }
        }
    }

    /**
     * @function useAsTextureBinding
     */
    override useAsTextureBinding = () => {
        if (!this.isUsageIncludeTextureBinding()) {
            throw Error(`[E][Texture][useAsTextureBinding] ${typeof (this)} has no usage include 'GPUTextureUsage.TEXTURE_BINDING', please check.`);
        }
        this.selectedUsage = 'TEXTURE_BINDING';
        if (!this.texture) {
            this.createGpuTexture();
        }
        if (!this.textureBindingView) {
            const desc: GPUTextureViewDescriptor = {};
            desc.baseArrayLayer = 0;
            desc.arrayLayerCount = (this.extent3d as GPUExtent3DDict).depthOrArrayLayers;
            desc.baseMipLevel = 0;
            desc.mipLevelCount = this.mipmapCount;
            switch (this.textureFormat) {
                case 'depth16unorm':
                case 'depth24plus':
                case 'depth32float':
                    {
                        desc.aspect = 'depth-only';
                        desc.mipLevelCount = 1;
                        break;
                    }
                case 'stencil8':
                    {
                        desc.aspect = 'stencil-only';
                        desc.mipLevelCount = 1;
                        break;
                    }
                case 'depth24plus-stencil8':
                case 'depth32float-stencil8':
                    {
                        desc.aspect = 'depth-only';
                        desc.mipLevelCount = 1;
                        console.warn(`[W][Texture2D][getGpuTextureView] texture depth24plus-stencil8/depth32float-stencil8 are not 
                                    recommanded because we cannot guess it's aspect, so we use depth-only force. Therefore, we recommend using 
                                    depth16unorm'/'depth24plus'/'depth32float' for depth-only and 'stencil8' for stencil-only.`)
                        break;
                    };
                default: {
                    desc.aspect = 'all';
                    break;
                }
            }
            desc.dimension = this.getTextureViewDimension();
            desc.format = this.textureFormat;
            this.textureBindingView = (this.texture as GPUTexture).createView(desc);
        }
    }

    /**
     * use as render attachment.
     * only support 'index' texture2D as render attachment, default is 0
     * @function useAsRenderAttachment
     */
    override useAsRenderAttachment = (index: number = 0) => {
        if (!this.isUsageIncludeTextureBinding()) {
            throw Error(`[E][Texture][useAsRenderAttachment] ${typeof (this)} has no usage include 'GPUTextureUsage.RENDER_ATTACHMENT', please check.`);
        }
        this.selectedUsage = 'RENDER_ATTACHMENT';
        if (!this.texture) {
            this.createGpuTexture();
        }
        if (!this.renderAttachmentView) {
            const desc: GPUTextureViewDescriptor = {};
            desc.baseArrayLayer = index;
            desc.arrayLayerCount = 1;
            desc.baseMipLevel = 0;
            desc.mipLevelCount = 1;
            desc.dimension = this.getTextureViewDimension();
            desc.format = this.textureFormat;
            this.renderAttachmentView = (this.texture as GPUTexture).createView(desc);
        }
    }
}

export {
    Texture2DArray
}
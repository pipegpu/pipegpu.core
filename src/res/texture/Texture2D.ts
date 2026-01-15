import type { Context } from "../Context";
import type { FrameStageFormat, TypedArray1DFormat } from "../Format";
import { BaseTexture } from "./BaseTexture";

/**
 * @description
 * @class Texture2D
 */
class Texture2D extends BaseTexture {
    /**
     * 
     */
    protected textureData?: TypedArray1DFormat;

    /**
    * https://github.com/pipegpu/pipegpu.core/issues/16
    * indicator auto increment mip level in storage binding use
    */
    private autoIncrementMipLevelInStorageBindingUse: boolean = false;

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
            appendixTextureUsages?: number,
            textureData?: TypedArray1DFormat,
            textureFormat?: GPUTextureFormat,
            mipmapCount?: number,
        }
    ) {
        super({
            id: opts.id,
            context: opts.context,
            width: opts.width,
            height: opts.height,
            depthOrArrayLayers: 1,
            textureUsageFlags: (opts.appendixTextureUsages || 0) | GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
            textureFormat: opts.textureFormat,
            mipmapCount: opts.mipmapCount,
            propertyFormat: 'texture2D'
        });
        this.textureData = opts.textureData;
    }

    /**
     * https://github.com/pipegpu/pipegpu.core/issues/16
     * @param enable 
     */
    public AutoIncrementMipLevelInStorageBinding = (enable: boolean) => {
        this.autoIncrementMipLevelInStorageBindingUse = enable;
    }

    /**
     * 
     */
    protected refreshTextureDataSource() {
        // depth texture not allow texture write from cpu.
        if (this.textureData && !this.isDetphTexture()) {
            const destination: GPUTexelCopyTextureInfo = {
                texture: this.texture!
            };
            const dataLayout: GPUTexelCopyBufferLayout = this.getTexelCopyBufferLayout();
            this.context.getGpuQueue().writeTexture(
                destination,
                this.textureData as GPUAllowSharedBufferSource,
                dataLayout,
                this.extent3d
            );
            this.textureData = undefined;
        }
    }

    /**
     * 
     */
    protected override createGpuTexture(): void {
        const desc: GPUTextureDescriptor = {
            size: this.extent3d,
            format: this.textureFormat,
            usage: this.textureUsageFlags,
            mipLevelCount: this.mipmapCount,
        };
        // write texture
        this.texture = this.context.getGpuDevice().createTexture(desc);
        this.refreshTextureDataSource();
    }

    /**
     * @description
     * @param encoder 
     * @param frameStage 
     */
    override getGpuTexture = (_encoder?: GPUCommandEncoder, _frameStage?: FrameStageFormat): GPUTexture => {
        if (!this.texture) {
            this.createGpuTexture();
        }
        return this.texture as GPUTexture;
    }

    /**
     * @override
     * @function getGpuTextureView
     * @returns 
     */
    override getGpuTextureView = (): GPUTextureView => {
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
                    // https://github.com/pipegpu/pipegpu.core/issues/16
                    if (this.autoIncrementMipLevelInStorageBindingUse) {
                        this.nextCursor();
                    }
                    return mipView;
                }
            case 'NONE':
            default: {
                throw new Error(`[E][Texture2D][getGpuTextureView] error occurs in get gpu texture view. for no 'useAs..' function called before compiler.`);
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
                desc.arrayLayerCount = 1;
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
            desc.arrayLayerCount = 1;
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
     * 
     */
    override useAsRenderAttachment = () => {
        if (!this.isUsageIncludeTextureBinding()) {
            throw Error(`[E][Texture][useAsRenderAttachment] ${typeof (this)} has no usage include 'GPUTextureUsage.RENDER_ATTACHMENT', please check.`);
        }
        this.selectedUsage = 'RENDER_ATTACHMENT';
        if (!this.texture) {
            this.createGpuTexture();
        }
        if (!this.renderAttachmentView) {
            const desc: GPUTextureViewDescriptor = {};
            desc.baseArrayLayer = 0;
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
    Texture2D
}
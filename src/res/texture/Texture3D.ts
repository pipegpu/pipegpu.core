import type { Context } from "../Context";
import type { FrameStageFormat, TypedArray2DFormat } from "../Format";
import type { Texture3DHandle } from "../Handle";
import { BaseTexture } from "./BaseTexture";

/**
 * @description
 * @class Texture3D
 */
class Texture3D extends BaseTexture {
    /**
     * @description
     */
    protected textureData?: TypedArray2DFormat;

    /**
     * @description
     */
    protected handler?: Texture3DHandle;

    /**
     * @description
     * @param opts 
     * @param {GPUTextureFormat} opts.textureFormat. texture3d only support color texel format.
     */
    constructor(
        opts: {
            id: number,
            context: Context,
            width: number,
            height: number,
            depth: number,
            appendixTextureUsages?: number,
            textureData?: TypedArray2DFormat,
            handler?: Texture3DHandle,
            textureFormat?: GPUTextureFormat,
            mipmapCount?: number,
        }
    ) {
        super({
            id: opts.id,
            context: opts.context,
            width: opts.width,
            height: opts.height,
            depthOrArrayLayers: opts.depth,
            textureUsageFlags: (opts.appendixTextureUsages || 0) | GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
            textureFormat: opts.textureFormat,
            mipmapCount: opts.mipmapCount,
            propertyFormat: 'texutre3D'
        });
        this.textureData = opts.textureData;
        this.handler = opts.handler;
    }

    /**
     * @description
     */
    protected refreshTextureDataSource() {
        if (this.isDetphTexture()) {
            console.warn(`[W][refreshTextureDataSource] depth texture not allow texture write from cpu.`);
            return;
        }
        if (this.textureData && this.textureData.length > 0) {
            const destination: GPUTexelCopyTextureInfo = {
                texture: this.texture!
            };
            const len = this.textureData.length;
            const oneLayerExtent3d: GPUExtent3DDict = {
                width: this.width,
                height: this.height,
                depthOrArrayLayers: this.depthOrArrayLayers / len,
            };
            const dataLayout: GPUTexelCopyBufferLayout = this.getTexelCopyBufferLayout();
            for (let k: number = 0; k < len; k++) {
                destination.origin = [0, 0, k];
                this.context.getGpuQueue().writeTexture(
                    destination,
                    (this.textureData[k] as Uint8Array).buffer,
                    dataLayout,
                    oneLayerExtent3d
                );
            }
            // clear
            this.textureData.length = 0;
            this.textureData = undefined;
        } else if (this.handler) {
            let handData = this.handler();
            if (!handData.rewrite || handData.details.length === 0) {
                return;
            }
            const destination: GPUTexelCopyTextureInfo = {
                texture: this.texture!
            };
            handData.details.forEach(detail => {
                const dataLayout: GPUTexelCopyBufferLayout = this.getTexelCopyBufferLayout(detail.blockSize[0], detail.blockSize[1]);
                destination.origin = [detail.originXYZ[0], detail.originXYZ[1], detail.originXYZ[2]];
                const blockExtent3d: GPUExtent3DDict = {
                    width: detail.blockSize[0],
                    height: detail.blockSize[1],
                    depthOrArrayLayers: detail.blockSize[2],
                };
                this.context.getGpuQueue().writeTexture(destination, (detail.rawData as Uint8Array).buffer, dataLayout, blockExtent3d);
            });
            handData.details.length = 0;
        }
    }

    /**
     * 
     */
    protected override createGpuTexture(): void {
        const desc: GPUTextureDescriptor = {
            size: this.extent3d,
            dimension: '3d',
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
        this.refreshTextureDataSource();
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
                    throw new Error(`[E][Texture3D][getGpuTextureView] texture3d get render attachment texture view error.`)
                }
            case 'TEXTURE_BINDING':
                {
                    return this.textureBindingView!;
                }
            case 'STORAGE_BINDING':
                {
                    const mipView = this.storageBindingView![this.mipCurosr];
                    return mipView;
                }
            case 'NONE':
            default: {
                throw new Error(`[E][Texture3D][getGpuTextureView] error occurs in get gpu texture view. for no 'useAs..' function called before compiler.`);
            }
        }
    }

    /**
     * @description use texture as storage binding for compute shader.
     */
    override useAsStorageBinding = () => {
        if (!this.isUsageIncludeStorageBinding()) {
            throw Error(`[E][Texture3D][useAsStorageBinding] ${typeof (this)} has no usage include 'GPUTextureUsage.STORAGE_BINDING', please check.`);
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
                    case 'stencil8':
                    case 'depth24plus-stencil8':
                    case 'depth32float-stencil8':
                        {
                            throw new Error(`[E][Texture3D][useAsTextureBinding] not support texture format.`);
                        }
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
            throw Error(`[E][Texture3D][useAsTextureBinding] ${typeof (this)} has no usage include 'GPUTextureUsage.TEXTURE_BINDING', please check.`);
        }
        this.selectedUsage = 'TEXTURE_BINDING';
        if (!this.texture) {
            this.createGpuTexture();
        }
        if (!this.textureBindingView) {
            const desc: GPUTextureViewDescriptor = {};
            desc.baseArrayLayer = 0;
            desc.arrayLayerCount = 1;
            desc.dimension = '3d';
            desc.baseMipLevel = 0;
            desc.mipLevelCount = this.mipmapCount;
            switch (this.textureFormat) {
                case 'depth16unorm':
                case 'depth24plus':
                case 'depth32float':
                case 'stencil8':
                case 'depth24plus-stencil8':
                case 'depth32float-stencil8':
                    {
                        throw new Error(`[E][Texture3D][useAsTextureBinding] not support texture format.`);
                    }
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
        throw new Error(`[E][Texture3D][useAsRenderAttachment] texture3d cannot be used as render attachment.`);
    }
}

export {
    Texture3D
}
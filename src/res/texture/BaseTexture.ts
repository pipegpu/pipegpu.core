import { getMaxMipmapCount } from "../../util/getMaxMipmapLevel";
import type { Context } from "../Context"
import type { FrameStageFormat, PropertyFormat } from "../Format";

/**
 * @param propertyFormat 
 * @returns 
 */
const getTextureViewDimension = (propertyFormat: PropertyFormat): GPUTextureViewDimension => {
    switch (propertyFormat) {
        case 'texture1D':
            return '1d';
        case 'texture2D':
            return '2d';
        case 'texture2DArray':
            return '2d-array';
        case 'textureCube':
            return 'cube';
        case 'texutre3D':
            return '3d'
        case 'textureCubeArray':
            return 'cube-array';
        case 'textureStorage2D':
            return "2d";
        default:
            console.warn(`[W][getTextureViewDimension] unspported texture property format: ${propertyFormat}`);
            return '2d';
    }
}

/**
 * @param propertyFormat 
 * @returns 
 */
const getTextureDimension = (propertyFormat: PropertyFormat): GPUTextureDimension => {
    switch (propertyFormat) {
        case 'texture1D':
            return '1d';
        case 'texture2D':
            return '2d';
        case 'texture2DArray':
            return '2d';
        case 'textureCube':
            return '2d';
        case 'texutre3D':
            return '3d'
        case 'textureCubeArray':
            return '2d';
        case 'textureStorage2D':
            return "2d";
        default:
            console.warn(`[W][getTextureDimension] unspported texture property format: ${propertyFormat}`);
            return '2d';
    }
}

/**
 * @param width 
 * @param height 
 * @param textureFormat 
 * @returns 
 */
const getTexelCopyBufferLayout = (width: number, height: number, textureFormat: GPUTextureFormat): GPUTexelCopyBufferLayout => {
    const layout: GPUTexelCopyBufferLayout = {};
    switch (textureFormat) {
        case 'r8uint':
        case 'r8unorm':
        case 'r8snorm':
        case 'r8sint':
        case 'stencil8':
            {
                layout.bytesPerRow = width;
                layout.rowsPerImage = height;
                break;
            }
        case 'rg8unorm':
        case 'rg8sint':
        case 'r16float':
        case 'r16uint':
        case 'depth16unorm':
        case 'r16sint':
        case 'rg8snorm':
        case 'rg8uint':
        case 'r16unorm':
        case 'r16snorm':
            {
                layout.bytesPerRow = width * 2;
                layout.rowsPerImage = height;
                break;
            }
        case 'rgba8unorm':
        case 'rgba8snorm':
        case 'r32uint':
        case 'r32float':
        case 'r32sint':
        case 'rg32float':
        case 'rg32uint':
        case 'rg32sint':
        case 'rgb10a2unorm':
        case 'rg11b10ufloat':
        case 'depth24plus':
        case 'depth24plus-stencil8':
        case 'depth32float':
        case 'rg16uint':
        case 'rg16float':
        case 'rg16sint':
        case 'rgba16float':
        case 'rgba8unorm-srgb':
        case 'rgba8sint':
        case 'bgra8unorm-srgb':
        case 'rgb10a2uint':
        case 'rgb9e5ufloat':
        case 'eac-r11unorm':
        case 'eac-r11snorm':
        case 'rg16snorm':
        case 'rg16unorm':
            {
                layout.bytesPerRow = width * 4;
                layout.rowsPerImage = height;
                break;
            }
        case 'depth32float-stencil8':
            {
                layout.bytesPerRow = width * 5;
                layout.rowsPerImage = height;
                break;
            }
        case 'rgba16uint':
        case 'rgba16sint':
        case 'eac-rg11unorm':
        case 'eac-rg11snorm':
        case 'rgba16unorm':
        case 'rgba16snorm':
            {
                layout.bytesPerRow = width * 8;
                layout.rowsPerImage = height;
                break;
            }
        case 'rgba32float':
        case 'rgba32uint':
        case 'rgba32sint':
            {
                layout.bytesPerRow = width * 16;
                layout.rowsPerImage = height;
                break;
            }
        case 'bc1-rgba-unorm':
        case 'bc1-rgba-unorm-srgb':
        case 'bc2-rgba-unorm':
        case 'bc2-rgba-unorm-srgb':
        case 'bc3-rgba-unorm':
        case 'bc3-rgba-unorm-srgb':
        case 'bc4-r-snorm':
        case 'bc4-r-unorm':
        case 'bc5-rg-snorm':
        case 'bc5-rg-unorm':
        case 'etc2-rgb8a1unorm':
        case 'etc2-rgb8a1unorm-srgb':
        case 'etc2-rgb8unorm':
        case 'etc2-rgb8unorm-srgb':
        case 'etc2-rgba8unorm':
        case 'etc2-rgba8unorm-srgb':
            {
                layout.bytesPerRow = width / 4 * 8;
                layout.rowsPerImage = height / 4;
                break;
            }
        case 'bc6h-rgb-float':
        case 'bc6h-rgb-ufloat':
        case 'bc7-rgba-unorm':
        case 'bc7-rgba-unorm-srgb':
            {
                layout.bytesPerRow = width / 4 * 16;
                layout.rowsPerImage = height / 4;
                break;
            }
        case 'astc-4x4-unorm':
        case 'astc-4x4-unorm-srgb':
        case 'astc-10x10-unorm':
        case 'astc-10x10-unorm-srgb':
        case 'astc-10x5-unorm':
        case 'astc-10x5-unorm-srgb':
        case 'astc-10x6-unorm':
        case 'astc-10x6-unorm-srgb':
        case 'astc-10x8-unorm':
        case 'astc-10x8-unorm-srgb':
        case 'astc-12x10-unorm':
        case 'astc-12x10-unorm-srgb':
        case 'astc-12x12-unorm':
        case 'astc-12x12-unorm-srgb':
            {
                throw new Error("[E][getTexelCopyBufferLayout] unsupport astc format in PC platform.");
            }
        default:
            {
                throw new Error(`[E][getTexelCopyBufferLayout] unsupport texture format: ${textureFormat}`);
            }
    }
    return layout;
}

/**
 * @class BaseTexture
 * @todo 
 * support multi usage:
 * - texture.UsedAsRenderAttachment(); provide texture render view, set base mip = 0, mip count = 1
 * - texture.UsedAsStorage(); provide texture storage read/write view, set base mip = 0 . 1 .. N, and mip count =1 in each mip level
 * - texture.UsedAsBinding(); provide texture bingindg view, set base mip = 0, mip count = maxMipLevel;
 */
abstract class BaseTexture {
    /**
     * 
     */
    private id: number;

    /**
     * 
     */
    protected textureUsageFlags: GPUTextureUsageFlags;

    /**
     * 
     */
    protected context: Context;

    /**
     * 
     */
    protected texture: GPUTexture | undefined;

    /**
     * 
     */
    protected textureViews: GPUTextureView[] = [];

    /**
     * 
     */
    protected mipCurosr: number = 0;

    /**
     * 
     */
    protected mipmapCount: number = 1;

    /**
     * 
     */
    protected maxMipmapCount: number = 1;

    /**
     * 
     */
    protected extent3d: GPUExtent3D;

    /**
     * 
     */
    protected textureFormat: GPUTextureFormat;

    /**
     * 
     */
    protected width: number;

    /**
     * 
     */
    protected height: number;

    /**
     * 
     */
    protected depthOrArrayLayers: number;

    /**
     * 
     */
    protected propertyFormat: PropertyFormat;

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
            propertyFormat: PropertyFormat,
            textureUsageFlags: number,
            textureFormat?: GPUTextureFormat,
            depthOrArrayLayers?: number,
            mipmapCount?: number
        }
    ) {
        this.id = opts.id;
        this.context = opts.context;
        this.width = opts.width;
        this.height = opts.height;
        if (this.width === 0 || this.height === 0) {
            throw new Error(`[E][Texture] texture parameter error, not support width or height equals 0, please check. texture id:${this.id}`);
        }
        this.depthOrArrayLayers = opts.depthOrArrayLayers || 1;
        this.textureUsageFlags = opts.textureUsageFlags;
        this.extent3d = [opts.width, opts.height, opts.depthOrArrayLayers || 1];
        this.textureFormat = opts.textureFormat || this.context.getPreferredTextureFormat();
        this.propertyFormat = opts.propertyFormat;
        this.maxMipmapCount = getMaxMipmapCount(...this.extent3d);
        if (this.isDetphTexture()) {
            this.mipmapCount = 1;
            this.textureUsageFlags |= GPUTextureUsage.RENDER_ATTACHMENT;
        } else {
            this.mipmapCount = opts.mipmapCount || this.maxMipmapCount;
        }
    }

    /**
     * return texture extends.width
     */
    get Width() {
        return this.width;
    }

    /**
     * return texture extends.height
     */
    get Height() {
        return this.height;
    }

    /**
     * return texture extends.depthOrArrayLayers
     */
    get DepthOrArrayLayers() {
        return this.depthOrArrayLayers;
    }

    /**
     * return assigned mipmapcount
     */
    get MipmapCount() {
        return this.mipmapCount;
    }

    /**
     * return maximum mipmap level count.
     */
    get MaxMipmapCount() {
        return this.maxMipmapCount;
    }

    /**
     * 
     * @returns 
     */
    getPropertyFormat = () => {
        return this.propertyFormat;
    }

    /**
     * 
     * @returns 
     */
    getID = (): number => {
        return this.id;
    }

    /**
     * 
     * @returns 
     */
    getTextureFormat = (): GPUTextureFormat => {
        return this.textureFormat;
    }

    /**
    * depth texture default 
    */
    isDetphTexture = () => {
        return this.textureFormat === 'depth16unorm' ||
            this.textureFormat === 'depth24plus' ||
            this.textureFormat === 'depth24plus-stencil8' ||
            this.textureFormat == 'depth32float' ||
            this.textureFormat == 'depth32float-stencil8';
    }

    /**
     * 
     * @returns 
     */
    isStencilTexture = () => {
        return this.textureFormat === 'stencil8' ||
            this.textureFormat === 'depth24plus-stencil8' ||
            this.textureFormat == 'depth32float-stencil8';
    }

    /**
     *
     * @returns 
     */
    getTextureViewDimension = () => {
        return getTextureViewDimension(this.propertyFormat);
    }

    /**
     * 
     * @returns 
     */
    getTextureDimension = () => {
        return getTextureDimension(this.propertyFormat);
    }

    /**
     * 
     * @returns 
     */
    getTexelCopyBufferLayout = () => {
        return getTexelCopyBufferLayout(this.width, this.height, this.textureFormat);
    }

    /**
     * cursor to next view
     */
    nextCursor = (): void => {
        this.mipCurosr = (++this.mipCurosr) % this.mipmapCount;
    }

    /**
     * 
     * @param absCursor 
     */
    cursor = (absCursor: number): void => {
        this.mipCurosr = absCursor % this.mipmapCount;
    }

    /**
     * 
     */
    protected abstract createGpuTexture(): void;

    /**
     * 
     * @param encoder 
     * @param frameStage 
     */
    abstract getGpuTexture(_encoder?: GPUCommandEncoder, _frameStage?: FrameStageFormat): GPUTexture;

    /**
     * 
     */
    abstract getGpuTextureView(): GPUTextureView;
}

export {
    BaseTexture
}
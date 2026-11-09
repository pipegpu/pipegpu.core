import type { Context } from "../Context";
import type { FrameStageFormat } from "../Format";

/**
 * @description Base sampler class.
 * @abstract
 * @class BaseSampler
 */
abstract class BaseSampler {
    /**
     * @description Get the ID of the sampler.
     */
    private id: number;

    /**
     * @description Get the context of the sampler.
     */
    protected context: Context;

    /**
     * @description Get the GPU sampler.
     */
    protected sampler!: GPUSampler;

    /**
     * @description Get the sampler descriptor.
     */
    protected samplerDesc!: GPUSamplerDescriptor;

    /**
     * @description Get the address mode for the U coordinate.
     */
    protected addressModeU: GPUAddressMode;

    /**
     * @description Get the address mode for the V coordinate.
     */
    protected addressModeV: GPUAddressMode;

    /**
     * @description Get the address mode for the W coordinate.
     */
    protected addressModeW: GPUAddressMode;

    /**
     * @description Get the magnification filter mode.
     */
    protected magFilter: GPUFilterMode;

    /**
     * @description Get the minification filter mode.
     */
    protected minFilter: GPUFilterMode;

    /**
     * @description Get the mipmap filter mode.
     */
    protected mipmapFilter: GPUMipmapFilterMode;

    /**
     * @description Get the minimum level of detail clamp.
     */
    protected lodMinClamp: number;

    /**
     * @description Get the maximum level of detail clamp.
     */
    protected lodMaxClamp: number;

    /**
     * @description Get the anisotropy level.
     */
    protected anisotropy: number;

    /**
     * @description Get the compare function.
     */
    protected compareFunction?: GPUCompareFunction;

    /**
     * @description Get the sampler binding type.
     */
    private samplerBindingType?: GPUSamplerBindingType;

    /**
     * @description Create a new sampler.
     */
    constructor(
        opts: {
            id: number,
            context: Context,
            addressModeU?: GPUAddressMode,
            addressModeV?: GPUAddressMode,
            addressModeW?: GPUAddressMode,
            magFilter?: GPUFilterMode,
            minFilter?: GPUFilterMode,
            mipmapFilter?: GPUMipmapFilterMode,
            lodMinClamp?: number,
            lodMaxClamp?: number
            anisotropy?: number,
            compareFunction?: GPUCompareFunction,
            samplerBindingType?: GPUSamplerBindingType,
        }
    ) {
        this.id = opts.id;
        this.context = opts.context;
        this.addressModeU = opts.addressModeU || 'clamp-to-edge';
        this.addressModeV = opts.addressModeV || 'clamp-to-edge';
        this.addressModeW = opts.addressModeW || 'clamp-to-edge';
        this.magFilter = opts.magFilter || 'nearest';
        this.minFilter = opts.minFilter || 'nearest';
        this.mipmapFilter = opts.mipmapFilter || 'nearest';
        this.lodMinClamp = opts.lodMinClamp || 0.0;
        this.lodMaxClamp = opts.lodMaxClamp || 1.0;
        this.anisotropy = opts.anisotropy || 1;
        this.compareFunction = opts.compareFunction;
        this.samplerBindingType = opts.samplerBindingType || 'filtering';
    }

    /**
     * @description Get the ID of the sampler.
     * @returns {number} The ID of the sampler.
     */
    getID = (): number => {
        return this.id;
    }

    /**
     * @description Get the sampler binding type.
     * @returns {GPUSamplerBindingType | undefined} The sampler binding type.
     */
    get SamplerBindingType() {
        return this.samplerBindingType;
    }

    /**
     * @description Create the GPU sampler if it hasn't been created yet.
     * @returns {GPUSampler} The GPU sampler.
     */
    protected createGpuSampler = (): GPUSampler => {
        if (!this.sampler) {
            this.samplerDesc = {};
            this.samplerDesc.addressModeU = this.addressModeU;
            this.samplerDesc.addressModeV = this.addressModeV;
            this.samplerDesc.addressModeW = this.addressModeW;
            this.samplerDesc.magFilter = this.magFilter;
            this.samplerDesc.minFilter = this.minFilter;
            this.samplerDesc.mipmapFilter = this.mipmapFilter;
            this.samplerDesc.lodMinClamp = this.lodMinClamp;
            this.samplerDesc.lodMaxClamp = this.lodMaxClamp;
            this.samplerDesc.maxAnisotropy = this.anisotropy;
            if (this.compareFunction) {
                // TODO:: default non-compre sampler
                this.samplerDesc.compare = this.compareFunction;
            }
            this.sampler = this.context?.getGpuDevice().createSampler(this.samplerDesc);
        }
        return this.sampler;
    }

    /**
     * @description Get the GPU sampler for the given command encoder and frame stage.
     * @param encoder {GPUCommandEncoder} The command encoder.
     * @param frameStage {FrameStageFormat} The frame stage.
     * @returns {GPUSampler} The GPU sampler.
     */
    public abstract getGpuSampler(_encoder?: GPUCommandEncoder, _frameStage?: FrameStageFormat): GPUSampler;

}

export {
    BaseSampler
}
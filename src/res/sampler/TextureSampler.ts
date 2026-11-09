import type { Context } from "../Context";
import type { FrameStageFormat } from "../Format";
import { BaseSampler } from "./BaseSampler";

/**
 * @class TextureSampler
 * @description Texture sampler class.
 */
class TextureSampler extends BaseSampler {
    /**
     * @description Create a new texture sampler.
     * @param opts The options for creating the texture sampler.
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
            samplerBindingType?: GPUSamplerBindingType,
        }
    ) {
        super(opts);
    }

    /**
     * @description Get the GPU sampler for the given command encoder and frame stage.
     * @param _encoder The command encoder.
     * @param _frameStage The frame stage.
     * @returns {GPUSampler} The GPU sampler.
     */
    override getGpuSampler = (_encoder?: GPUCommandEncoder, _frameStage?: FrameStageFormat): GPUSampler => {
        if (!this.sampler) {
            this.createGpuSampler();
        }
        return this.sampler as GPUSampler;
    }
}

export {
    TextureSampler
}
import type { Context } from "../Context";
import type { FrameStageFormat } from "../Format";
import { BaseSampler } from "./BaseSampler";

/**
 * @description Comparison sampler class.   
 * @class ComparisonSampler
 */
class ComparisonSampler extends BaseSampler {
    /**
     * @description Create a new comparison sampler.
     * @param opts The options for creating the comparison sampler.
     */
    constructor(
        opts: {
            id: number,
            context: Context,
            compareFunction: GPUCompareFunction,
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
    public override getGpuSampler = (_encoder?: GPUCommandEncoder, _frameStage?: FrameStageFormat): GPUSampler => {
        if (!this.sampler) {
            this.createGpuSampler();
        }
        return this.sampler as GPUSampler;
    }
}

export {
    ComparisonSampler
}
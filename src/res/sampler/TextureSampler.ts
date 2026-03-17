import type { Context } from "../Context";
import type { FrameStageFormat } from "../Format";
import { BaseSampler } from "./BaseSampler";

/**
 * @class
 * @description
 */
class TextureSampler extends BaseSampler {
    /**
     * 
     * @param opts 
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
     * 
     * @param _encoder 
     * @param _frameStage 
     * @returns 
     */
    public override getGpuSampler = (_encoder?: GPUCommandEncoder, _frameStage?: FrameStageFormat): GPUSampler => {
        if (!this.sampler) {
            this.createGpuSampler();
        }
        return this.sampler as GPUSampler;
    }

}

export {
    TextureSampler
}
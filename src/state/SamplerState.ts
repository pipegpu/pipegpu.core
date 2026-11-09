import type { Context } from "../res/Context";
import type { BaseSampler } from "../res/sampler/BaseSampler";
import { ComparisonSampler } from "../res/sampler/ComparisonSampler";
import { TextureSampler } from "../res/sampler/TextureSampler";
import { uniqueID } from "../util/uniqueID";

/**
 * @description Define the state for managing texture and comparison samplers.
 * @class SamplerState
 */
class SamplerState {
    /**
     * @description The set of samplers managed by this state.
     */
    private static SAMPLER_SET: Map<number, BaseSampler> = new Map();

    /**
     * @description The WebGPU context associated with this sampler state.
     */
    private context: Context;

    /**
     * @description Creates a new SamplerState with the given WebGPU context.
     * @param context The WebGPU context to associate with this sampler state.
     */
    constructor(context: Context) {
        this.context = context;
    }

    /**
     * @description Retrieves the sampler with the given ID.
     * @param samplerID The ID of the sampler to retrieve.
     * @returns The sampler with the specified ID, or undefined if not found.
     */
    getSampler = (samplerID: number): BaseSampler | undefined => {
        if (!SamplerState.SAMPLER_SET.has(samplerID)) {
            throw new Error(`[E][SamplerState][getSampler] find sampler failed, id: ${samplerID}`);
        }
        return SamplerState.SAMPLER_SET.get(samplerID);
    }

    /**
     * @description Creates a texture sampler with the given options.
     * @param opts The options for creating the texture sampler.
     * @returns The created TextureSampler instance.
     */
    createTextureSampler = (
        opts: {
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
    ): TextureSampler => {
        const samplerID: number = uniqueID();
        const sampler: TextureSampler = new TextureSampler({
            id: samplerID,
            context: this.context,
            addressModeU: opts.addressModeU,
            addressModeV: opts.addressModeV,
            addressModeW: opts.addressModeW,
            magFilter: opts.magFilter,
            minFilter: opts.minFilter,
            mipmapFilter: opts.mipmapFilter,
            lodMinClamp: opts.lodMinClamp,
            lodMaxClamp: opts.lodMaxClamp,
            anisotropy: opts.anisotropy,
            samplerBindingType: opts.samplerBindingType,
        });
        SamplerState.SAMPLER_SET.set(samplerID, sampler);
        return SamplerState.SAMPLER_SET.get(samplerID) as TextureSampler;
    }

    /**
     * @description Creates a comparison sampler with the given options.
     * @param opts The options for creating the comparison sampler.
     * @returns The created ComparisonSampler instance.
     */
    createComparisonSampler = (
        opts: {
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
    ): ComparisonSampler => {
        const samplerID: number = uniqueID();
        const sampler: ComparisonSampler = new ComparisonSampler({
            id: samplerID,
            context: this.context,
            compareFunction: opts.compareFunction,
            addressModeU: opts.addressModeU,
            addressModeV: opts.addressModeV,
            addressModeW: opts.addressModeW,
            magFilter: opts.magFilter,
            minFilter: opts.minFilter,
            mipmapFilter: opts.mipmapFilter,
            lodMinClamp: opts.lodMinClamp,
            lodMaxClamp: opts.lodMaxClamp,
            anisotropy: opts.anisotropy,
            samplerBindingType: opts.samplerBindingType,
        });
        SamplerState.SAMPLER_SET.set(samplerID, sampler);
        return SamplerState.SAMPLER_SET.get(samplerID) as ComparisonSampler;
    }
}

export {
    SamplerState
}
import { FunctionInfo, ResourceType, VariableInfo, WgslReflect } from "wgsl_reflect";
import type { Uniforms } from "../property/Properties";
import type { TextureProperty } from "../property/uniform/TextureProperty";
import type { TextureSamplerProperty } from "../property/uniform/TextureSamplerProperty";

/**
 * 
 */
interface IReflectUniforms {
    bindGroupCount: number,
    groupIDwithBindGroupLayoutEntriesMap: Map<number, Array<GPUBindGroupLayoutEntry>>,
    groupIDwithResourceBindingsMap: Map<number, Array<VariableInfo>>
}

/**
 * @deprecated sampler binding type related with input unifomrs.
 * @param t 
 */
// const getSamplerBindingType = (binding: VariableInfo): GPUSamplerBindingType => {
//     if (binding.resourceType === ResourceType.Sampler) {
//         return "filtering";
//     }
//     throw new Error(`[E][reflectShaderUniforms][getSamplerBindingType] unsupported buffer binding type: ${binding.resourceType}`);
// }

/**
 * 
 * @param binding 
 * @returns 
 * 
 */
const getBufferBindingType = (binding: VariableInfo): GPUBufferBindingType => {
    if (binding.resourceType === ResourceType.Uniform) {
        return "uniform";
    } else if (binding.resourceType === ResourceType.Storage && binding.access === "read") {
        return "read-only-storage"
    } else if (binding.resourceType === ResourceType.Storage && binding.access === "read_write") {
        return "storage";
    } else {
        throw new Error(`[E][reflectShaderUniforms][getBufferBindingType] unsupported buffer binding type: ${binding.resourceType}`);
    }
}

/**
 * 
 * ref:
 * https://www.w3.org/TR/webgpu/#gputexture
 * @param binding 
 * @returns 
 * 
 */
const getTextureViewDimension = (binding: VariableInfo): GPUTextureViewDimension => {
    switch (binding.type.name) {
        case 'texture_1d':
        case 'texture_storage_1d':
            return '1d';
        case 'texture_2d':
        case 'texture_storage_2d':
        case 'texture_multisampled_2d':
        case 'texture_depth_2d':
        case 'texture_depth_multisampled_2d':
            return '2d';
        case 'texture_2d_array':
        case 'texture_storage_2d_array':
        case 'texture_depth_2d_array':
            return '2d-array';
        case 'texture_cube':
        case 'texture_depth_cube':
            return 'cube';
        case 'texture_cube_array':
        case 'texture_depth_cube_array':
            return 'cube-array';
        case 'texture_3d':
        case 'texture_storage_3d':
            return '3d';
        default: {
            throw new Error(`[E][reflectShaderUniforms][getTextureViewDimension] unsupported binding texture type name: ${binding.type.name}`);
        }
    }
};

/**
 * @description
 */
const VALID_FORMATS = new Set<GPUTextureFormat>([
    "r8unorm", "r8snorm", "r8uint", "r8sint", "r16unorm", "r16snorm", "r16uint", "r16sint", "r16float", "rg8unorm", "rg8snorm", "rg8uint",
    "rg8sint", "r32uint", "r32sint", "r32float", "rg16unorm", "rg16snorm", "rg16uint", "rg16sint", "rg16float", "rgba8unorm", "rgba8unorm-srgb",
    "rgba8snorm", "rgba8uint", "rgba8sint", "bgra8unorm", "bgra8unorm-srgb", "rgb9e5ufloat", "rgb10a2uint", "rgb10a2unorm", "rg11b10ufloat",
    "rg32uint", "rg32sint", "rg32float", "rgba16unorm", "rgba16snorm", "rgba16uint", "rgba16sint", "rgba16float", "rgba32uint", "rgba32sint",
    "rgba32float", "stencil8", "depth16unorm", "depth24plus", "depth24plus-stencil8", "depth32float", "depth32float-stencil8", "bc1-rgba-unorm",
    "bc1-rgba-unorm-srgb", "bc2-rgba-unorm", "bc2-rgba-unorm-srgb", "bc3-rgba-unorm", "bc3-rgba-unorm-srgb", "bc4-r-unorm", "bc4-r-snorm",
    "bc5-rg-unorm", "bc5-rg-snorm", "bc6h-rgb-ufloat", "bc6h-rgb-float", "bc7-rgba-unorm", "bc7-rgba-unorm-srgb", "etc2-rgb8unorm",
    "etc2-rgb8unorm-srgb", "etc2-rgb8a1unorm", "etc2-rgb8a1unorm-srgb", "etc2-rgba8unorm", "etc2-rgba8unorm-srgb", "eac-r11unorm", "eac-r11snorm",
    "eac-rg11unorm", "eac-rg11snorm", "astc-4x4-unorm", "astc-4x4-unorm-srgb", "astc-5x4-unorm", "astc-5x4-unorm-srgb", "astc-5x5-unorm",
    "astc-5x5-unorm-srgb", "astc-6x5-unorm", "astc-6x5-unorm-srgb", "astc-6x6-unorm", "astc-6x6-unorm-srgb", "astc-8x5-unorm", "astc-8x5-unorm-srgb",
    "astc-8x6-unorm", "astc-8x6-unorm-srgb", "astc-8x8-unorm", "astc-8x8-unorm-srgb", "astc-10x5-unorm", "astc-10x5-unorm-srgb", "astc-10x6-unorm",
    "astc-10x6-unorm-srgb", "astc-10x8-unorm", "astc-10x8-unorm-srgb", "astc-10x10-unorm", "astc-10x10-unorm-srgb", "astc-12x10-unorm",
    "astc-12x10-unorm-srgb", "astc-12x12-unorm", "astc-12x12-unorm-srgb"
]);

/**
 * @description
 *  check and valid. mapping string to GPUTextureFormat string.
 * @param binding 
 * @returns 
 */
const getTextureFormatByTexelType = (binding: VariableInfo): GPUTextureFormat => {
    const t: GPUTextureFormat = (binding as any).type.format.name as GPUTextureFormat;
    if (!VALID_FORMATS.has(t)) {
        throw new Error(`[E][getTextureFormatByTexelType] get texture format failed. wgsl given texel format error. type: ${t}`);
    }
    return t;
}

/**
 * ref: https://www.w3.org/TR/WGSL/#memory-access-mode
 * @param binding 
 */
const getStorageTextureAccess = (binding: VariableInfo): GPUStorageTextureAccess => {
    const t: string = (binding as any).type.access;
    switch (t) {
        case 'read':
            return 'read-only';
        case 'write':
            return 'write-only';
        case 'read_write':
            return 'read-write';
        default: {
            throw new Error(`[E][getStorageTextureAccess] unspported texture acecessor type in valid storage texture access. type: ${t}`);
        }
    }
};

/**
 * ref:
 * https://www.w3.org/TR/webgpu/#texture-format-caps
 * @param binding 
 * @returns 
 * 
 */
const getTextureSampleType = (textureFormat: GPUTextureFormat): GPUTextureSampleType => {
    switch (textureFormat) {
        case 'depth16unorm':
        case 'depth24plus':
        case 'depth24plus-stencil8':
        case 'depth32float':
        case 'depth32float-stencil8':
            return 'depth';
        case 'r8uint':
        case 'rg8uint':
        case 'rgba8uint':
        case 'r16uint':
        case 'rg16uint':
        case 'rgba16uint':
        case 'r32uint':
        case 'rg32uint':
        case 'rgba32uint':
        case 'rgb10a2uint':
            return 'uint';
        case 'r8sint':
        case 'rg8sint':
        case 'rgba8sint':
        case 'r16sint':
        case 'rg16sint':
        case 'rgba16sint':
        case 'r32sint':
        case 'rg32sint':
        case 'rgba32sint':
            return 'sint';
        case 'rg16unorm':
        case 'rg16snorm':
        case 'r16unorm':
        case 'r16snorm':
        case 'rg32float':
        case 'r32float':
        case 'rgba16unorm':
        case 'rgba16snorm':
        case 'rgba32float':
            return 'unfilterable-float';
        case 'rgb9e5ufloat':
        case 'r8unorm':
        case 'r8snorm':
        case 'rg8unorm':
        case 'rgba8unorm':
        case 'rgba8unorm-srgb':
        case 'bgra8unorm':
        case 'rgba8snorm':
        case 'bgra8unorm-srgb':
        case 'rg16float':
        case 'r16float':
        case 'rgba16float':
        case 'rgb10a2unorm':
        case 'rg11b10ufloat':
        case 'bc1-rgba-unorm':
        case 'bc1-rgba-unorm-srgb':
        case 'bc2-rgba-unorm':
        case 'bc2-rgba-unorm-srgb':
        case 'bc3-rgba-unorm':
        case 'bc3-rgba-unorm-srgb':
        case 'bc4-r-unorm':
        case 'bc4-r-snorm':
        case 'bc5-rg-unorm':
        case 'bc5-rg-snorm':
        case 'bc6h-rgb-ufloat':
        case 'bc6h-rgb-float':
        case 'bc7-rgba-unorm-srgb':
        case 'bc7-rgba-unorm':
        case 'etc2-rgb8unorm':
        case 'etc2-rgb8unorm-srgb':
        case 'etc2-rgb8a1unorm':
        case 'etc2-rgb8a1unorm-srgb':
        case 'etc2-rgba8unorm-srgb':
        case 'eac-r11unorm':
        case 'eac-r11snorm':
        case 'eac-rg11unorm':
        case 'eac-rg11snorm':
        case 'astc-4x4-unorm':
        case 'astc-4x4-unorm-srgb':
        case 'astc-5x4-unorm':
        case 'astc-5x4-unorm-srgb':
        case 'astc-5x5-unorm':
        case 'astc-5x5-unorm-srgb':
        case 'astc-6x5-unorm':
        case 'astc-6x5-unorm-srgb':
        case 'astc-6x6-unorm':
        case 'astc-6x6-unorm-srgb':
        case 'astc-8x5-unorm':
        case 'astc-8x5-unorm-srgb':
        case 'astc-8x6-unorm':
        case 'astc-8x6-unorm-srgb':
        case 'astc-8x8-unorm':
        case 'astc-8x8-unorm-srgb':
        case 'astc-10x5-unorm':
        case 'astc-10x5-unorm-srgb':
        case 'astc-10x6-unorm':
        case 'astc-10x6-unorm-srgb':
        case 'astc-10x8-unorm':
        case 'astc-10x8-unorm-srgb':
        case 'astc-10x10-unorm':
        case 'astc-10x10-unorm-srgb':
        case 'astc-12x10-unorm':
        case 'astc-12x10-unorm-srgb':
        case 'astc-12x12-unorm':
        case 'astc-12x12-unorm-srgb':
            return 'float';
        default:
            throw new Error(`[E][reflectShaderUniforms][getTextureSampleType] unsupported analysis binding texturetype: ${textureFormat}`);
    }
};

/**
 * reflect shader uniform info.
 * @param code 
 * @param entryPoint 
 * @param shaderStage  GPUShaderStage.
 * @returns 
 */
const reflectShaderUniforms = (code: string, entryPoint: string, shaderStage: GPUFlagsConstant, uniforms?: Uniforms, debugLabel?: string): IReflectUniforms => {
    const reflect = new WgslReflect(code);

    let rawEntry: FunctionInfo | undefined = undefined;
    switch (shaderStage) {
        case GPUShaderStage.VERTEX:
            reflect.entry.vertex.forEach(e => {
                if (e.name === entryPoint) {
                    rawEntry = e;
                }
            });
            break;
        case GPUShaderStage.FRAGMENT:
            reflect.entry.fragment.forEach(e => {
                if (e.name === entryPoint) {
                    rawEntry = e;
                }
            });
            break;
        case GPUShaderStage.COMPUTE:
            reflect.entry.compute.forEach(e => {
                if (e.name === entryPoint) {
                    rawEntry = e;
                }
            });
            break;
        default:
            {
                throw new Error(`[E][reflectShaderUniforms] ${debugLabel} unsupported shader stage ${shaderStage}`);
            }
    }
    if (rawEntry === undefined) {
        throw new Error(`[E][reflectShaderUniforms] ${debugLabel} entry point "${entryPoint}" not found in the shader code.`);
    }

    let groupIDwithBindGroupLayoutEntriesMap: Map<number, Array<GPUBindGroupLayoutEntry>> = new Map();
    let groupIDwithResourceBindingsMap: Map<number, Array<VariableInfo>> = new Map();

    const getBindGroupLayoutEntries = (group: number): Array<GPUBindGroupLayoutEntry> => {
        if (!groupIDwithBindGroupLayoutEntriesMap.has(group)) {
            let bindGroupEntries: Array<GPUBindGroupLayoutEntry> = [];
            groupIDwithBindGroupLayoutEntriesMap.set(group, bindGroupEntries);
        }
        return groupIDwithBindGroupLayoutEntriesMap.get(group) as Array<GPUBindGroupLayoutEntry>;
    }

    const getResourceBindingsByGroupID = (binding: number): Array<VariableInfo> => {
        if (!groupIDwithResourceBindingsMap.has(binding)) {
            let resourceBindings: Array<VariableInfo> = [];
            groupIDwithResourceBindingsMap.set(binding, resourceBindings);
        }
        return groupIDwithResourceBindingsMap.get(binding) as Array<VariableInfo>;
    }

    let entry: FunctionInfo = rawEntry as FunctionInfo;
    entry.resources.forEach(binding => {
        let bindGroupLayoutEntry: GPUBindGroupLayoutEntry = {
            binding: binding.binding,
            visibility: shaderStage
        };
        const groupID: number = binding.group;
        let groups = getBindGroupLayoutEntries(groupID);
        let resourceBindings = getResourceBindingsByGroupID(groupID);
        switch (binding.resourceType) {
            case ResourceType.Uniform:
            case ResourceType.Storage:
                {
                    bindGroupLayoutEntry.buffer = {};
                    bindGroupLayoutEntry.buffer.type = getBufferBindingType(binding);
                    bindGroupLayoutEntry.buffer.minBindingSize = binding.size;
                    groups.push(bindGroupLayoutEntry);
                    resourceBindings.push(binding);
                    break;
                }
            case ResourceType.Texture:
                {
                    if (!uniforms?.getPropertyMap().has(binding.name)) {
                        throw new Error(`[E][reflectShaderUniforms] ${debugLabel} input uniforms missing texture property, name: ${binding.name}. please check holder descriptor uniforms.`)
                    }
                    bindGroupLayoutEntry.texture = {};
                    bindGroupLayoutEntry.texture.viewDimension = getTextureViewDimension(binding);
                    const textureFormat = (uniforms?.getPropertyMap().get(binding.name) as TextureProperty).getTexture().getTextureFormat();
                    bindGroupLayoutEntry.texture.sampleType = getTextureSampleType(textureFormat);
                    groups.push(bindGroupLayoutEntry);
                    resourceBindings.push(binding);
                    break;
                }
            case ResourceType.StorageTexture:
                {
                    bindGroupLayoutEntry.storageTexture = {
                        format: getTextureFormatByTexelType(binding)
                    };
                    bindGroupLayoutEntry.storageTexture.access = getStorageTextureAccess(binding);
                    bindGroupLayoutEntry.storageTexture.viewDimension = getTextureViewDimension(binding);
                    groups.push(bindGroupLayoutEntry);
                    resourceBindings.push(binding);
                    break;
                }
            case ResourceType.Sampler:
                {
                    if (!uniforms?.getPropertyMap().has(binding.name)) {
                        throw new Error(`[E][reflectShaderUniforms] ${debugLabel} input uniforms missing sampler property, name: ${binding.name}. please check holder descriptor uniforms.`)
                    }

                    // TODO:: wait wgsl_reflect support reflect relationshiop bteween texture and textureSampler.
                    // ISSUE: https://github.com/brendan-duncan/wgsl_reflect/issues/77
                    const textureSampler = (uniforms?.getPropertyMap().get(binding.name) as TextureSamplerProperty).getTextureSampler();
                    bindGroupLayoutEntry.sampler = {};
                    bindGroupLayoutEntry.sampler.type = textureSampler.SamplerBindingType;

                    groups.push(bindGroupLayoutEntry);
                    resourceBindings.push(binding);
                    break;
                }

            default:
                {
                    throw new Error(`[E][reflectShaderUniforms] ${debugLabel} unsupported resource binding resource type: ${binding.resourceType}`);
                }
        }

    });

    let reflectUniforms: IReflectUniforms = {
        bindGroupCount: groupIDwithBindGroupLayoutEntriesMap.size,
        groupIDwithBindGroupLayoutEntriesMap: groupIDwithBindGroupLayoutEntriesMap,
        groupIDwithResourceBindingsMap: groupIDwithResourceBindingsMap,
    };

    return reflectUniforms;
}

export {
    type IReflectUniforms,
    reflectShaderUniforms
}
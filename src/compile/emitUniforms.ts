import { ResourceType, type VariableInfo } from "wgsl_reflect"
import type { Context } from "../res/Context"
import type { ComputeShader } from "../res/shader/ComputeShader"
import type { FragmentShader } from "../res/shader/FragmentShader"
import { VertexShader } from "../res/shader/VertexShader"
import { BufferState } from "../state/BufferState"
import type { SamplerState } from "../state/SamplerState"
import type { TextureState } from "../state/TextureState"
import type { IUniformRecord } from "./parseUniform"

/**
 * @param opts 
 * @param slotBindGroupMap 
 * @param mergedUniformResourceMap 
 * @function emitUniforms
 */
const emitUniforms = (
    opts: {
        debugLabel: string,
        context: Context,
        vertexShader?: VertexShader,
        fragmentShader?: FragmentShader,
        computeShader?: ComputeShader,
        bufferState: BufferState,
        textureState: TextureState,
        samplerState: SamplerState,
        uniformRecordMap: Map<string, IUniformRecord>,
        bufferIDUniformRecordsMap: Map<number, Map<string, IUniformRecord>>,
        gourpIDWithBindGroupLayoutMap: Map<number, GPUBindGroupLayout>,
        gourpIDWithBindGroupLayoutDescriptorMap: Map<number, GPUBindGroupLayoutDescriptor>,
    },
    slotBindGroupMap: Map<number, GPUBindGroup>,
    mergedUniformResourceMap: Map<number, VariableInfo[]>
) => {

    const mergeBindGroupWithResourceBindingsMap = () => {
        const MAXBINDGROUPS = opts.context.getLimits().maxBindGroups;
        const vsMap: Map<number, VariableInfo[]> = opts.vertexShader?.getBindGroupWithResourceBindingsMap() || new Map();
        const fsMap: Map<number, VariableInfo[]> = opts.fragmentShader?.getBindGroupWithResourceBindingsMap() || new Map();
        const cpMap: Map<number, VariableInfo[]> = opts.computeShader?.getBindGroupWithResourceBindingsMap() || new Map();
        if (vsMap.size >= MAXBINDGROUPS || fsMap.size >= MAXBINDGROUPS || cpMap.size >= MAXBINDGROUPS) {
            throw new Error(`[E][emitUniforms][mergeBindGroupWithResourceBindingsMap] ${opts.debugLabel} over limits: ${MAXBINDGROUPS}`);
        }
        for (let k = 0; k < MAXBINDGROUPS; k++) {
            const resourceBindings: VariableInfo[] = [];
            if (vsMap.has(k)) {
                const vsResourceBindings = vsMap.get(k) || [];
                resourceBindings.push(...vsResourceBindings);
            }
            if (fsMap.has(k)) {
                const fsResourceBindings = fsMap.get(k) || [];
                resourceBindings.push(...fsResourceBindings);
            }
            if (cpMap.has(k)) {
                const cpResourceBindings = cpMap.get(k) || [];
                resourceBindings.push(...cpResourceBindings);
            }
            if (resourceBindings.length) {
                const uniqueItems = Array.from(new Map(resourceBindings.map(item => [item.name, item])).values());
                mergedUniformResourceMap.set(k, uniqueItems);
            }
        }
    };

    mergeBindGroupWithResourceBindingsMap();

    mergedUniformResourceMap.forEach((resourceBindings, bindGroupID) => {
        const bindGroupEntries: GPUBindGroupEntry[] = [];
        resourceBindings.forEach(resourceBinding => {
            let offset: number = 0;
            const key: string = resourceBinding.name;
            if (!opts.uniformRecordMap.has(key)) {
                throw new Error(`[E][emitUniforms] ${opts.debugLabel} uniforms ${key} not exists.`);
            }
            const record = opts.uniformRecordMap.get(key);
            if (!record) {
                throw new Error(`[E][emitUniforms] ${opts.debugLabel} uniforms record: ${key} is not assigned.`);
            }
            const t = resourceBinding.resourceType;
            switch (t) {
                case ResourceType.Storage:
                case ResourceType.Uniform:
                    {
                        const resourcID = record?.resourceID as number;
                        const buffer = opts.bufferState.getBuffer(resourcID);
                        if (!buffer) {
                            throw new Error(`[E][emitUniforms] ${opts.debugLabel} emit resource buffer (id:${resourcID}) is undefined.`);
                        }
                        const gpuBufferBinding: GPUBufferBinding = {
                            buffer: buffer.getGpuBuffer(null, 'frameBegin'),
                            offset: offset,
                            size: buffer.getByteLength(),

                        };
                        const bindGroupEntry: GPUBindGroupEntry = {
                            binding: resourceBinding.binding,
                            resource: gpuBufferBinding
                        };
                        bindGroupEntries.push(bindGroupEntry);
                        offset += resourceBinding.size;
                        break;
                    }
                case ResourceType.Texture:
                case ResourceType.StorageTexture:
                    {
                        const resourcID = record?.resourceID as number;
                        const texture = opts.textureState.getTexture(resourcID);
                        if (!texture) {
                            throw new Error(`[E][emitUniforms] ${opts.debugLabel} missing texture, id:${resourcID}`);
                        }
                        // if resource type is texture storage, used as storage texture
                        if (t === ResourceType.Texture) {
                            texture.useAsTextureBinding();
                        } else if (t === ResourceType.StorageTexture) {
                            texture.useAsStorageBinding();
                        } else {
                            throw new Error(`[E][emitUniforms] ${opts.debugLabel} unsupport resource type: ${t}, id: ${resourcID}`);
                        }
                        const textureView = texture?.getGpuTextureView();
                        if (!textureView) {
                            throw new Error(`[E][emitUniforms] ${opts.debugLabel} missing texture view, id:${resourcID}`);
                        }
                        const bindGroupEntry: GPUBindGroupEntry = {
                            binding: resourceBinding.binding,
                            resource: textureView
                        };
                        bindGroupEntries.push(bindGroupEntry);
                        break;
                    }
                case ResourceType.Sampler:
                    {
                        const resourcID = record?.resourceID as number;
                        const sampler = opts.samplerState.getSampler(resourcID)?.getGpuSampler(undefined, 'frameBegin');
                        if (!sampler) {
                            throw new Error(`[E][emitUniforms] ${opts.debugLabel} emit resource sampler (id: ${resourcID}) is undfined.`);
                        }
                        const bindGroupEntry: GPUBindGroupEntry = {
                            binding: resourceBinding.binding,
                            resource: sampler
                        };
                        bindGroupEntries.push(bindGroupEntry);
                        break;
                    }
                default:
                    {
                        throw new Error(`[E][emitUniforms] ${opts.debugLabel} missing uniforms, resourceBindings: ${resourceBindings}`);
                    }
            }
        });
        const bindGroupLayoutDescriptor: GPUBindGroupLayoutDescriptor = opts.gourpIDWithBindGroupLayoutDescriptorMap.get(bindGroupID) as GPUBindGroupLayoutDescriptor;
        if ((bindGroupLayoutDescriptor.entries as GPUBindGroupLayoutEntry[]).length !== bindGroupEntries.length) {
            throw new Error(`[E][emitUniforms] ${opts.debugLabel} analysis bind_group_entries error.`);
        }
        const bindGroupDescriptor: GPUBindGroupDescriptor = {
            layout: opts.gourpIDWithBindGroupLayoutMap.get(bindGroupID) as GPUBindGroupLayout,
            entries: bindGroupEntries
        };
        const bindGroup = opts.context.getGpuDevice().createBindGroup(bindGroupDescriptor);
        slotBindGroupMap.set(bindGroupID, bindGroup);
    });
}

export {
    emitUniforms
}
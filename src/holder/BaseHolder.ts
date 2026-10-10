import { ResourceType, type VariableInfo } from "wgsl_reflect";
import type { IUniformRecord } from "../compile/parseUniform";
import type { Context } from "../res/Context"
import type { PropertyFormat } from "../res/Format"
import type { BufferState } from "../state/BufferState";
import type { SamplerState } from "../state/SamplerState";
import type { TextureState } from "../state/TextureState";
import type { VertexShader } from "../res/shader/VertexShader";
import type { FragmentShader } from "../res/shader/FragmentShader";
import type { ComputeShader } from "../res/shader/ComputeShader";

/**
 * @class BaseHolder
 */
abstract class BaseHolder {
    /**
     * @description
     */
    private id: number;

    /**
     * @description
     */
    protected debugLabel: string;

    /**
     * @description
     */
    protected context: Context;

    /**
     * @description
     */
    protected bufferState: BufferState;

    /**
     * @description
     */
    protected textureState: TextureState;

    /**
     * @description
     */
    protected slotBindGroupMap: Map<number, GPUBindGroup> = new Map();

    /**
     * @description
     */
    private poropertyFormat: PropertyFormat;

    /**
     * @description
     */
    private samplerState: SamplerState;

    /**
     * @description
     */
    private uniformRecordMap: Map<string, IUniformRecord>;

    /**
     * @description
     */
    private gourpIDWithBindGroupLayoutMap: Map<number, GPUBindGroupLayout>;

    /**
     * @description
     */
    private gourpIDWithBindGroupLayoutDescriptorMap: Map<number, GPUBindGroupLayoutDescriptor>;

    /**
     * @warning !!!
     *  order should maintain by graph itself, please be carful assign the value of order.
     * @description
     */
    private order_: number = -1;
    public get Order(): number {
        return this.order_;
    }
    public set Order(v: number) {
        this.order_ = v;
    }

    /**
     * @description
     *  compute/render pass has common uniforms.
     * @param opts 
     */
    constructor(
        opts: {
            id: number,
            debugLabel: string,
            context: Context,
            poropertyFormat: PropertyFormat,
            bufferState: BufferState,
            textureState: TextureState,
            samplerState: SamplerState,
            uniformRecordMap: Map<string, IUniformRecord>,
            gourpIDWithBindGroupLayoutMap: Map<number, GPUBindGroupLayout>,
            gourpIDWithBindGroupLayoutDescriptorMap: Map<number, GPUBindGroupLayoutDescriptor>,
        }
    ) {
        this.id = opts.id;
        this.debugLabel = opts.debugLabel;
        this.context = opts.context;
        this.poropertyFormat = opts.poropertyFormat;

        this.bufferState = opts.bufferState;
        this.textureState = opts.textureState;
        this.samplerState = opts.samplerState;

        this.uniformRecordMap = opts.uniformRecordMap;
        this.gourpIDWithBindGroupLayoutMap = opts.gourpIDWithBindGroupLayoutMap;
        this.gourpIDWithBindGroupLayoutDescriptorMap = opts.gourpIDWithBindGroupLayoutDescriptorMap;
    }

    /**
     * @description
     */
    protected refreshSlotBindGroupMap = (
        opts: {
            vs?: VertexShader,
            fs?: FragmentShader,
            cs?: ComputeShader
        }
    ): void => {
        this.slotBindGroupMap.clear();

        const mergedUniformResourceMap: Map<number, VariableInfo[]> = new Map();
        const mergeBindGroupWithResourceBindingsMap = () => {
            const MAXBINDGROUPS = this.context.getLimits().maxBindGroups;
            const vsMap: Map<number, VariableInfo[]> = opts.vs?.getBindGroupWithResourceBindingsMap() || new Map();
            const fsMap: Map<number, VariableInfo[]> = opts.fs?.getBindGroupWithResourceBindingsMap() || new Map();
            const cpMap: Map<number, VariableInfo[]> = opts.cs?.getBindGroupWithResourceBindingsMap() || new Map();
            if (vsMap.size >= MAXBINDGROUPS || fsMap.size >= MAXBINDGROUPS || cpMap.size >= MAXBINDGROUPS) {
                throw new Error(`[E][BasePass][refreshSlotBindGroupMap] ${this.debugLabel} over limits: ${MAXBINDGROUPS}`);
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
                if (!this.uniformRecordMap.has(key)) {
                    throw new Error(`[E][emitUniforms] ${this.debugLabel} uniforms ${key} not exists.`);
                }
                const record = this.uniformRecordMap.get(key);
                if (!record) {
                    throw new Error(`[E][emitUniforms] ${this.debugLabel} uniforms record: ${key} is not assigned.`);
                }
                const t = resourceBinding.resourceType;
                switch (t) {
                    case ResourceType.Storage:
                    case ResourceType.Uniform:
                        {
                            const resourcID = record?.resourceID as number;
                            const buffer = this.bufferState.getBuffer(resourcID);
                            if (!buffer) {
                                throw new Error(`[E][emitUniforms] ${this.debugLabel} emit resource buffer (id:${resourcID}) is undefined.`);
                            }
                            const gpuBufferBinding: GPUBufferBinding = {
                                buffer: buffer.getGpuBuffer(),
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
                            const texture = this.textureState.getTexture(resourcID);
                            if (!texture) {
                                throw new Error(`[E][emitUniforms] ${this.debugLabel} missing texture, id:${resourcID}`);
                            }
                            // if resource type is texture storage, used as storage texture
                            if (t === ResourceType.Texture) {
                                texture.useAsTextureBinding();
                            } else if (t === ResourceType.StorageTexture) {
                                texture.useAsStorageBinding();
                            } else {
                                throw new Error(`[E][emitUniforms] ${this.debugLabel} unsupport resource type: ${t}, id: ${resourcID}`);
                            }
                            const textureView = texture?.getGpuTextureView();
                            if (!textureView) {
                                throw new Error(`[E][emitUniforms] ${this.debugLabel} missing texture view, id:${resourcID}`);
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
                            const sampler = this.samplerState.getSampler(resourcID)?.getGpuSampler(undefined, 'recordingCommandStart');
                            if (!sampler) {
                                throw new Error(`[E][emitUniforms] ${this.debugLabel} emit resource sampler (id: ${resourcID}) is undfined.`);
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
                            throw new Error(`[E][emitUniforms] ${this.debugLabel} missing uniforms, resourceBindings: ${resourceBindings}`);
                        }
                }
            });
            const bindGroupLayoutDescriptor: GPUBindGroupLayoutDescriptor = this.gourpIDWithBindGroupLayoutDescriptorMap.get(bindGroupID) as GPUBindGroupLayoutDescriptor;
            if ((bindGroupLayoutDescriptor.entries as GPUBindGroupLayoutEntry[]).length !== bindGroupEntries.length) {
                throw new Error(`[E][emitUniforms] ${this.debugLabel} analysis bind_group_entries error.`);
            }
            const bindGroupDescriptor: GPUBindGroupDescriptor = {
                layout: this.gourpIDWithBindGroupLayoutMap.get(bindGroupID) as GPUBindGroupLayout,
                entries: bindGroupEntries
            };
            const bindGroup = this.context.getGpuDevice().createBindGroup(bindGroupDescriptor);
            this.slotBindGroupMap.set(bindGroupID, bindGroup);
        });
    }

    /**
     * @returns 
     */
    public getID = (): number => {
        return this.id;
    }

    /**
     * @returns 
     */
    public getDebugLabel = (): string => {
        return this.debugLabel;
    }

    /**
     * @returns 
     */
    public getPropertyFormat = (): PropertyFormat => {
        return this.poropertyFormat;
    }

    /**
     * @param encoder 
     */
    abstract build(_encoder: GPUCommandEncoder): void;
}

export {
    BaseHolder
}
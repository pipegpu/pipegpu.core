import { BaseLet } from "./BaseLet";

import type { IUniformRecord } from "../compile/parseUniform";
import type { Context } from "../res/Context";
import type { ComputeHandle, UniformHandle } from "../res/Handle";
import type { ComputePipeline } from "../res/pipeline/ComputePipeline";
import type { ComputeShader } from "../res/shader/ComputeShader";
import type { BufferState } from "../state/BufferState";
import type { SamplerState } from "../state/SamplerState";
import type { TextureState } from "../state/TextureState";

/**
 * @description
 * @class ComputeLet
 */
class ComputeLet extends BaseLet {
    /**
     * @description
     */
    private computePipeline: ComputePipeline;

    /**
     * @description
     */
    private computeHandler: ComputeHandle;

    /**
     * @description
     */
    private uniformHandler: UniformHandle;

    /**
     * @description
     */
    private cs: ComputeShader;

    /**
     * @param opts 
     */
    constructor(
        opts: {
            id: number,
            debugLabel: string,
            context: Context,
            bufferState: BufferState,
            textureState: TextureState,
            samplerState: SamplerState,
            uniformRecordMap: Map<string, IUniformRecord>,
            gourpIDWithBindGroupLayoutMap: Map<number, GPUBindGroupLayout>,
            gourpIDWithBindGroupLayoutDescriptorMap: Map<number, GPUBindGroupLayoutDescriptor>,
            cs: ComputeShader,
            computePipeline: ComputePipeline,
            computeHandler: ComputeHandle,
            uniformHandler: UniformHandle,
        }
    ) {
        super({
            id: opts.id,
            debugLabel: opts.debugLabel,
            context: opts.context,
            poropertyFormat: 'computeLet',
            bufferState: opts.bufferState,
            textureState: opts.textureState,
            samplerState: opts.samplerState,
            uniformRecordMap: opts.uniformRecordMap,
            gourpIDWithBindGroupLayoutMap: opts.gourpIDWithBindGroupLayoutMap,
            gourpIDWithBindGroupLayoutDescriptorMap: opts.gourpIDWithBindGroupLayoutDescriptorMap
        });
        this.cs = opts.cs;
        this.computePipeline = opts.computePipeline;
        this.computeHandler = opts.computeHandler;
        this.uniformHandler = opts.uniformHandler;
        this.refreshSlotBindGroupMap({ cs: this.cs });
    }

    /**
     * @param cEncoder 
     */
    override build(cEncoder: GPUCommandEncoder): void {
        // uniform update support:
        // - uniform buffer update
        // - texture update
        const bDirty = this.uniformHandler('recordingCommandStart', cEncoder, this.bufferState, this.textureState);

        const desc: GPUComputePassDescriptor = {
            label: `compute holder`
        };
        const pEncoder = cEncoder.beginComputePass(desc);
        pEncoder.setPipeline(this.computePipeline.getGpuComputePipeline());

        //  
        bDirty ? this.refreshSlotBindGroupMap({ cs: this.cs }) : null;

        // uniform slot assign
        this.slotBindGroupMap.forEach((bindGroup, slot) => {
            pEncoder.setBindGroup(slot, bindGroup);
        });

        this.computeHandler(pEncoder, cEncoder);
        pEncoder.end();

        // uniform copy buffer should recrod whild any pass encoder end
        this.uniformHandler('recordingCommandEnd', cEncoder, this.bufferState, this.textureState);
    }
}

export {
    ComputeLet
}
import type { Context } from "../res/Context";
import type { ComputeShader } from "../res/shader/ComputeShader";
import { parseBindGroupLayout } from "./parseBindGroupLayout";

/**
 * @function parseComputeBindGroupLayout
 */
const parseComputeBindGroupLayout = (
    opts: {
        debugLabel: string,
        context: Context,
        computeShader: ComputeShader,
        bindGroupLayouts: GPUBindGroupLayout[],
        gourpIDWithBindGroupLayoutMap: Map<number, GPUBindGroupLayout>,
        gourpIDWithBindGroupLayoutDescriptorMap: Map<number, GPUBindGroupLayoutDescriptor>
    }
) => {
    const collectedBindgroupLayoutEntriesMap: Map<number, GPUBindGroupLayoutEntry[]> = new Map();
    const maxBindGroups: number = opts.context.getLimits().maxBindGroups;
    const cpMap = opts.computeShader.getBindGroupWithGroupLayoutEntriesMap();
    if (cpMap?.size >= maxBindGroups) {
        throw new Error(`[E][parseComputeBindGroupLayout] ${opts.debugLabel} bindgroup over size. maxBindGroup :${maxBindGroups}`);
    }
    for (let bindGroupID = 0; bindGroupID < opts.context.getLimits().maxBindGroups; bindGroupID++) {
        const resourceBindings: GPUBindGroupLayoutEntry[] = [];
        if (cpMap.has(bindGroupID)) {
            const bindings: GPUBindGroupLayoutEntry[] = cpMap.get(bindGroupID) as GPUBindGroupLayoutEntry[];
            resourceBindings.push(...bindings);
        }
        if (resourceBindings.length) {
            collectedBindgroupLayoutEntriesMap.set(bindGroupID, resourceBindings);
            if (collectedBindgroupLayoutEntriesMap.size != bindGroupID + 1) {
                throw new Error(`[E][parseRenderBindGroupLayout] ${opts.debugLabel} binding group should use in order from start [0 to ${maxBindGroups}], please check shader binding group index.`);
            }
        }
    }

    parseBindGroupLayout({
        debugLabel: opts.debugLabel,
        context: opts.context,
        collectedBindgroupLayoutEntriesMap: collectedBindgroupLayoutEntriesMap,
        bindGroupLayouts: opts.bindGroupLayouts,
        gourpIDWithBindGroupLayoutMap: opts.gourpIDWithBindGroupLayoutMap,
        gourpIDWithBindGroupLayoutDescriptorMap: opts.gourpIDWithBindGroupLayoutDescriptorMap
    });
};

export {
    parseComputeBindGroupLayout
}
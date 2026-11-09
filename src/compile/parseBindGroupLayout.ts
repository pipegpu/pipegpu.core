import type { Context } from "../res/Context";

/**
 * @function parseBindGroupLayout
 * @param context 
 * @param collectedBindgroupLayoutEntriesMap 
 * @param bindGroupLayouts 
 * @param gourpIDWithBindGroupLayoutMap 
 * @param gourpIDWithBindGroupLayoutDescriptorMap
 */
const parseBindGroupLayout = (
    opts: {
        debugLabel: string,
        context: Context,
        collectedBindgroupLayoutEntriesMap: Map<number, GPUBindGroupLayoutEntry[]>,
        bindGroupLayouts: GPUBindGroupLayout[],
        gourpIDWithBindGroupLayoutMap: Map<number, GPUBindGroupLayout>,
        gourpIDWithBindGroupLayoutDescriptorMap: Map<number, GPUBindGroupLayoutDescriptor>
    }
) => {
    const maxBindGroups = opts.context.getLimits().maxBindGroups;
    for (let groupID = 0; groupID < maxBindGroups; groupID++) {
        if (opts.collectedBindgroupLayoutEntriesMap.has(groupID)) {
            const entries: GPUBindGroupLayoutEntry[] = opts.collectedBindgroupLayoutEntriesMap.get(groupID) as GPUBindGroupLayoutEntry[];
            const bindGropuLayoutDescriptor: GPUBindGroupLayoutDescriptor = {
                label: `gourp_${groupID}`,
                entries: [...entries]
            };
            // BUG? after createBindGroupLayout, bindGropuLayoutDescriptor.entires has been clear?
            const bindGroupLayout: GPUBindGroupLayout = opts.context.getGpuDevice().createBindGroupLayout(bindGropuLayoutDescriptor);
            opts.bindGroupLayouts.push(bindGroupLayout);
            opts.gourpIDWithBindGroupLayoutMap.set(groupID, bindGroupLayout);
            opts.gourpIDWithBindGroupLayoutDescriptorMap.set(groupID, bindGropuLayoutDescriptor);
        }
    }
}

export {
    parseBindGroupLayout
}
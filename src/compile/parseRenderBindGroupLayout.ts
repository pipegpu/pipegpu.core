import { Context } from "../res/Context";
import type { FragmentShader } from "../res/shader/FragmentShader";
import type { VertexShader } from "../res/shader/VertexShader";
import { parseBindGroupLayout } from "./parseBindGroupLayout";

/**
 * @function parseRenderBindGroupLayout
 * @param context 
 * @param vertexShader 
 * @param fragmentShader 
 * @param bindGroupLayouts 
 * @param gourpIDWithBindGroupLayoutMap 
 * @param gourpIDWithBindGroupLayoutDescriptorMap 
 * @returns
 */
const parseRenderBindGroupLayout = (
    opts: {
        debugLabel: string,
        context: Context,
        vertexShader: VertexShader,
        fragmentShader: FragmentShader,
        bindGroupLayouts: GPUBindGroupLayout[],
        gourpIDWithBindGroupLayoutMap: Map<number, GPUBindGroupLayout>,
        gourpIDWithBindGroupLayoutDescriptorMap: Map<number, GPUBindGroupLayoutDescriptor>
    }
) => {
    const collectedBindGroupLayoutEntriesMap: Map<number, GPUBindGroupLayoutEntry[]> = new Map();

    const MAXBINDGROUPS: number = opts.context.getLimits().maxBindGroups;
    const vsMap = opts.vertexShader.getBindGroupWithGroupLayoutEntriesMap(), fsMap = opts.fragmentShader.getBindGroupWithGroupLayoutEntriesMap();
    if (vsMap?.size + fsMap?.size >= MAXBINDGROUPS * 2) {
        throw new Error(`[E][parseRenderBindGroupLayout] ${opts.debugLabel} bindgroup over size.`);
    }

    /**
    *   Some variables are used in both vs and fs. 
    *   Other properties are the same but visible is different. 
    *   Layout does not allow duplicate entry points, 
    *   so they need to be merged.
    */
    const MergeBindGroupLayoutEntry = (resourceBindings: GPUBindGroupLayoutEntry[], resourceMap: Map<number, GPUBindGroupLayoutEntry>) => {
        resourceBindings.forEach(resource_binding => {
            if (resourceMap.has(resource_binding.binding)) {
                resourceMap.get(resource_binding.binding)!.visibility |= resource_binding.visibility;
            } else {
                resourceMap.set(resource_binding.binding, resource_binding);
            }
        });
    };

    for (let bindGroupID = 0; bindGroupID < opts.context.getLimits().maxBindGroups; bindGroupID++) {
        const resourceMap: Map<number, GPUBindGroupLayoutEntry> = new Map();
        if (vsMap.has(bindGroupID)) {
            const bindings: GPUBindGroupLayoutEntry[] = vsMap.get(bindGroupID) as GPUBindGroupLayoutEntry[];
            MergeBindGroupLayoutEntry(bindings, resourceMap);
        }
        if (fsMap.has(bindGroupID)) {
            const bindings: GPUBindGroupLayoutEntry[] = fsMap.get(bindGroupID) as GPUBindGroupLayoutEntry[];
            MergeBindGroupLayoutEntry(bindings, resourceMap);
        }
        if (resourceMap.size) {
            collectedBindGroupLayoutEntriesMap.set(bindGroupID, resourceMap.values() as unknown as GPUBindGroupLayoutEntry[]);
            if (collectedBindGroupLayoutEntriesMap.size != bindGroupID + 1) {
                console.log(`[E][parseRenderBindGroupLayout] ${opts.debugLabel} binding group should use in order from start [0 to ${MAXBINDGROUPS}], please check shader binding group index.`);
                collectedBindGroupLayoutEntriesMap.clear();
                return;
            }
        }
    }

    parseBindGroupLayout({
        debugLabel: opts.debugLabel,
        context: opts.context,
        collectedBindgroupLayoutEntriesMap: collectedBindGroupLayoutEntriesMap,
        bindGroupLayouts: opts.bindGroupLayouts,
        gourpIDWithBindGroupLayoutMap: opts.gourpIDWithBindGroupLayoutMap,
        gourpIDWithBindGroupLayoutDescriptorMap: opts.gourpIDWithBindGroupLayoutDescriptorMap
    });
};

export {
    parseRenderBindGroupLayout
}
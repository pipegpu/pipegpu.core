import type { ComputeShader } from "../res/shader/ComputeShader";

/**
 * @function parseComputeProgrammableStage
 */
const parseComputeProgrammableStage = (
    opts: {
        debugLabel: string,
        computeShader: ComputeShader
    }
): GPUProgrammableStage => {
    const computeState: GPUProgrammableStage = {
        module: opts.computeShader.getGpuShader(),
        entryPoint: opts.computeShader.getEntryPoint(),
    };
    return computeState;
};

export {
    parseComputeProgrammableStage
}
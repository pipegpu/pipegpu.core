import type { FragmentShader } from "../res/shader/FragmentShader";

/**
 * @function parseFragmentState
 * @param fragmentShader 
 * @param colorTargetStates 
 * @returns 
 */
const parseFragmentState = (
    opts: {
        debugLabel: string,
        fragmentShader: FragmentShader,
        colorTargetStates: GPUColorTargetState[]
    }
): GPUFragmentState => {
    const fragmentState: GPUFragmentState = {
        targets: opts.colorTargetStates,
        module: opts.fragmentShader.getGpuShader(),
        entryPoint: opts.fragmentShader.getEntryPoint(),
    };
    return fragmentState;
};

export {
    parseFragmentState
}
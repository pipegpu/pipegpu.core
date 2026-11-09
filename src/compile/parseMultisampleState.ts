import type { MultiSampleFormat } from "../res/Format";

/**
 * @function parseMultisampleState
 * @param multiSampleFormat
 * @param multiSampleState
 */
const parseMultisampleState = (
    opts: {
        debugLabel: string,
        multiSampleFormat: MultiSampleFormat
    }
): GPUMultisampleState => {
    const multiSampleState: GPUMultisampleState = {};
    // multiSampleState.mask = ~0;
    multiSampleState.alphaToCoverageEnabled = false;
    switch (opts.multiSampleFormat) {
        case '1x':
            multiSampleState.count = 1;
            break;
        case '2x':
            multiSampleState.count = 2;
            break;
        case '4x':
            multiSampleState.count = 4;
            break;
        case '8x':
            multiSampleState.count = 8;
            break;
        default:
            console.warn(`[W][parseMultisampleState] ${opts.debugLabel}`);
            multiSampleState.count = 1;
            break;
    }
    return multiSampleState;
};

export {
    parseMultisampleState
}

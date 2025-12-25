import type { RenderProperty } from "../property/dispatch/RenderProperty"
import type { CullFormat } from "../res/Format"

/**
 * @interface PrimitiveDesc
 */
interface PrimitiveDesc {
    /**
     * 
     */
    cullFormat?: CullFormat;

    /**
     * 
     */
    primitiveTopology?: GPUPrimitiveTopology;
}

/**
 * @function parsePrimitiveState
 * @param primitiveDesc
 * @param dispatch
 * @returns
 */
const parsePrimitiveState = (
    opts: {
        debugLabel: string,
        primitiveDesc?: PrimitiveDesc,
        dispatch: RenderProperty,
    }
) => {
    const primitiveState: GPUPrimitiveState = {};
    primitiveState.topology = opts.primitiveDesc?.primitiveTopology || 'triangle-list';

    // strip topology type needs stripIndexFormat assigned undefined
    if ('triangle-strip' !== primitiveState.topology && 'line-strip' !== primitiveState.topology) {
        primitiveState.stripIndexFormat = undefined;
    } else {
        primitiveState.stripIndexFormat = opts.dispatch.getIndexFormat();
    }

    const cullFormat = opts.primitiveDesc?.cullFormat || 'none';
    switch (cullFormat) {
        case 'none':
            {
                primitiveState.cullMode = 'none';
                break;
            }
        case 'frontCCW':
            {
                primitiveState.frontFace = 'ccw';
                primitiveState.cullMode = 'front';
                break;
            }
        case 'frontCW':
            {
                primitiveState.frontFace = 'cw';
                primitiveState.cullMode = 'front';
                break;
            }
        case 'backCCW':
            {
                primitiveState.frontFace = 'ccw';
                primitiveState.cullMode = 'back';
                break;
            }
        case 'backCW':
            {
                primitiveState.frontFace = 'cw';
                primitiveState.cullMode = 'back';
                break;
            }
        default:
            {
                console.log(`[E][parsePrimitiveState] ${opts.debugLabel} unsupported cullFormat: ${cullFormat}`);
                primitiveState.cullMode = 'none';
                break;
            }
    }
    return primitiveState;
}

export {
    type PrimitiveDesc,
    parsePrimitiveState
}
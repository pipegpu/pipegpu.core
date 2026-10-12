import { ColorAttachment } from "../res/attachment/ColorAttachment"

/**
 * 
 * @param colorAttachments 
 * @returns 
 * 
 */
const parseColorAttachments = (
    opts: {
        debugLabel: string,
        colorAttachments: ColorAttachment[],
    }
): GPUColorTargetState[] => {
    const colorTargetStates: GPUColorTargetState[] = [];
    if (opts.colorAttachments.length === 0) {
        throw new Error(`[E][parseColorAttachments] ${opts.debugLabel} 'RenderLetDesc' missing color attachments.`);
    }
    opts.colorAttachments.forEach(colorAttachment => {
        const colorTargetState: GPUColorTargetState = {
            format: colorAttachment.getTextureFormat()
        };
        // blend
        colorTargetState.blend = colorAttachment.getGpuBlendState();
        colorTargetState.writeMask = GPUColorWrite.ALL;
        colorTargetStates.push(colorTargetState);
    });
    return colorTargetStates;
}

export {
    parseColorAttachments
}
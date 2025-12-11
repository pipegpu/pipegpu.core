import type { Context } from "../Context";
import type { FrameStageFormat } from "../Format";
import { BaseTexture } from "./BaseTexture";

/**
 * 
 */
class SurfaceTexture2D extends BaseTexture {
    /**
     * 
     * @param opts 
     */
    constructor(
        opts: {
            id: number,
            context: Context,
            appendixTextureUsages?: number,
        }
    ) {
        super({
            id: opts.id,
            context: opts.context,
            width: opts.context.getViewportWidth(),
            height: opts.context.getViewportHeight(),
            textureUsageFlags: (opts.appendixTextureUsages || 0) | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
            propertyFormat: 'texture2D',
            textureFormat: opts.context.getPreferredTextureFormat(),
        });
    }

    /**
     * 
     */
    protected override createGpuTexture(): void {
        this.texture = this.context.getFrameTexture();
    }

    /**
     * surface texture do nothing.
     */
    override getGpuTextureView = (): GPUTextureView => {
        return this.context.getFrameTextureView();
    }

    /**
     * 
     * @param [GPUCommandEncoder] encoder 
     * @param [FrameStageFormat] frameStage
     * 
     */
    override getGpuTexture = (_encoder?: GPUCommandEncoder, _frameStage?: FrameStageFormat): GPUTexture => {
        this.createGpuTexture();
        return this.texture as GPUTexture;

    }

    /**
     * @function useAsStorageBinding
     */
    override useAsStorageBinding(): void {
        this.selectedUsage = 'STORAGE_BINDING';
    }

    /**
     * @function useAsTextureBinding
     */
    override useAsTextureBinding(): void {
        this.selectedUsage = 'TEXTURE_BINDING';
    }

    /**
     * @function useAsRenderAttachment
     */
    override useAsRenderAttachment(): void {
        this.selectedUsage = 'RENDER_ATTACHMENT';
    }
}

export {
    SurfaceTexture2D
}
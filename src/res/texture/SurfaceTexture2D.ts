import type { Context } from "../Context";
import type { FrameStageFormat } from "../Format";
import { BaseTexture } from "./BaseTexture";

/**
 * @description Class representing a 2D surface texture.
 */
class SurfaceTexture2D extends BaseTexture {
    /**
     * @param opts The options for creating the surface texture.
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
     * @description Create the GPU texture for the surface texture.
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

    override refreshGpuTexture(_cEncoder: GPUCommandEncoder, _frameStage: FrameStageFormat): boolean {
        return false;
    }

    /**
     * @description Get the GPU texture for the surface texture.
     * @param [GPUCommandEncoder] encoder The command encoder.
     * @param [FrameStageFormat] frameStage The frame stage format.
     */
    override getGpuTexture = (): GPUTexture => {
        this.createGpuTexture();
        return this.texture as GPUTexture;

    }

    /**
     * @description Use the surface texture as a storage binding.
     * @function useAsStorageBinding
     */
    override useAsStorageBinding(): void {
        this.selectedUsage = 'STORAGE_BINDING';
    }

    /**
     * @description Use the surface texture as a texture binding.
     * @function useAsTextureBinding
     */
    override useAsTextureBinding(): void {
        this.selectedUsage = 'TEXTURE_BINDING';
    }

    /**
     * @description Use the surface texture as a render attachment.
     * @function useAsRenderAttachment
     */
    override useAsRenderAttachment(): void {
        this.selectedUsage = 'RENDER_ATTACHMENT';
    }
}

export {
    SurfaceTexture2D
}
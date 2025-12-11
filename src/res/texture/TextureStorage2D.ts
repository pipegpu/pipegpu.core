import type { Context } from "../Context";
import type { TypedArray1DFormat } from "../Format";
import { Texture2D } from "./Texture2D";

/**
 * @class TextureStorage2D
 * @function webgpu use texture storage to write/store result.
 */
class TextureStorage2D extends Texture2D {
    /**
     * @param opts 
     */
    constructor(
        opts: {
            id: number,
            context: Context,
            width: number,
            height: number,
            textureData?: TypedArray1DFormat,
            mipmapCount?: number,
            appendixTextureUsages?: number,
            textureFormat?: GPUTextureFormat,
        }
    ) {
        super({
            id: opts.id,
            context: opts.context,
            width: opts.width,
            height: opts.height,
            textureFormat: opts.textureFormat,
            mipmapCount: opts.mipmapCount,
            appendixTextureUsages: opts.appendixTextureUsages
        });
        this.textureData = opts.textureData;
        this.depthOrArrayLayers = 1;
        this.textureUsageFlags = this.textureUsageFlags | GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC;
        this.propertyFormat = 'textureStorage2D';
    }
}

export {
    TextureStorage2D
}
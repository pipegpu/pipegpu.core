import type { Context } from "../Context";
import type { TypedArray1DFormat } from "../Format";
import { Texture2DArray } from "./Texture2DArray";

/**
 * @description textures order: [+x, -x, +y, -y, +z, -z], array length equals 6.
 * @class TextureCube
 * ref: https://webgpufundamentals.org/webgpu/lessons/webgpu-cube-maps.html
 */
class TextureCube extends Texture2DArray {
    /**
     * @description The cube texture data.
     * @param opts The options for creating the cube texture.
     * @param opts 
     */
    constructor(
        opts: {
            id: number,
            context: Context,
            width: number,
            height: number,
            faces: {
                posx: TypedArray1DFormat,
                negx: TypedArray1DFormat,
                posy: TypedArray1DFormat,
                negy: TypedArray1DFormat,
                posz: TypedArray1DFormat,
                negz: TypedArray1DFormat,
            }
            appendixTextureUsages?: number,
            textureFormat?: GPUTextureFormat,
            mipmapCount?: number
        }
    ) {
        super({
            id: opts.id,
            context: opts.context,
            width: opts.width,
            height: opts.height,
            depthOrArrayLayers: 6,
            textureDataArray: [opts.faces.posx, opts.faces.negx, opts.faces.posy, opts.faces.negy, opts.faces.posz, opts.faces.negz],
            appendixTextureUsages: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
            textureFormat: opts.textureFormat,
            mipmapCount: opts.mipmapCount,
        });
        this.propertyFormat = 'textureCube';
    }
}

export {
    TextureCube
}
import type { Context } from "../res/Context"
import type { TypedArray1DFormat, TypedArray2DFormat } from "../res/Format";
import type { Texture2DHandle, Texture3DHandle, TextureArrayHandle } from "../res/Handle";
import type { BaseTexture } from "../res/texture/BaseTexture";
import { SurfaceTexture2D } from "../res/texture/SurfaceTexture2D";
import { Texture2D } from "../res/texture/Texture2D";
import { Texture2DArray } from "../res/texture/Texture2DArray";
import { Texture3D } from "../res/texture/Texture3D";
import { TextureCube } from "../res/texture/TextureCube";
import { uniqueID } from "../util/uniqueID";

/**
 * @description Define the state for managing textures, including 2D, 3D, and array textures.
 */
class TextureState {
    /**
     * @description The set of textures managed by this state.
     */
    private static TEXTURE_SET: Map<number, BaseTexture> = new Map();

    /**
     * @description The WebGPU context associated with this texture state.
     */
    private context: Context;

    /**
     * @description Creates a new TextureState with the given WebGPU context.
     * @param context The WebGPU context to associate with this texture state.
     */
    constructor(context: Context) {
        this.context = context;
    }

    /**
     * @param textureID The ID of the texture to retrieve.
     * @returns The texture associated with the given ID.
     */
    getTexture = (textureID: number): BaseTexture => {
        if (!TextureState.TEXTURE_SET.has(textureID)) {
            throw new Error(`[E][TextureState][getTexture] find texture failed, id: ${textureID}`);
        } else {
            return TextureState.TEXTURE_SET.get(textureID)!;
        }
    }

    /**
     * @param textureID The ID of the texture to retrieve.
     */
    createTexutre2D = (
        opts: {
            width: number,
            height: number,
            textureData?: TypedArray1DFormat,
            handler?: Texture2DHandle,
            textureFormat?: GPUTextureFormat,
            mipmapCount?: number,
            appendixTextureUsages?: number,
        }
    ): Texture2D => {
        const textureID: number = uniqueID();
        const texture: Texture2D = new Texture2D({
            id: textureID,
            context: this.context,
            width: opts.width,
            height: opts.height,
            textureData: opts.textureData,
            handler: opts.handler,
            textureFormat: opts.textureFormat,
            mipmapCount: opts.mipmapCount,
            appendixTextureUsages: opts.appendixTextureUsages,
        });
        TextureState.TEXTURE_SET.set(textureID, texture);
        return TextureState.TEXTURE_SET.get(textureID) as Texture2D;
    }

    /**
     * @description Creates a 3D texture with the given options.
     * @param opts The options for creating the 3D texture.
     * @returns The created Texture3D instance.
     */
    createTexture3D = (
        opts: {
            width: number,
            height: number,
            depth: number,
            textureData?: TypedArray2DFormat,
            handler?: Texture3DHandle,
            textureFormat?: GPUTextureFormat,
            mipmapCount?: number,
            appendixTextureUsages?: number,
        }
    ): Texture3D => {
        const textureID: number = uniqueID();
        const texture: Texture3D = new Texture3D({
            id: textureID,
            context: this.context,
            width: opts.width,
            height: opts.height,
            depth: opts.depth,
            textureData: opts.textureData,
            handler: opts.handler,
            textureFormat: opts.textureFormat,
            mipmapCount: opts.mipmapCount,
            appendixTextureUsages: opts.appendixTextureUsages,
        });
        TextureState.TEXTURE_SET.set(textureID, texture);
        return TextureState.TEXTURE_SET.get(textureID) as Texture3D;
    }

    /**
     * @description Creates a surface 2D texture.
     * @returns The created SurfaceTexture2D instance.
     */
    createSurfaceTexture2D = (): SurfaceTexture2D => {
        const textureID: number = uniqueID();
        const texture = new SurfaceTexture2D({
            id: textureID,
            context: this.context
        });
        TextureState.TEXTURE_SET.set(textureID, texture);
        return texture;
    }

    /**
     * @description Creates a 2D texture array with the given options.
     * @param opts The options for creating the 2D texture array.
     * @returns The created Texture2DArray instance.
     */
    createTexture2DArray = (
        opts: {
            width: number,
            height: number,
            depthOrArrayLayers: number,
            textureDataArray?: TypedArray2DFormat,
            handler?: TextureArrayHandle,
            textureFormat?: GPUTextureFormat,
            mipmapCount?: number,
            appendixTextureUsages?: number,
        }
    ): Texture2DArray => {
        const idx: number = uniqueID();
        const texture: Texture2DArray = new Texture2DArray({
            id: idx,
            context: this.context,
            width: opts.width,
            height: opts.height,
            depthOrArrayLayers: opts.depthOrArrayLayers,
            appendixTextureUsages: opts.appendixTextureUsages,
            textureDataArray: opts.textureDataArray,
            handler: opts.handler,
            textureFormat: opts.textureFormat,
            mipmapCount: opts.mipmapCount,
        });
        TextureState.TEXTURE_SET.set(idx, texture);
        return TextureState.TEXTURE_SET.get(idx) as Texture2DArray;
    }

    /**
     * @description Creates a texture cube with the given options.
     * @param opts The options for creating the texture cube.
     * @returns The created TextureCube instance.
     */
    createTextureCube = (
        opts: {
            width: number,
            height: number,
            faces: {
                posx: TypedArray1DFormat,
                negx: TypedArray1DFormat,
                posy: TypedArray1DFormat,
                negy: TypedArray1DFormat,
                posz: TypedArray1DFormat,
                negz: TypedArray1DFormat,
            },
            appendixTextureUsages?: number,
            textureFormat?: GPUTextureFormat,
            mipmapCount?: number,
        }
    ): TextureCube => {
        const idx: number = uniqueID();
        const texture: TextureCube = new TextureCube({
            id: idx,
            context: this.context,
            width: opts.width,
            height: opts.height,
            faces: opts.faces,
            appendixTextureUsages: opts.appendixTextureUsages,
            textureFormat: opts.textureFormat,
            mipmapCount: opts.mipmapCount,
        });
        TextureState.TEXTURE_SET.set(idx, texture);
        return TextureState.TEXTURE_SET.get(idx) as TextureCube;
    }
}

export {
    TextureState
}
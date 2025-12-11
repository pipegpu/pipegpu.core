import type { Context } from "../res/Context"
import type { TypedArray1DFormat, TypedArray2DFormat } from "../res/Format";
import type { TextureArrayHandle } from "../res/Handle";
import type { BaseTexture } from "../res/texture/BaseTexture";
import { SurfaceTexture2D } from "../res/texture/SurfaceTexture2D";
import { Texture2D } from "../res/texture/Texture2D";
import { Texture2DArray } from "../res/texture/Texture2DArray";
import { TextureCube } from "../res/texture/TextureCube";
import { TextureStorage2D } from "../res/texture/TextureStorage2D";
import { uniqueID } from "../util/uniqueID";


/**
 * 
 */
class TextureState {
    /**
     * 
     */
    private static TEXTURE_SET: Map<number, BaseTexture> = new Map();

    /**
     * 
     */
    private context: Context;

    /**
     * 
     * @param opts 
     */
    constructor(context: Context) {
        this.context = context;
    }

    /**
     * 
     * @param id 
     * @returns 
     */
    getTexture = (textureID: number): BaseTexture | undefined => {
        if (!TextureState.TEXTURE_SET.has(textureID)) {
            throw new Error(`[E][TextureState][getTexture] find texture failed, id: ${textureID}`);
        }
        return TextureState.TEXTURE_SET.get(textureID);
    }

    /**
     * 
     * @param id 
     * 
     */
    createTexutre2D = (
        opts: {
            width: number,
            height: number,
            textureData?: TypedArray1DFormat,
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
            textureFormat: opts.textureFormat,
            mipmapCount: opts.mipmapCount,
            appendixTextureUsages: opts.appendixTextureUsages,
        });
        TextureState.TEXTURE_SET.set(textureID, texture);
        return TextureState.TEXTURE_SET.get(textureID) as Texture2D;
    }

    /**
     * 
     * @param opts 
     * @returns 
     * 
     */
    createTextureStorage2D = (
        opts: {
            width: number,
            height: number,
            textureData?: TypedArray1DFormat,
            textureFormat?: GPUTextureFormat,
            mipmapCount?: number,
            appendixTextureUsages?: number,
        }
    ): TextureStorage2D => {
        const textureID: number = uniqueID();
        const texture: TextureStorage2D = new TextureStorage2D({
            id: textureID,
            context: this.context,
            width: opts.width,
            height: opts.height,
            textureData: opts.textureData,
            mipmapCount: opts.mipmapCount,
            appendixTextureUsages: opts.appendixTextureUsages,
            textureFormat: opts.textureFormat,
        });
        TextureState.TEXTURE_SET.set(textureID, texture);
        return TextureState.TEXTURE_SET.get(textureID) as TextureStorage2D;
    }

    /**
     * 
     * @param opts 
     * @param id 
     * @returns 
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
     * @param opts 
     * @returns 
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
     * @param opts 
     * @returns 
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
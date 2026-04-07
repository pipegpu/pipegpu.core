import { StorageBuffer } from "../res/buffer/StorageBuffer";
import { UniformBuffer } from "../res/buffer/UniformBuffer";
import type { VertexBuffer } from "../res/buffer/VertexBuffer";
import { TextureSampler } from "../res/sampler/TextureSampler";
import { Texture2D } from "../res/texture/Texture2D";
import { Texture2DArray } from "../res/texture/Texture2DArray";
import { Texture3D } from "../res/texture/Texture3D";
import { TextureStorage2D } from "../res/texture/TextureStorage2D";
import { VertexBufferProperty } from "./attribute/VertexBufferProperty";
import type { BaseProperty } from "./BaseProperty";
import { StorageBufferProperty } from "./uniform/StorageBufferProperty";
import { TextureProperty } from "./uniform/TextureProperty";
import { TextureSamplerProperty } from "./uniform/TextureSamplerProperty";
import { UniformBufferProperty } from "./uniform/UniformBufferProperty";

/**
 * 
 * @description
 * @class Properties
 * 
 */
class Properties {
    /**
     * @description
     */
    protected propertyMap: Map<string, BaseProperty> = new Map();

    /**
     * @description
     */
    constructor() { }

    /**
     * @description
     * @returns 
     */
    isEmpty = (): boolean => {
        return this.propertyMap.size === 0;
    }

    /**
     * @description
     */
    getPropertyMap = (): Map<string, BaseProperty> => {
        return this.propertyMap;
    }
}

/**
 * @example
 * attributes.assing("position", vertexBuffer);
 */
class Attributes extends Properties {
    /**
     * 
     */
    constructor() {
        super();
    }

    /**
     * 
     * @param propertyName 
     * @param buffer 
     */
    assign = (propertyName: string, buffer: VertexBuffer): void => {
        if (this.propertyMap.has(propertyName)) {
            console.log(`[I][Properties][Attributes] duplicated key :${propertyName}`);
            return;
        }
        const vertexBufferProperty = new VertexBufferProperty(propertyName, buffer);
        this.propertyMap.set(propertyName, vertexBufferProperty);
    }

}

/**
 * 
 */
class Uniforms extends Properties {

    constructor() {
        super();
    }

    assign(propertyName: string, buffer: UniformBuffer): void
    assign(propertyName: string, buffer: StorageBuffer): void
    assign(propertyName: string, textureSampler: TextureSampler): void
    assign(propertyName: string, texture2d: Texture2D): void
    assign(propertyName: string, texture3d: Texture3D): void
    assign(propertyName: string, texture2dArray: Texture2DArray): void
    assign(propertyName: string, textureStorage2d: TextureStorage2D): void
    assign(a: string, b: any): void {
        if (b instanceof UniformBuffer) {
            const uniformBufferProperty: UniformBufferProperty = new UniformBufferProperty(a, b);
            this.propertyMap.set(a, uniformBufferProperty);
            return;
        } else if (b instanceof StorageBuffer) {
            const storageBufferProperty: StorageBufferProperty = new StorageBufferProperty(a, b);
            this.propertyMap.set(a, storageBufferProperty);
            return;
        } else if (b instanceof TextureSampler) {
            const textureSamplerProperty: TextureSamplerProperty = new TextureSamplerProperty(a, b);
            this.propertyMap.set(a, textureSamplerProperty);
            return;
        } else if (b instanceof Texture2D) {
            const texture2DProperty: TextureProperty = new TextureProperty(a, b);
            this.propertyMap.set(a, texture2DProperty);
            return;
        } else if (b instanceof Texture2DArray) {
            const texture2DArrayProperty: TextureProperty = new TextureProperty(a, b);
            this.propertyMap.set(a, texture2DArrayProperty);
            return;
        } else if (b instanceof TextureStorage2D) {
            const textureStorage2DProperty: TextureProperty = new TextureProperty(a, b);
            this.propertyMap.set(a, textureStorage2DProperty);
            return;
        } else if (b instanceof Texture3D) {
            const texture3dProperty: TextureProperty = new TextureProperty(a, b);
            this.propertyMap.set(a, texture3dProperty);
            return;
        }
        else {
            throw new Error(`[E][Properties][Uniforms][assign] unsupported buffer type, buffer: ${b}`);
        }
    }

}

export {
    Properties,
    Attributes,
    Uniforms
}
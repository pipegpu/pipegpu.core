import type { Uniforms } from "../../property/Properties";
import { reflectShaderAttributes, type IReflectAttributes } from "../../util/reflectShaderAttributes";
import { reflectShaderUniforms } from "../../util/reflectShaderUniforms";
import type { Context } from "../Context";
import { BaseShader } from "./BaseShader";

/**
 * @description Class representing a vertex shader.
 */
class VertexShader extends BaseShader {
    /**
     * @description The reflected attributes of the vertex shader.
     */
    private reflectedAttributes: IReflectAttributes | undefined;

    /**
     * @description Create a new vertex shader instance.
     * @param opts The options for creating the vertex shader.
     * 
     */
    constructor(
        opts: {
            context: Context,
            code: string,
            entryPoint: string
        }
    ) {
        super({
            context: opts.context,
            code: opts.code,
            entryPoint: opts.entryPoint,
            shaderStage: GPUShaderStage.VERTEX
        });
    }

    /**
     * @description Reflect the vertex shader's attributes and uniforms.
     * @param uniforms The uniforms to reflect.
     * @param debugLabel An optional debug label for the shader.
     */
    public override reflect = (uniforms?: Uniforms, debugLabel?: string): void => {
        this.createGpuShader(`[VertexShader] let name:${debugLabel}, shader id: ${this.getID()}.`);
        this.reflectedAttributes = reflectShaderAttributes(this.code, this.entryPoint, debugLabel);
        this.reflectedUniforms = reflectShaderUniforms(this.code, this.entryPoint, this.shaderStage, uniforms, debugLabel);
    }

    /**
     * @description Get the vertex attribute map.
     * @returns The map of vertex attributes.
     */
    getVertexAttributeMap = (): Map<string, GPUVertexAttribute> | undefined => {
        return this.reflectedAttributes?.attributeMap;
    }

    /**
     * @description Get the ordered list of vertex attributes.
     * @returns The ordered list of vertex attributes.
     */
    getOrderedAttribute = (): GPUVertexAttribute[] | undefined => {
        return this.reflectedAttributes?.attributeOdered;
    }

    /**
     * @description Get the attribute name by its location.
     * @param location The location of the attribute.
     * @returns The name of the attribute at the specified location.
     */
    getAttributeNameByLocation = (location: number): string | undefined => {
        return this.reflectedAttributes?.locationMap.get(location);
    }

    /**
     * @description Get the count of vertex attributes.
     * @returns The number of vertex attributes.
     */
    getAttributeCount = (): number | undefined => {
        return this.reflectedAttributes?.attributeCount;
    }
}

export {
    VertexShader
}
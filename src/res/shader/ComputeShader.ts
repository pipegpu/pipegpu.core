import type { Uniforms } from "../../property/Properties";
import { reflectShaderUniforms } from "../../util/reflectShaderUniforms";
import type { Context } from "../Context";
import { BaseShader } from "./BaseShader";

/**
 * @description Class representing a compute shader.
 */
class ComputeShader extends BaseShader {
    /**
     * @description Create a new compute shader instance.
     * @param opts The options for creating the compute shader.
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
            shaderStage: GPUShaderStage.COMPUTE
        });
    }

    /**
     * @description Reflect the compute shader's attributes and uniforms.
     * @param uniforms The uniforms to reflect.
     * @param debugLabel An optional debug label for the shader.
     */
    public override reflect = (uniforms?: Uniforms, debugLabel?: string): void => {
        this.createGpuShader(`[ComputeShader] ${debugLabel} shader id: ${this.getID()}]`);
        this.reflectedUniforms = reflectShaderUniforms(this.code, this.entryPoint, this.shaderStage, uniforms, debugLabel);
    }

}

export {
    ComputeShader
}
import type { Uniforms } from "../../property/Properties";
import { reflectShaderUniforms } from "../../util/reflectShaderUniforms";
import type { Context } from "../Context";
import { BaseShader } from "./BaseShader";

/**
 * @description Class representing a fragment shader.
 */
class FragmentShader extends BaseShader {
    /**
     * @description Create a new fragment shader instance.
     * @param opts The options for creating the fragment shader.
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
            shaderStage: GPUShaderStage.FRAGMENT
        });
    }

    /**
     * @description Reflect the fragment shader's attributes and uniforms.
     * @param uniforms The uniforms to reflect.
     * @param debugLabel An optional debug label for the shader.    
     */
    public override reflect = (uniforms?: Uniforms, debugLabel?: string): void => {
        this.createGpuShader(`[FragmentShader] ${debugLabel}, shader id: ${this.getID()}`);
        this.reflectedUniforms = reflectShaderUniforms(this.code, this.entryPoint, this.shaderStage, uniforms, debugLabel);
    }

}

export {
    FragmentShader
}
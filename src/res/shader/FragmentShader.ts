import type { Uniforms } from "../../property/Properties";
import { reflectShaderUniforms } from "../../util/reflectShaderUniforms";
import type { Context } from "../Context";
import { BaseShader } from "./BaseShader";

/**
 * 
 */
class FragmentShader extends BaseShader {

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
     * 
     */
    public override reflect = (uniforms?: Uniforms, debugLabel?: string): void => {
        this.createGpuShader(`[FragmentShader] let name ${debugLabel}, shader id: ${this.getID()}`);
        this.reflectedUniforms = reflectShaderUniforms(this.code, this.entryPoint, this.shaderStage, uniforms, debugLabel);
    }

}

export {
    FragmentShader
}
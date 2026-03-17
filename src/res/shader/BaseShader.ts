import type { VariableInfo } from "wgsl_reflect";
import { hash32a } from "../../util/hash32a";
import type { IReflectUniforms } from "../../util/reflectShaderUniforms";
import type { Context } from "../Context"
import type { Uniforms } from "../../property/Properties";

/**
 * 
 * @class BaseShader
 * 
 */
abstract class BaseShader {

    /**
     * 
     */
    private id: number;

    /**
     * 
     */
    private context: Context;

    /**
     * 
     */
    protected shaderStage: GPUFlagsConstant;

    /**
     * 
     */
    protected code: string;

    /**
     * 
     */
    protected entryPoint: string;

    /**
     * 
     */
    protected shader: GPUShaderModule | undefined;

    /**
    * 
    */
    protected reflectedUniforms: IReflectUniforms | undefined;

    /**
     * @param opts.id a combined of string with hash value
     * 
     */
    constructor(
        opts: {
            context: Context,
            shaderStage: GPUFlagsConstant,
            code: string,
            entryPoint: string
        }
    ) {
        this.id = BaseShader.hash32aID(opts.code, opts.entryPoint);
        this.context = opts.context;
        this.shaderStage = opts.shaderStage;
        this.code = opts.code;
        this.entryPoint = opts.entryPoint;
    }

    /**
     * 
     * @param code 
     * @param entryPoint 
     * @returns 
     */
    static hash32aID = (code: string, entryPoint: string) => {
        return hash32a(`${code}-${entryPoint}`);
    }

    /**
     * 
     * @returns 
     */
    getID = (): number => {
        return this.id;
    }

    /**
     * 
     * @returns
     * 
     */
    getEntryPoint = (): string => {
        return this.entryPoint;
    }

    /**
     * get gpu-side shader
     */
    getGpuShader = (): GPUShaderModule => {
        return this.shader as GPUShaderModule;
    }

    /**
     * 
     */
    protected createGpuShader = (label: string): void => {
        if (!this.shader) {
            const desc: GPUShaderModuleDescriptor = {
                label: label,
                code: this.code,
            };
            this.shader = this.context?.getGpuDevice().createShaderModule(desc);
            this.shader?.getCompilationInfo().then(value => {
                value.messages.forEach(message => {
                    throw new Error(`[E][BaseShader][createGpuShader] label:${label}, error message: ${message}.`);
                });
            });
        }
    }

    /**
     * 
     * @returns 
     */
    getBindGroupWithGroupLayoutEntriesMap = (): Map<number, Array<GPUBindGroupLayoutEntry>> => {
        return this.reflectedUniforms?.groupIDwithBindGroupLayoutEntriesMap as Map<number, Array<GPUBindGroupLayoutEntry>>;
    }

    /**
     * 
     * @returns 
     */
    getBindGroupWithResourceBindingsMap = (): Map<number, Array<VariableInfo>> => {
        return this.reflectedUniforms?.groupIDwithResourceBindingsMap as Map<number, Array<VariableInfo>>;
    }

    /**
     * 
     * reflect attributes and uniforms in WGSLCode.
     * @param uniforms 
     * 
     */
    public abstract reflect(uniforms?: Uniforms): void;

}

export {
    BaseShader
}
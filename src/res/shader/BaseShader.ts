import type { VariableInfo } from "wgsl_reflect";
import { hash32a } from "../../util/hash32a";
import type { IReflectUniforms } from "../../util/reflectShaderUniforms";
import type { Context } from "../Context"
import type { Uniforms } from "../../property/Properties";

/**
 * @class BaseShader
 * @description Abstract base class for GPU shaders, providing common functionality for shader management and reflection.
 */
abstract class BaseShader {
    /**
     * @description The unique ID of the shader.
     */
    private id: number;

    /**
     * @description The GPU context associated with the shader.
     */
    private context: Context;

    /**
     * @description The shader stage (vertex, fragment, compute, etc.).
     */
    protected shaderStage: GPUFlagsConstant;

    /**
     * @description The WGSL code of the shader.
     */
    protected code: string;

    /**
     * @description The entry point function name of the shader.
     */
    protected entryPoint: string;

    /**
     * @description The GPU shader module.
     */
    protected shader: GPUShaderModule | undefined;

    /**
    * @description The reflected uniforms of the shader.
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
     * @description Generate a unique hash ID for the shader based on its code and entry point.
     * @param code The WGSL code of the shader.
     * @param entryPoint The entry point function name of the shader.
     * @returns {number} The generated hash ID.
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
     * @description Get the entry point function name of the shader.
     * @returns {string} The entry point function name.
     * 
     */
    getEntryPoint = (): string => {
        return this.entryPoint;
    }

    /**
     * @description Get the GPU-side shader module.
     */
    getGpuShader = (): GPUShaderModule => {
        return this.shader as GPUShaderModule;
    }

    /**
     * @description Create the GPU shader module if it hasn't been created yet.
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
     * @description Get the map of bind group layout entries indexed by group ID.
     * @returns {Map<number, Array<GPUBindGroupLayoutEntry>>} The map of bind group layout entries.
     */
    getBindGroupWithGroupLayoutEntriesMap = (): Map<number, Array<GPUBindGroupLayoutEntry>> => {
        return this.reflectedUniforms?.groupIDwithBindGroupLayoutEntriesMap as Map<number, Array<GPUBindGroupLayoutEntry>>;
    }

    /**
     * @description Get the map of resource bindings indexed by group ID.
     * @returns {Map<number, Array<VariableInfo>>} The map of resource bindings.
     */
    getBindGroupWithResourceBindingsMap = (): Map<number, Array<VariableInfo>> => {
        return this.reflectedUniforms?.groupIDwithResourceBindingsMap as Map<number, Array<VariableInfo>>;
    }

    /**
     * @description Reflect attributes and uniforms in the WGSL code.
     * @param uniforms The uniforms to reflect.
     */
    public abstract reflect(uniforms?: Uniforms): void;
}

export {
    BaseShader
}
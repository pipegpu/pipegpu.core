import type { Context } from "../res/Context"
import { BaseShader } from "../res/shader/BaseShader";
import { ComputeShader } from "../res/shader/ComputeShader";
import { FragmentShader } from "../res/shader/FragmentShader";
import { VertexShader } from "../res/shader/VertexShader";

/**
 * @description Define the state for managing shaders, including vertex, fragment, and compute shaders.
 */
class ShaderState {
    /**
     * @description The cache of shaders managed by this state.
     */
    private static CACHE: Map<number, BaseShader> = new Map();

    /**
     * @description The WebGPU context associated with this shader state.
     */
    private context: Context;

    /**
     * @description Creates a new ShaderState with the given WebGPU context.
     * @param context The WebGPU context to associate with this shader state.
     */
    constructor(context: Context) {
        this.context = context;
    }

    /**
     * @description Checks if a shader with the given key exists in the cache.
     * @param key The key of the shader to check.
     * @returns True if the shader exists, false otherwise.
     */
    hasKey = (key: number): boolean => {
        return ShaderState.CACHE.has(key);
    }

    /**
     * @description Creates a vertex shader with the given options.
     * @param opts The options for creating the vertex shader.
     * @returns The created VertexShader instance.
     *  hash32a return uint32
     */
    createVertexShader = (
        opts: {
            code: string,
            entryPoint: string
        }
    ): VertexShader => {
        const shaderID: number = BaseShader.hash32aID(opts.code, opts.entryPoint);
        if (!ShaderState.CACHE.has(shaderID)) {
            const shader: VertexShader = new VertexShader({
                context: this.context,
                code: opts.code,
                entryPoint: opts.entryPoint
            });
            ShaderState.CACHE.set(shaderID, shader);
        }
        return ShaderState.CACHE.get(shaderID) as VertexShader;
    }

    /**
     * @description Creates a fragment shader with the given options.
     * @param opts The options for creating the fragment shader.
     * @returns The created FragmentShader instance.
     */
    createFragmentShader = (
        opts: {
            code: string,
            entryPoint: string
        }
    ): FragmentShader => {
        const shaderID: number = BaseShader.hash32aID(opts.code, opts.entryPoint);
        if (!ShaderState.CACHE.has(shaderID)) {
            const shader = new FragmentShader({
                context: this.context,
                code: opts.code,
                entryPoint: opts.entryPoint
            });
            ShaderState.CACHE.set(shaderID, shader);
        }
        return ShaderState.CACHE.get(shaderID) as FragmentShader;
    }

    /**
     * @description Creates a compute shader with the given options.
     * @param opts The options for creating the compute shader.
     * @returns The created ComputeShader instance.
     */
    createComputeShader = (
        opts: {
            code: string,
            entryPoint: string
        }
    ): ComputeShader => {
        const shaderID: number = BaseShader.hash32aID(opts.code, opts.entryPoint);
        if (!ShaderState.CACHE.has(shaderID)) {
            const shader = new ComputeShader({
                context: this.context,
                code: opts.code,
                entryPoint: opts.entryPoint
            });
            ShaderState.CACHE.set(shaderID, shader);
        }
        return ShaderState.CACHE.get(shaderID) as ComputeShader;
    }
}

export {
    ShaderState
}
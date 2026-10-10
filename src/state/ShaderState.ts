import type { Context } from "../res/Context"
import { BaseShader } from "../res/shader/BaseShader";
import { ComputeShader } from "../res/shader/ComputeShader";
import { FragmentShader } from "../res/shader/FragmentShader";
import { VertexShader } from "../res/shader/VertexShader";

/**
 * @description
 */
class ShaderState {
    /**
     * @description
     */
    private static CACHE: Map<number, BaseShader> = new Map();

    /**
     * @description
     */
    private context: Context;

    /**
     * @description
     * @param opts 
     */
    constructor(context: Context) {
        this.context = context;
    }

    /**
     * 
     * @param key 
     * @returns 
     */
    hasKey = (key: number): boolean => {
        return ShaderState.CACHE.has(key);
    }

    /**
     * @description
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
     * @description
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
     * @description
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
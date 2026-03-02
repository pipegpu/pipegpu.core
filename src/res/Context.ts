import { type IContextOpts, type ContextDesc, parseContextDesc } from "../compile/parseContextDesc.ts";
import type { FeatureNameFormat } from "./Format.ts";

/**
 * 
 */
class Context {
    /**
     * 
     */
    private contextDesc: ContextDesc;

    /**
     * 
     */
    private gpuContext: GPUCanvasContext | null | undefined;

    /**
     *  
     */
    private device: GPUDevice | null | undefined;

    /**
     * 
     */
    private adapter: GPUAdapter | null | undefined;

    /**
     * 
     */
    private queue: GPUQueue | null | undefined;

    /**
     * 
     */
    private features: GPUSupportedFeatures | undefined;

    /**
     * 
     */
    private limits: GPUSupportedLimits | undefined;

    /**
     * 
     */
    private frameTargetTexture: GPUTexture | undefined;

    /**
     * 
     */
    private frameTargetTextureView: GPUTextureView | undefined;

    /**
     * 
     */
    private commandEncoder: GPUCommandEncoder | undefined;

    /**
     * 
     * request supported features.
     * 
     */
    private supportedFeatures!: GPUSupportedFeatures;

    /**
     * 
     * request GPUFeature from input.
     * 
     */
    private requestFeatures?: FeatureNameFormat[];

    /**
     * 
     * @param opts 
     */
    constructor(opts: IContextOpts) {
        this.contextDesc = parseContextDesc(opts);
        this.gpuContext = this.contextDesc.canvas.getContext("webgpu");
        this.requestFeatures = opts.requestFeatures;
    }

    /**
     * @description need use 'await' for adapter request, e.g:
     * const adapter = await context.init();
     * 
     */
    async init() {
        this.adapter = await navigator.gpu.requestAdapter();
        if (!this.adapter) {
            throw new Error(`[E][Context][init] get adapter failed.`);
        }
        this.supportedFeatures = this.adapter!.features;
        // check features 
        (this.requestFeatures || []).forEach(featureName => {
            if (!this.supportedFeatures.has(featureName)) {
                throw new Error(`[E][Context][init] init context failed. unsupported feature: ${featureName}`);
            }
        });
        // issue 1
        // https://github.com/KIWI-ST/pipegpu/issues/1
        // https://www.w3.org/TR/webgpu/#limits
        this.device = await this.adapter?.requestDevice({
            requiredFeatures: this.requestFeatures || [] as any,
            requiredLimits: {
                'maxTextureArrayLayers': this.adapter?.limits.maxTextureArrayLayers,
                'maxBindGroups': this.adapter?.limits.maxBindGroups,
                'maxStorageBufferBindingSize': this.adapter?.limits.maxStorageBufferBindingSize,
                'maxBufferSize': this.adapter?.limits.maxBufferSize,
                'maxComputeWorkgroupSizeX': this.adapter?.limits.maxComputeWorkgroupSizeX,
                'maxComputeWorkgroupSizeY': this.adapter?.limits.maxComputeWorkgroupSizeY,
                'maxComputeWorkgroupSizeZ': this.adapter?.limits.maxComputeWorkgroupSizeZ,
                'maxComputeWorkgroupsPerDimension': this.adapter?.limits.maxComputeWorkgroupsPerDimension,
                'maxComputeInvocationsPerWorkgroup': this.adapter?.limits.maxComputeInvocationsPerWorkgroup,
                'maxStorageBuffersPerShaderStage': this.adapter?.limits.maxStorageBuffersPerShaderStage,
            }
        });
        this.gpuContext?.configure({
            device: this.device as GPUDevice,
            format: navigator.gpu.getPreferredCanvasFormat(),
            alphaMode: "premultiplied",
        });
        this.limits = this.adapter?.limits;
        this.features = this.adapter?.features;
        this.queue = this.device?.queue;
    }

    /**
     * 
     */
    get GPUDescription(): string {
        return this.adapter?.info.description || "unknown";
    }

    /**
     * 
     */
    getSupportedFeatures = () => {
        return this.features;
    }

    /**
     * 
     */
    refreshFrameResource = (): void => {
        this.frameTargetTexture = this.gpuContext?.getCurrentTexture() as GPUTexture;
        this.frameTargetTextureView = this.frameTargetTexture.createView();
        this.commandEncoder = this.device?.createCommandEncoder() as GPUCommandEncoder;
    }

    /**
     * 
     */
    submitFrameResource = (): void => {
        const desc: GPUCommandBufferDescriptor = {};
        const frameCommandBuffers: GPUCommandBuffer[] = [this.commandEncoder?.finish(desc) as GPUCommandBuffer];
        this.queue?.submit(frameCommandBuffers);
    }

    /**
     * 
     */
    getCommandEncoder = (): GPUCommandEncoder => {
        return this.commandEncoder as GPUCommandEncoder;
    }

    /**
     * 
     * @returns 
     */
    getFrameTexture = (): GPUTexture => {
        return this.frameTargetTexture as GPUTexture;
    }

    /**
     * 
     * @returns 
     */
    getFrameTextureView = (): GPUTextureView => {
        return this.frameTargetTextureView as GPUTextureView;
    }

    /**
     * 
     */
    getViewportWidth = (): number => {
        return this.contextDesc.viewportWidth;
    }

    /**
     * 
     */
    getViewportHeight = (): number => {
        return this.contextDesc.viewportHeight;
    }

    /**
     * 
     * @returns 
     */
    getGpuDevice = (): GPUDevice => {
        return this.device as GPUDevice;
    }

    /**
     * 
     * @returns 
     */
    getGpuQueue = (): GPUQueue => {
        return this.queue as GPUQueue;
    }

    /**
     * 
     * @returns 
     */
    getLimits = (): GPUSupportedLimits => {
        return this.limits as GPUSupportedLimits;
    }

    /**
     * 
     * @returns 
     */
    getPreferredTextureFormat = (): GPUTextureFormat => {
        return navigator.gpu.getPreferredCanvasFormat();
    }

    /**
     * 
     * @returns 
     */
    getPreferredDepthTexuteFormat = (): GPUTextureFormat => {
        return 'depth24plus';
    }

}

export {
    type IContextOpts,
    Context
}
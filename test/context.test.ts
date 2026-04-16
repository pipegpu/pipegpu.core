import { assert, beforeAll, expect, test } from 'vitest'
import { Context } from '../index'

const width: number = 400, height: number = 400;
let context: Context;

beforeAll(async () => {
    context = new Context({
        selector: "canvas",
        width: width,
        height: height,
        devicePixelRatio: window.devicePixelRatio,
        requestFeatures: []
    });
    await context.init()
});

test('browser webgpu support', async () => {
    expect(navigator.gpu != undefined).toBe(true);
});

test('webgpu context limits.', async () => {
    const limits = context.getLimits();
    expect(limits.maxTextureArrayLayers >= 2048).toBe(true);
    expect(limits.maxBindGroups >= 4).toBe(true);
    expect(limits.maxStorageBufferBindingSize >= 2147483644).toBe(true);                // 2GB
    expect(limits.maxBufferSize >= 2147483644).toBe(true);                              // 2GB
    expect(limits.maxComputeWorkgroupSizeX >= 128).toBe(true);
    expect(limits.maxComputeWorkgroupSizeY >= 128).toBe(true);
    expect(limits.maxComputeWorkgroupSizeZ >= 64).toBe(true);
    expect(limits.maxComputeWorkgroupsPerDimension >= 65535).toBe(true);
    expect(limits.maxComputeInvocationsPerWorkgroup >= 1024).toBe(true);                // shader workgrop x*y*z limits
});

test('webgpu context supported features.', async () => {
    const features = context.getSupportedFeatures();
    expect(features != undefined).toBe(true);
    expect(features!.has('indirect-first-instance')).toBe(true);                        // indirect
    expect(features!.has('texture-compression-bc')).toBe(true);                         // BC7
    expect(features!.has('timestamp-query')).toBe(true);                                // query gpu costs
    // expect(features!.has('chromium-experimental-multi-draw-indirect')).toBe(true);   // multi draw indirect
});

test(`webgpu context viewport width/height.`, async () => {
    const viewportWidth = context.getViewportWidth();
    const viewportHeight = context.getViewportHeight();
    assert(viewportWidth == width * devicePixelRatio, `viewport width.`);
    assert(viewportHeight == height * devicePixelRatio, `viewport height.`);
});

test(`webgpu gpu description`, async () => {
    const n = context.GPUDescription;
    assert(n, `webgpu gpu description, e.g Nvidia RTX 4060.`);
});
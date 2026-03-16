import { assert, beforeAll, expect, test } from 'vitest'
import { Compiler, Context } from '../src/index'

const width: number = 400, height: number = 400;
let context: Context;
let compiler: Compiler;

beforeAll(async () => {
    context = new Context({
        selector: "canvas",
        width: width,
        height: height,
        devicePixelRatio: window.devicePixelRatio,
        requestFeatures: []
    });
    await context.init()
    compiler = new Compiler(context);
});

test('compiler vaild.', async () => {
    expect(compiler != undefined).toBe(true);
});

test('compiler create vertex buffer.', async () => {
    let seed = 0;
    const vertexBuffer = compiler.createVertexBuffer({
        totalByteLength: 12 * 4,
        handler: () => {
            const arrayData = new Float32Array([-0.15 + Math.sin((seed++) * 0.01), -0.5, 0.5, -0.5, 0.0, 0.5, -0.55, -0.5, -0.05, 0.5, -0.55, 0.5]);
            return {
                rewrite: true,
                detail: {
                    offset: 0,
                    byteLength: arrayData.byteLength,
                    rawData: arrayData
                }
            };
        }
    });
    assert(vertexBuffer !== undefined, `vertex buffer vaild.`);
    assert(vertexBuffer.getByteLength() == 12 * 4, `vertex buffer byteLength.`);
    assert(vertexBuffer.getID() > 0, `vaild vertex buffer id`);
});

test('compiler create mapbuffer.', async () => {
    const storageMapBuffer = compiler.createMapBuffer({
        totalByteLength: 4,
        rawDataArray: [new Float32Array([1.0])],
        appendixBufferUsageFlags: GPUBufferUsage.STORAGE,
    });
    const querySetMapBuffer = compiler.createMapBuffer({
        totalByteLength: 4,
        rawDataArray: [new Float32Array([1.0])],
        appendixBufferUsageFlags: GPUBufferUsage.QUERY_RESOLVE,
    });
    assert(storageMapBuffer !== undefined, `storage map buffer vaild.`);
    assert(querySetMapBuffer !== undefined, `queryset map buffer valid.`)
});

test('compiler create texture2d.', async () => {
    const texture2d = compiler.createTexture2D({
        debugLabel: 1,
        width: 1024,
        height: 1024,
        mipmapCount: 7
    });
    assert(texture2d !== undefined, `texture2d vaild.`);
});

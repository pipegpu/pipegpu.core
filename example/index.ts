import {
    type ColorAttachment,
    Context,
    Compiler,
    BaseHolder,
    DepthStencilAttachment,
} from '../src/index'

import { initDrawCount } from './tech/initDrawCount';
import { initDrawIndexed } from './tech/initDrawIndexed';
import { initDrawInstance } from './tech/initDrawInstance';
import { initKTXTexture2D } from './tech/initKTXTexture2D';
import { initKTXTexture2DArray } from './tech/initKTXTexture2DArray';
import { initDrawIndriect } from './tech/initDrawIndirect';
import { initMultiDrawIndirect } from './tech/initMultiDrawIndirect';
import { initDrawIndexedIndirect } from './tech/initDrawIndexedIndirect.ts';
import { initMultiDrawIndexedIndirect } from './tech/initMultiDrawIndexedIndirect.ts';
import { initMultiDrawIndirectWithStorageVertex } from './tech/initMultiDrawIndirectWithStorageVertex.ts';
import { initTexelCopy } from './tech/initTexelCopy.ts';
import { initDrawWithArrayBuffer } from './tech/initDrawWithArrayBuffer.ts';
import { initReversedZ } from './tech/initReversedZ.ts';
import { initDeferred } from './tech/initDeferred.ts';
// import { initTextureCube } from './tech/initTextureCube.ts';
import { initDepthBias } from './tech/initDepthBias.ts';
import { initHZB } from './tech/initHZB.ts';

(async () => {

    const W = window.innerWidth;
    const H = window.innerHeight;
    const SELECTOR = `sketchpad`;
    const NEAR = 5.0;
    const FAR = 10000.0;
    const ASPECT = W / H;

    const context: Context = new Context({
        selector: SELECTOR,
        width: W,
        height: H,
        devicePixelRatio: devicePixelRatio,
        requestFeatures: ['texture-compression-bc', 'chromium-experimental-multi-draw-indirect']
    });
    await context.init();
    const compiler: Compiler = new Compiler({ context: context });
    {
        const canvas: HTMLCanvasElement = document.getElementById(SELECTOR) as HTMLCanvasElement;
        canvas.style.top = `0px`;
        canvas.style.position = `fixed`;
        canvas.style.pointerEvents = 'none';
    }

    // color attachments
    let colorAttachments: ColorAttachment[];
    {
        const surfaceTexture = compiler.createSurfaceTexture2D();
        const surfaceColorAttachment = compiler.createColorAttachment({
            texture: surfaceTexture,
            blendFormat: 'opaque',
            colorLoadStoreFormat: 'clearStore',
            clearColor: [0.0, 0.0, 0.0, 1.0]
        });
        colorAttachments = [surfaceColorAttachment];
    }

    // depth stencil attachment
    let depthStencilAttachment: DepthStencilAttachment;
    {
        const depthTexture = compiler.createTexture2D({
            width: context.getViewportWidth(),
            height: context.getViewportHeight(),
            textureFormat: context.getPreferredDepthTexuteFormat(),
        });
        depthStencilAttachment = compiler.createDepthStencilAttachment({
            texture: depthTexture,
            depthClearValue: 1.0,
            depthCompareFunction: 'less-equal',
        });
    }

    const holders: BaseHolder[] = [];
    // holders.push(initDrawCount(compiler, colorAttachments, depthStencilAttachment));
    // holders.push(await initKTXTexture2D(compiler, colorAttachments, depthStencilAttachment));
    // holders.push(initDrawIndexed(compiler, colorAttachments, depthStencilAttachment));
    // holders.push(initDrawInstance(compiler, colorAttachments, depthStencilAttachment));
    // holders.push(await initKTXTexture2DArray(compiler, colorAttachments, depthStencilAttachment));
    // holders.push(await initDrawIndriect(compiler, colorAttachments, depthStencilAttachment));
    // holders.push(await initMultiDrawIndirect(compiler, colorAttachments, depthStencilAttachment));
    // holders.push(await initDrawIndexedIndirect(compiler, colorAttachments, depthStencilAttachment));
    // holders.push(await initMultiDrawIndexedIndirect(compiler, colorAttachments, depthStencilAttachment));
    // holders.push(await initMultiDrawIndirectWithStorageVertex(compiler, colorAttachments, depthStencilAttachment));
    // holders.push(... await initTexelCopy(compiler, colorAttachments, depthStencilAttachment));
    // holders.push(await initDrawWithArrayBuffer(compiler, colorAttachments, depthStencilAttachment));
    // holders.push(await initReversedZ(context, compiler, colorAttachments, ASPECT, NEAR, FAR));
    // holders.push(...await initDeferred(context, compiler, colorAttachments, depthStencilAttachment, ASPECT, NEAR, FAR));
    // holders.push(await initDepthBias(context, compiler, colorAttachments, ASPECT, NEAR, FAR));
    holders.push(...await initHZB(context, compiler, colorAttachments, ASPECT, NEAR, FAR));

    // const textureCube = await initTextureCube(context, compiler, colorAttachments, ASPECT, NEAR, FAR);
    // const graph: OrderedGraph = new OrderedGraph(context);
    // const renderLoop = () => {
    //     graph.append(holder);
    //     graph.build();
    //     requestAnimationFrame(renderLoop);
    // };
    // requestAnimationFrame(renderLoop);

    // holderArray.push(drawIndexedStorage);
    // holderArray.push(texture2DHolder);
    // holderArray.push(drawCountHolder);
    // holderArray.push(drawIndexedHolder);
    // holderArray.push(drawInstanceHolder);
    // holderArray.push(texture2DArrayHolder);
    // holderArray.push(drawIndirect);
    // holderArray.push(multiDrawIndirect);
    // holderArray.push(drawIndexedIndirect);
    // holderArray.push(multiDrawIndexedIndirect);
    // holderArray.push(texelCopy[0]);
    // holderArray.push(texelCopy[1]);
    // holderArray.push(dawWithArrayBuffer);
    // holderArray.push(reversedZ);
    // holderArray.push(deferred[0]);
    // holderArray.push(deferred[1]);
    // holderArray.push(textureCube);
    // holders.push(depthBias);
    // holders.push(...hierarchicalZBuffer);

    const renderLoop = async () => {
        context.refreshFrameResource();

        const encoder = context.getCommandEncoder();
        holders.forEach(element => {
            element.build(encoder);
        });

        context.submitFrameResource();
        // const rawDebugBuffer = await texelCopyDebugBuffer.PullDataAsync(0, 4);
        // const f32DebugBuffer = new Float32Array(rawDebugBuffer as ArrayBuffer);
        // console.log(f32DebugBuffer);
        requestAnimationFrame(renderLoop);
    };

    renderLoop();
})();



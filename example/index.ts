import {
    type ColorAttachment,
    Context,
    Compiler,
    BaseLet,
    DepthStencilAttachment,
    RenderLet,
} from '../index';

import { ControlTYPE, InitControlPannel } from './ui.ts';

import { initDrawCount } from './tech/initDrawCount';
import { initDrawIndexed } from './tech/initDrawIndexed';
import { initDrawInstance } from './tech/initDrawInstance';
import { initDrawKTX2Texture2D } from './tech/initKTXTexture2D';
import { initDrawKTX2Texture2DArray } from './tech/initKTXTexture2DArray';
import { initDrawIndriect } from './tech/initDrawIndirect';
import { initMultiDrawIndirect } from './tech/initMultiDrawIndirect';
import { initDrawIndexedIndirect } from './tech/initDrawIndexedIndirect.ts';
import { initMultiDrawIndexedIndirect } from './tech/initMultiDrawIndexedIndirect.ts';
import { initMultiDrawIndirectWithStorageVertex } from './tech/initMultiDrawIndirectWithStorageVertex.ts';
import { initTexelCopy } from './tech/initTexelCopy.ts';
import { initDrawWithArrayBuffer } from './tech/initDrawWithArrayBuffer.ts';
import { initReversedZ } from './tech/initReversedZ.ts';
import { initDeferred } from './tech/initDeferred.ts';
import { initTextureCube } from './tech/initTextureCube.ts';
import { initDepthBias } from './tech/initDepthBias.ts';
import { initHZB } from './tech/initHZB.ts';
import { initDrawMeshlet } from './tech/initDrawMeshlet';

type Controls = {
    t: ControlTYPE;
    drawCountLet?: RenderLet;
    drawIndexedLet?: RenderLet;
    drawInstanceLet?: RenderLet;
    drawKtx2Texutre2DLet?: RenderLet;
    rawKTX2Texture2DArrayLet?: RenderLet;
}

(async () => {

    const W = window.innerWidth;
    const H = window.innerHeight;
    const SELECTOR = `sketchpad`;
    // const NEAR = 5.0;
    // const FAR = 10000.0;
    // const ASPECT = W / H;

    const context: Context = new Context({
        selector: SELECTOR,
        width: W,
        height: H,
        devicePixelRatio: devicePixelRatio,
        requestFeatures: ['texture-compression-bc'] // 'chromium-experimental-multi-draw-indirect'
    });
    await context.init();

    const compiler: Compiler = new Compiler(context);
    {
        const canvas: HTMLCanvasElement = document.getElementById(SELECTOR) as HTMLCanvasElement;
        canvas.style.top = `0px`;
        canvas.style.position = `fixed`;
        // canvas.style.pointerEvents = 'none';
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

    const ctl: Controls = { t: 'initDrawCount' };

    InitControlPannel(ctl);

    // holders.push();
    // holders.push();
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
    // holders.push(...await initHZB(context, compiler, colorAttachments, ASPECT, NEAR, FAR));
    // holders.push(await initDrawMeshlet(compiler, colorAttachments, depthStencilAttachment));

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
        const passes: BaseLet[] = [];
        switch (ctl.t) {
            case "initDrawCount": {
                ctl.drawCountLet = ctl.drawCountLet || initDrawCount(compiler, colorAttachments, depthStencilAttachment);
                passes.push(ctl.drawCountLet);
                break;
            }
            case 'initDrawIndexed': {
                ctl.drawIndexedLet = ctl.drawIndexedLet || initDrawIndexed(compiler, colorAttachments, depthStencilAttachment);
                passes.push(ctl.drawIndexedLet);
                break;
            }
            case 'initKTX2Texture2D': {
                ctl.drawKtx2Texutre2DLet = ctl.drawKtx2Texutre2DLet || await initDrawKTX2Texture2D(compiler, colorAttachments, depthStencilAttachment);
                passes.push(ctl.drawKtx2Texutre2DLet);
                break;
            }
            default:
                break;
        }

        // WARNING:: refresh resource need all cpu side resorce update finished.
        context.refreshFrameResource();

        const encoder = context.getCommandEncoder();
        passes.forEach(element => {
            element.build(encoder);
        });

        context.submitFrameResource();

        requestAnimationFrame(renderLoop);
    };

    await renderLoop();
})();



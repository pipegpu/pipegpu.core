import {
    type ColorAttachment,
    Context,
    Compiler,
    BaseLet,
    DepthStencilAttachment,
    RenderLet
} from '../index';

import { type ControlTYPE, InitControlPannel } from './ui.ts';

import { initDrawCount } from './tech/initDrawCount';
import { initDrawIndexed } from './tech/initDrawIndexed';
import { initDrawInstanced } from './tech/initDrawInstanced.ts';
import { initDrawKTX2Texture2D as initKTX2Texture2D } from './tech/initDrawKTX2Texture2D.ts';
import { initDrawKTX2Texture2DArray as initKTX2Texture2DArray } from './tech/initDrawKTX2Texture2DArray.ts';
import { initDrawIndriect } from './tech/initDrawIndirect';
import { initMultiDrawIndirect } from './tech/initMultiDrawIndirect';
import { initDrawIndexedIndirect } from './tech/initDrawIndexedIndirect.ts';
import { initMultiDrawIndexedIndirect } from './tech/initMultiDrawIndexedIndirect.ts';
import { initMultiDrawIndirectWithStorageVertex } from './tech/initMultiDrawIndirectWithStorageVertex.ts';
import { initDrawWithArrayBuffer } from './tech/initDrawWithArrayBuffer.ts';
import { initReversedZ } from './tech/initReversedZ.ts';
import { initDeferred } from './tech/initDeferred.ts';
import { initTextureCube } from './tech/initTextureCube.ts';
import { initDepthBias } from './tech/initDepthBias.ts';
import { initHZB } from './tech/initHZB.ts';

type Controls = {
    t: ControlTYPE;

    drawCountLet?: RenderLet;
    drawIndexedLet?: RenderLet;
    drawInstancedLet?: RenderLet;
    drawIndirectLet?: RenderLet;
    drawIndexedIndirectLet?: RenderLet;
    drawWithArrayBufferLet?: RenderLet;
    multiDrawIndirectLet?: RenderLet;
    multiDrawIndexedIndirect?: RenderLet;
    multiDrawIndirectWithStorageVertexLet?: RenderLet;
    reversedZLet?: RenderLet;
    deferredLets?: BaseLet[];
    textureCubeLet?: RenderLet;
    depthBiasLet?: RenderLet;
    hzbLets?: BaseLet[];
    ktx2Texutre2DLet?: RenderLet;
    kTX2Texture2DArrayLet?: RenderLet;
}

(async () => {

    const W = window.innerWidth;
    const H = window.innerHeight;
    const NEAR = 5.0;
    const FAR = 10000.0;
    const ASPECT = W / H;

    const SELECTOR = `sketchpad`;

    /**
     * @description
     * - 'chromium-experimental-multi-draw-indirect'
     */
    const context: Context = new Context({
        selector: SELECTOR,
        width: W,
        height: H,
        devicePixelRatio: devicePixelRatio,
        requestFeatures: ['texture-compression-bc', 'chromium-experimental-multi-draw-indirect']
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

    // default ctl.
    const ctl: Controls = { t: 'drawCountLet' };

    InitControlPannel(ctl);

    const renderLoop = async () => {
        const passes: BaseLet[] = [];
        switch (ctl.t) {
            case "drawCountLet": {
                ctl.drawCountLet = ctl.drawCountLet || initDrawCount(compiler, colorAttachments, depthStencilAttachment);
                passes.push(ctl.drawCountLet);
                break;
            }
            case 'drawIndexedLet': {
                ctl.drawIndexedLet = ctl.drawIndexedLet || initDrawIndexed(compiler, colorAttachments, depthStencilAttachment);
                passes.push(ctl.drawIndexedLet);
                break;
            }
            case 'ktx2Texutre2DLet': {
                ctl.ktx2Texutre2DLet = ctl.ktx2Texutre2DLet || await initKTX2Texture2D(compiler, colorAttachments, depthStencilAttachment);
                passes.push(ctl.ktx2Texutre2DLet);
                break;
            }
            case 'ktx2Texture2DArrayLet': {
                ctl.kTX2Texture2DArrayLet = ctl.kTX2Texture2DArrayLet || await initKTX2Texture2DArray(compiler, colorAttachments, depthStencilAttachment);
                passes.push(ctl.kTX2Texture2DArrayLet);
                break;
            }
            case 'drawInstancedLet': {
                ctl.drawInstancedLet = ctl.drawInstancedLet || initDrawInstanced(compiler, colorAttachments, depthStencilAttachment);
                passes.push(ctl.drawInstancedLet);
                break;
            }
            case 'drawIndirectLet': {
                ctl.drawIndirectLet = ctl.drawIndirectLet || initDrawIndriect(compiler, colorAttachments, depthStencilAttachment);
                passes.push(ctl.drawIndirectLet);
                break;
            }
            case 'drawIndexedIndirectLet': {
                ctl.drawIndexedIndirectLet = ctl.drawIndexedIndirectLet || initDrawIndexedIndirect(compiler, colorAttachments, depthStencilAttachment);
                passes.push(ctl.drawIndexedIndirectLet);
                break;
            }
            case 'drawWithArrayBufferLet': {
                ctl.drawWithArrayBufferLet = ctl.drawWithArrayBufferLet || initDrawWithArrayBuffer(compiler, colorAttachments, depthStencilAttachment);
                passes.push(ctl.drawWithArrayBufferLet);
                break;
            }
            case 'multiDrawIndirectLet': {
                ctl.multiDrawIndirectLet = ctl.multiDrawIndirectLet || initMultiDrawIndirect(compiler, colorAttachments, depthStencilAttachment);
                passes.push(ctl.multiDrawIndirectLet);
                break;
            }
            case 'multiDrawIndexedIndirectLet': {
                ctl.multiDrawIndexedIndirect = ctl.multiDrawIndexedIndirect || initMultiDrawIndexedIndirect(compiler, colorAttachments, depthStencilAttachment);
                passes.push(ctl.multiDrawIndexedIndirect);
                break;
            }
            case 'multiDrawIndirectWithStorageVertexLet': {
                ctl.multiDrawIndirectWithStorageVertexLet = ctl.multiDrawIndirectWithStorageVertexLet || initMultiDrawIndirectWithStorageVertex(compiler, colorAttachments, depthStencilAttachment);
                passes.push(ctl.multiDrawIndirectWithStorageVertexLet);
                break;
            }
            case 'reversedZLet': {
                ctl.reversedZLet = ctl.reversedZLet || await initReversedZ(context, compiler, colorAttachments, ASPECT, NEAR, FAR);
                passes.push(ctl.reversedZLet);
                break;
            }
            case 'deferredLet': {
                ctl.deferredLets = ctl.deferredLets || await initDeferred(context, compiler, colorAttachments, depthStencilAttachment, ASPECT, NEAR, FAR);
                passes.push(...ctl.deferredLets);
                break;
            }
            case 'textureCubeLet': {
                ctl.textureCubeLet = ctl.textureCubeLet || await initTextureCube(context, compiler, colorAttachments, ASPECT, NEAR, FAR);
                passes.push(ctl.textureCubeLet);
                break;
            }
            case 'depthBiasLet': {
                ctl.depthBiasLet = ctl.depthBiasLet || await initDepthBias(context, compiler, colorAttachments, ASPECT, NEAR, FAR);
                passes.push(ctl.depthBiasLet);
                break;
            }
            case 'hzbLets': {
                ctl.hzbLets = ctl.hzbLets || await initHZB(context, compiler, colorAttachments, ASPECT, NEAR, FAR);
                passes.push(...ctl.hzbLets);
                break;
            }
            default: {
                break;
            }
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



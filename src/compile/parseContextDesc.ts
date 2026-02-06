import type { FeatureNameFormat } from "../res/Format";

/**
 * @description
 * pipegup context descriptor
 * @interface IContextOpts
 */
interface IContextOpts {
    /**
     * selector for the element to be used as a context
     * for example: 'canvas'
     */
    selector: string | HTMLCanvasElement;

    /**
     * 
     * width of the context
     * style width
     * e.g
     * - htmlCanvas.style.width = `${width}px`;
     *
     */
    width: number;

    /**
     * 
     * height of the context
     * style height
     * e.g
     * - htmlCanvas.style.height = `${height}px`;
     *
     */
    height: number;

    /**
     * pixel ratio of the context
     * @description this is the ratio of the device pixel ratio to the css pixel ratio
     */
    devicePixelRatio: number;

    /**
     * 
     */
    requestFeatures?: FeatureNameFormat[];
}

/**
 * @function createCanvasElement
 * @param container 
 * @param width 
 * @param height 
 * @param devicePixelRatio 
 */
const createCanvasElement = (
    container: HTMLElement,
    width: number,
    height: number,
    devicePixelRatio: number
): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const w = width || container.clientWidth || window.innerWidth;
    const h = height || container.clientHeight || window.innerHeight;
    canvas.width = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;
    canvas.style.border = `0px`;
    canvas.style.margin = `0px`;
    canvas.style.padding = `0px`;
    canvas.style.top = `0px`;
    canvas.style.left = `0px`;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    container === document.body ? canvas.style.position = 'absolute' : null;
    container.appendChild(canvas);
    return canvas;
}

/**
 * @function ContextDesc
 * @description
 * @param container
 * @param width
 * @param height
 * @param devicePixelRatio
 */
interface ContextDesc extends IContextOpts {
    /**
     * @description
     * @param container the container element to be used as a context
     */
    container: HTMLElement;

    /**
     * @description
     * @param canvas the canvas element to be used as a context
     */
    canvas: HTMLCanvasElement;

    /**
     * 
     */
    viewportWidth: number;

    /**
     * 
     */
    viewportHeight: number;
}

/**
 * @function parseContextDesc
 * @description
 * @param opts 
 */
const parseContextDesc = (opts: IContextOpts): ContextDesc => {
    const container = document.body;
    let canvas: HTMLCanvasElement;
    if (opts.selector instanceof HTMLCanvasElement) {
        canvas = opts.selector;
    } else if (typeof opts.selector == 'string' && opts.selector.constructor == String) {
        canvas = document.getElementById(opts.selector) as HTMLCanvasElement;
    } else {
        throw new Error(`[E][parseContextDesc] opts.selector invalid.`);
    }
    const viewportWidth = opts.width * devicePixelRatio;
    const viewportHeight = opts.height * devicePixelRatio;
    if (canvas) {
        canvas.width = viewportWidth;
        canvas.height = viewportHeight;
        canvas.style.border = `0px`;
        canvas.style.margin = `0px`;
        canvas.style.padding = `0px`;
        canvas.style.top = `0px`;
        canvas.style.left = `0px`;
        canvas.style.width = `${opts.width}px`;
        canvas.style.height = `${opts.height}px`;
    } else {
        canvas = createCanvasElement(container, opts.width, opts.height, opts.devicePixelRatio);
    }
    let desc: ContextDesc = {
        selector: opts.selector,
        width: opts.width,
        height: opts.height,
        viewportWidth: viewportWidth,
        viewportHeight: viewportHeight,
        devicePixelRatio: opts.devicePixelRatio || devicePixelRatio || 1.0,
        container: container,
        canvas: canvas,
    };
    return desc;
}

export {
    type IContextOpts,
    type ContextDesc,
    parseContextDesc
}
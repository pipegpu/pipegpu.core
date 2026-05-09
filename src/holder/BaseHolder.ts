import type { Context } from "../res/Context"
import type { PropertyFormat } from "../res/Format"

/**
 * 
 * @class BaseHolder
 * 
 */
abstract class BaseHolder {
    /**
     * 
     */
    private id: number;

    /**
     * 
     */
    protected context: Context;

    /**
     * 
     */
    private poropertyFormat: PropertyFormat;

    /**
     * 
     */
    protected debugLabel: string;

    /**
     * @warning !!!
     *  order should maintain by graph itself, please be carful assign the value of order.
     * @description
     */
    private order_: number = -1;
    get Order(): number {
        return this.order_;
    }
    set Order(v: number) {
        this.order_ = v;
    }

    /**
     * @param opts 
     */
    constructor(
        opts: {
            debugLabel: string,
            id: number,
            context: Context,
            poropertyFormat: PropertyFormat
        }
    ) {
        this.id = opts.id;
        this.context = opts.context;
        this.poropertyFormat = opts.poropertyFormat;
        this.debugLabel = opts.debugLabel;
    }

    /**
     * 
     * @returns 
     * 
     */
    getID = (): number => {
        return this.id;
    }

    /**
     * 
     * @returns 
     * 
     */
    getDebugLabel = (): string => {
        return this.debugLabel;
    }

    /**
     * 
     * @returns 
     * 
     */
    getPropertyFormat = (): PropertyFormat => {
        return this.poropertyFormat;
    }

    /**
     * 
     * @param encoder 
     * 
     */
    abstract build(_encoder: GPUCommandEncoder): void;
}

export {
    BaseHolder
}
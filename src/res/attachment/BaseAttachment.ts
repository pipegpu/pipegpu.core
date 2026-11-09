import type { Context } from "../Context";

/**
 * @class BaseAttachment
 */
abstract class BaseAttachment {
    /**
     * 
     */
    private id: number;

    /**
     * 
     */
    protected context: Context;

    /**
     * @param opts 
     */
    constructor(
        opts: {
            id: number,
            context: Context
        }
    ) {
        this.context = opts.context;
        this.id = opts.id;
    }

    /**
     * @function getID
     */
    getID = (): number => {
        return this.id;
    }

    /**
     * @protected
     * @abstract
     * @function updateState
     */
    protected abstract updateState(): void;

    /**
     * @protected
     * @abstract
     * @function updateAttachment
     */
    protected abstract updateAttachment(): void;
}

export {
    BaseAttachment
}
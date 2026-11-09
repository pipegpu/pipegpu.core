import type { Context } from "../Context";
import type { PropertyFormat } from "../Format";

/**
 * @description
 *  Base class for all pipeline objects.
 */
class BasePipeline {
    /**
     * @description Get the ID of the pipeline.
     */
    private id: number;

    /**
     * @description Get the context associated with the pipeline.
     */
    protected context: Context;

    /**
     * @description Get the property format of the pipeline.
     */
    private propertyFormat: PropertyFormat;

    /**
     * 
     * @param opts 
     */
    constructor(
        opts: {
            id: number,
            context: Context,
            propertyFormat: PropertyFormat
        }
    ) {
        this.id = opts.id;
        this.context = opts.context;
        this.propertyFormat = opts.propertyFormat;
    }

    /**
     * @description Get the ID of the pipeline.
     * @returns {number}
     */
    getID = () => {
        return this.id;
    }

    /**
     * @description Get the property format of the pipeline.
     * @returns {PropertyFormat}
     */
    getPropertyFormat = () => {
        return this.propertyFormat;
    }
}

export {
    BasePipeline
}
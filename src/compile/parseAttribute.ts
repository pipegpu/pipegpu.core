import type { VertexBufferProperty } from "../property/attribute/VertexBufferProperty"
import type { BaseProperty } from "../property/BaseProperty"
import type { Attributes } from "../property/Properties"
import type { PropertyFormat } from "../res/Format"

/**
 * 
 */
interface IAttributeRecord {
    name: string,
    offset: number,
    stride: number,
    type: PropertyFormat,
    normalized: boolean
}

/**
 * 
 * @param opts 
 * 
 */
const parseAttribute = (
    opts: {
        debugLabel?: string,
        attributes?: Attributes,
        attributeRecordMap: Map<string, IAttributeRecord>,
        bufferAttributeRecordsMap: Map<number, Map<string, IAttributeRecord>>
    }
): void => {
    if (opts.attributes?.isEmpty()) {
        return;
    }
    const appendBufferIDWithAttributeRecords = (bufferID: number, record: IAttributeRecord): void => {
        if (!opts.bufferAttributeRecordsMap.has(bufferID)) {
            const records: Map<string, IAttributeRecord> = new Map();
            opts.bufferAttributeRecordsMap.set(bufferID, records);
        }
        const records = opts.bufferAttributeRecordsMap.get(bufferID);
        records?.set(record.name, record);
    }
    const propertyMap: Map<string, BaseProperty> | undefined = opts.attributes?.getPropertyMap();
    propertyMap?.forEach((propertyBase: BaseProperty, propertyName: string) => {
        const t: PropertyFormat = propertyBase.getPropertyFormat();
        switch (t) {
            case "vertexBuffer":
                {
                    const vertexBufferProperty: VertexBufferProperty = propertyBase as VertexBufferProperty;
                    const bufferID: number = vertexBufferProperty.getVertexBufferID();
                    let record: IAttributeRecord = {
                        name: propertyName,
                        type: t,
                        offset: 0,
                        stride: 0,
                        normalized: false
                    };
                    appendBufferIDWithAttributeRecords(bufferID, record);
                    opts.attributeRecordMap.set(propertyName, record);
                    break;
                }
            default:
                {
                    throw new Error(`[E][ParseAttribute][holder][name] ${opts.debugLabel} unsupport property type: ${t}`);
                }
        }
    });
}

export {
    type IAttributeRecord,
    parseAttribute
}
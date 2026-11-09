/**
 * @description Generates a unique numeric ID each time it is called.
 */
let idx: number = 1;
const uniqueID = (): number => {
    return idx++;
}

export {
    uniqueID
}
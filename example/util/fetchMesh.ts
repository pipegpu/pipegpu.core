import { vec3, type Vec3 } from "wgpu-matrix";

type MeshDataPack = {
    positions: Float32Array,
    normals: Float32Array,
    triangles: Uint32Array,
};

const makeTriangleIndicesFn = function (triangles: [number, number, number][]) {
    let triNdx = 0;
    let vNdx = 0;
    const fn = function () {
        const ndx = triangles[triNdx][vNdx++];
        if (vNdx === 3) {
            vNdx = 0;
            ++triNdx;
        }
        return ndx;
    };
    fn.reset = function () {
        triNdx = 0;
        vNdx = 0;
    };
    fn.numElements = triangles.length * 3;
    return fn;
};

const generateNormals = function (maxAngle: number, positions: [number, number, number][], triangles: [number, number, number][]) {
    // first compute the normal of each face
    const getNextIndex = makeTriangleIndicesFn(triangles);
    const numFaceVerts = getNextIndex.numElements;
    const numVerts = positions.length;
    const numFaces = numFaceVerts / 3;
    const faceNormals: Vec3[] = [];

    // Compute the normal for every face.
    // While doing that, create a new vertex for every face vertex
    for (let i = 0; i < numFaces; ++i) {
        const n1 = getNextIndex();
        const n2 = getNextIndex();
        const n3 = getNextIndex();

        const v1 = positions[n1];
        const v2 = positions[n2];
        const v3 = positions[n3];

        faceNormals.push(
            vec3.normalize(vec3.cross(vec3.subtract(v2, v1), vec3.subtract(v3, v1)))
        );
    }

    let tempVerts: any = {};
    let tempVertNdx = 0;

    // this assumes vertex positions are an exact match

    function getVertIndex(vert: [number, number, number]): number {
        const vertId = JSON.stringify(vert);
        const ndx = tempVerts[vertId];
        if (ndx !== undefined) {
            return ndx;
        }
        const newNdx = tempVertNdx++;
        tempVerts[vertId] = newNdx;
        return newNdx;
    }

    // We need to figure out the shared vertices.
    // It's not as simple as looking at the faces (triangles)
    // because for example if we have a standard cylinder
    //
    //
    //      3-4
    //     /   \
    //    2     5   Looking down a cylinder starting at S
    //    |     |   and going around to E, E and S are not
    //    1     6   the same vertex in the data we have
    //     \   /    as they don't share UV coords.
    //      S/E
    //
    // the vertices at the start and end do not share vertices
    // since they have different UVs but if you don't consider
    // them to share vertices they will get the wrong normals

    const vertIndices: number[] = [];
    for (let i = 0; i < numVerts; ++i) {
        const vert = positions[i];
        vertIndices.push(getVertIndex(vert));
    }

    // go through every vertex and record which faces it's on
    const vertFaces: number[][] = [];
    getNextIndex.reset();
    for (let i = 0; i < numFaces; ++i) {
        for (let j = 0; j < 3; ++j) {
            const ndx = getNextIndex();
            const sharedNdx = vertIndices[ndx];
            let faces = vertFaces[sharedNdx];
            if (!faces) {
                faces = [];
                vertFaces[sharedNdx] = faces;
            }
            faces.push(i);
        }
    }

    // now go through every face and compute the normals for each
    // vertex of the face. Only include faces that aren't more than
    // maxAngle different. Add the result to arrays of newPositions,
    // newTexcoords and newNormals, discarding any vertices that
    // are the same.
    tempVerts = {};
    tempVertNdx = 0;
    const newPositions: [number, number, number][] = [];
    const newNormals: [number, number, number][] = [];

    function getNewVertIndex(
        position: [number, number, number],
        normal: [number, number, number]
    ) {
        const vertId = JSON.stringify({ position, normal });
        const ndx = tempVerts[vertId];
        if (ndx !== undefined) {
            return ndx;
        }
        const newNdx = tempVertNdx++;
        tempVerts[vertId] = newNdx;
        newPositions.push(position);
        newNormals.push(normal);
        return newNdx;
    }

    const newTriangles: [number, number, number][] = [];
    getNextIndex.reset();
    const maxAngleCos = Math.cos(maxAngle);
    // for each face
    for (let i = 0; i < numFaces; ++i) {
        // get the normal for this face
        const thisFaceNormal = faceNormals[i];
        // for each vertex on the face
        const newTriangle: number[] = [];
        for (let j = 0; j < 3; ++j) {
            const ndx = getNextIndex();
            const sharedNdx = vertIndices[ndx];
            const faces = vertFaces[sharedNdx];
            const norm = [0, 0, 0] as [number, number, number];
            faces.forEach((faceNdx: number) => {
                // is this face facing the same way
                const otherFaceNormal = faceNormals[faceNdx];
                const dot = vec3.dot(thisFaceNormal, otherFaceNormal);
                if (dot > maxAngleCos) {
                    vec3.add(norm, otherFaceNormal, norm);
                }
            });
            vec3.normalize(norm, norm);
            newTriangle.push(getNewVertIndex(positions[ndx], norm));
        }
        newTriangles.push(newTriangle as [number, number, number]);
    }

    return {
        positions: newPositions,
        normals: newNormals,
        triangles: newTriangles,
    };
}

const fetchMesh = async (uri: string): Promise<MeshDataPack> => {
    try {
        const response = await fetch(uri);
        if (!response.ok) {
            throw new Error(`[E][fetchMesh] fetch mesh failed, response code: ${response.status}`);
        }
        const json = await response.json();
        const { positions, normals, triangles } = generateNormals(
            Math.PI,
            json.positions as [number, number, number][],
            json.cells as [number, number, number][]
        );
        return {
            positions: new Float32Array(positions.flat()),
            normals: new Float32Array(normals.flat()),
            triangles: new Uint32Array(triangles.flat()),
        }
    }
    catch (error) {
        throw new Error(`[E][fetchMesh] fetch mesh failed, response code: ${error}`);
    }
};


export {
    type MeshDataPack,
    fetchMesh
}

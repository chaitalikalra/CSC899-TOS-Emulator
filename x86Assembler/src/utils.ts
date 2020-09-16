import { assert } from "./error";

function uint16(n: number): number {
    return (n & 0xffff) >>> 0;
}

function uint8(n: number): number {
    return (n & 0xff) >>> 0;
}

function uint32(n: number): number {
    // https://stackoverflow.com/questions/6798111/bitwise-operations-on-32-bit-unsigned-ints
    return (n & 0xffffffff) >>> 0;
}

function get_uint(n: number, data_size: number): number {
    assert(
        [1, 2, 4].indexOf(data_size) != -1,
        "Invalid data size for get_uint"
    );

    switch (data_size) {
        case 1:
            return uint8(n);
        case 2:
            return uint16(n);
        case 4:
            return uint32(n);
    }
}

function deepcopy(obj: object): object {
    return JSON.parse(JSON.stringify(obj));
}

export { get_uint, uint8, uint16, uint32, deepcopy
 };

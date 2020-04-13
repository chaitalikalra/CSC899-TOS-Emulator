function assert(condition: boolean, message: string = ""): void {
    if (!condition) throw new Error(message);
}

function get_sign_mask(data_size: number = 4): number {
    assert(
        [1, 2, 4].indexOf(data_size) != -1,
        "Invalid data size for get_sign_mask"
    );
    return 1 << (data_size * 8 - 1);
}

function uint16(n: number): number {
    return (n & 0xffff) >>> 0;
}

function uint8(n: number): number {
    return (n & 0xff) >>> 0;
}

function uint32(n: number): number {
    // https://stackoverflow.com/questions/6798111/bitwise-operations-on-32-bit-unsigned-ints
    return (n & 0xffffffff)>>>0;
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

function get_parity(data: number): boolean {
    let last_byte: number = data & 0xff;
    let count: number = 0;
    while (last_byte != 0) {
        count++;
        last_byte = last_byte & (last_byte - 1);
    }
    return (count & 1) == 0;
}

function get_uint_mask(data_size: number): number {
    assert(
        [1, 2, 4].indexOf(data_size) != -1,
        "Invalid data size for get_uint_mask"
    );

    switch (data_size) {
        case 1:
            return 0xff;
        case 2:
            return 0xffff;
        case 4:
            return 0xffffffff;
    }
}

export { assert, get_uint, get_sign_mask, get_parity, get_uint_mask };

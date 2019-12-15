import {
    InstructionFunc,
    InstructionSuffix,
    get_data_size_src_dest,
    get_data_size_dest
} from "./x86_instruction";
import { CPU } from "../cpu";
import { AssembledCode } from "../assembled_code";
import { Operand, OperandType } from "../instruction";
import { assert, get_sign_mask, get_parity, get_uint } from "../utils";

const add: InstructionFunc = function(
    suffix: InstructionSuffix | null = null,
    cpu: CPU,
    assembled_code: AssembledCode,
    operands: Operand[]
) {
    assert(operands.length == 2, "sum instruction takes 2 operands");
    let src: Operand = operands[0];
    let dst: Operand = operands[1];
    assert(
        dst.type == OperandType.IndirectAddress ||
            dst.type == OperandType.Register,
        "Destination can only be a register or memory address for sum instruction."
    );
    assert(
        !(
            src.type == OperandType.IndirectAddress &&
            dst.type == OperandType.IndirectAddress
        ),
        "sum operator does not support memory to memory operations"
    );

    let data_size: number = get_data_size_src_dest(suffix, src, dst);
    let op1: number = cpu.readValue(src, data_size);
    let op2: number = cpu.readValue(dst, data_size);
    let result: number = op1 + op2;

    set_some_flags(result, cpu, data_size);

    // Set CF and OF
    let uint_result: number = get_uint(result, data_size);
    cpu.eFlags.set_carry_flag(result != uint_result);
    if ((op1 & get_sign_mask(data_size)) == (op2 & get_sign_mask(data_size))) {
        cpu.eFlags.set_overflow_flag(
            (op1 & get_sign_mask(data_size)) !=
                (uint_result & get_sign_mask(data_size))
        );
    } else {
        cpu.eFlags.set_overflow_flag(false);
    }
    cpu.writeValue(dst, result, data_size);
};

const sub: InstructionFunc = function(
    suffix: InstructionSuffix | null = null,
    cpu: CPU,
    assembled_code: AssembledCode,
    operands: Operand[]
) {
    assert(operands.length == 2, "sub instruction takes 2 operands");
    let src: Operand = operands[0];
    let dst: Operand = operands[1];
    assert(
        dst.type == OperandType.IndirectAddress ||
            dst.type == OperandType.Register,
        "Destination can only be a register or memory address for sum instruction."
    );
    assert(
        !(
            src.type == OperandType.IndirectAddress &&
            dst.type == OperandType.IndirectAddress
        ),
        "sum operator does not support memory to memory operations"
    );

    let data_size: number = get_data_size_src_dest(suffix, src, dst);
    let op1: number = cpu.readValue(src, data_size);
    // Calculate a - b = a + (-b)
    let op2: number = -1 * cpu.readValue(dst, data_size);
    let result: number = op1 + op2;

    set_some_flags(result, cpu, data_size);

    // Set CF and OF
    let uint_result: number = get_uint(result, data_size);

    // Carry flag for subtraction is inverse of the addition
    /* https://stackoverflow.com/questions/8053053/how-does-an-adder-perform-unsigned-integer-subtraction/8061989#8061989 */
    cpu.eFlags.set_carry_flag(result == uint_result);

    if ((op1 & get_sign_mask(data_size)) == (op2 & get_sign_mask(data_size))) {
        cpu.eFlags.set_overflow_flag(
            (op1 & get_sign_mask(data_size)) !=
                (uint_result & get_sign_mask(data_size))
        );
    } else {
        cpu.eFlags.set_overflow_flag(false);
    }
    cpu.writeValue(dst, result, data_size);
};

function increment(
    suffix: InstructionSuffix | null = null,
    cpu: CPU,
    operands: Operand[],
    increment_by: number = 1
): void {
    assert(
        operands.length == 1,
        "inc and dec instructions takes only 1 operand"
    );
    let dst: Operand = operands[0];
    assert(
        dst.type == OperandType.IndirectAddress ||
            dst.type == OperandType.Register,
        "Operand to inc or dec can only be register or memory."
    );
    let data_size: number = get_data_size_dest(suffix, dst);
    let op1: number = cpu.readValue(dst, data_size);
    let result: number = op1 + increment_by;
    set_some_flags(result, cpu, data_size);
    // Set only OF
    // inc and dec do not impact carry flag
    let uint_result: number = get_uint(result, data_size);
    if (
        (op1 & get_sign_mask(data_size)) ==
        (increment_by & get_sign_mask(data_size))
    ) {
        cpu.eFlags.set_overflow_flag(
            (op1 & get_sign_mask(data_size)) !=
                (uint_result & get_sign_mask(data_size))
        );
    } else {
        cpu.eFlags.set_overflow_flag(false);
    }
    cpu.writeValue(dst, result, data_size);
}

const inc: InstructionFunc = function(
    suffix: InstructionSuffix | null = null,
    cpu: CPU,
    assembled_code: AssembledCode,
    operands: Operand[]
): void {
    increment(suffix, cpu, operands);
};

const dec: InstructionFunc = function(
    suffix: InstructionSuffix | null = null,
    cpu: CPU,
    assembled_code: AssembledCode,
    operands: Operand[]
): void {
    increment(suffix, cpu, operands, -1);
};

function set_some_flags(result: number, cpu: CPU, data_size: number): void {
    // https://x86.puri.sm/html/file_module_x86_id_12.html
    // Arithmetic instructions do the following:
    // The OF, SF, ZF, CF, and PF flags are set according to the result.

    // Set only SF, ZF and PF. OF and CF are set in individual functions
    let uint_result: number = get_uint(result, data_size);

    cpu.eFlags.set_zero_flag(uint_result == 0);
    cpu.eFlags.set_sign_flag(Boolean(uint_result & get_sign_mask(data_size)));
    cpu.eFlags.set_parity_flag(get_parity(uint_result));
}

export { add, sub, inc, dec };

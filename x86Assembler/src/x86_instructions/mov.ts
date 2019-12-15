import {
  InstructionFunc,
  InstructionSuffix,
  get_data_size_src_dest
} from "./x86_instruction";
import { CPU } from "../cpu";
import { AssembledCode } from "../assembled_code";
import { Operand, OperandType, RegisterOperand } from "../instruction";
import { assert } from "../utils";
import { Register } from "../register";

const move: InstructionFunc = function(
  suffix: InstructionSuffix | null = null,
  cpu: CPU,
  assembled_code: AssembledCode,
  operands: Operand[]
) {
  assert(operands.length == 2, "mov instructions take 2 operands");

  let src: Operand = operands[0];
  let dst: Operand = operands[1];

  assert(
    dst.type == OperandType.IndirectAddress || dst.type == OperandType.Register,
    "mov destination can only be a register or memory address"
  );

  assert(
    !(
      src.type == OperandType.IndirectAddress &&
      dst.type == OperandType.IndirectAddress
    ),
    "mov does not support memory to memory transfer"
  );

  let data_size: number = get_data_size_src_dest(suffix, src, dst);

  cpu.writeValue(dst, cpu.readValue(src, data_size), data_size);
};

const lea: InstructionFunc = function(
  suffix: InstructionSuffix | null = null,
  cpu: CPU,
  assembled_code: AssembledCode,
  operands: Operand[]
) {
  assert(operands.length == 2, "lea instructions take 2 operands");

  let src: Operand = operands[0];
  let dst: Operand = operands[1];

  assert(dst.type == OperandType.Register, "lea dst can only be a register");
  let byte_length: number = (dst.getValue() as Register).byteLength;
  assert(byte_length >= 2, "lea dst can only be 16/32 bit register");
  assert(
    src.type == OperandType.IndirectAddress ||
      src.type == OperandType.NumericConstant,
    "lea src can only be a memory address or a constant"
  );

  cpu.writeValue(dst, src.getValue(), byte_length);
};

export { move, lea };

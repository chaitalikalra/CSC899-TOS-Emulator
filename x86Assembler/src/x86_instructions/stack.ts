import { InstructionFunc, InstructionSuffix } from "./x86_instruction";
import { CPU } from "../cpu";
import { AssembledCode } from "../assembled_code";
import { Operand, OperandType, RegisterOperand } from "../instruction";
import { assert } from "../utils";

const pop: InstructionFunc = function(
  suffix: InstructionSuffix | null = null,
  cpu: CPU,
  assembled_code: AssembledCode,
  operands: Operand[]
): void {
  assert(operands.length == 1, "pop instructions takes 1 operand");
  let dst: Operand = operands[0];
  assert(
    dst.type == OperandType.IndirectAddress || dst.type == OperandType.Register,
    "pop instruction operand can be only memory or register"
  );
  let byte_length: number = _get_byte_length_stack_instruction(suffix, dst);
  cpu.writeValue(dst, cpu.popStack(byte_length), byte_length);
};

const push: InstructionFunc = function(
  suffix: InstructionSuffix | null = null,
  cpu: CPU,
  assembled_code: AssembledCode,
  operands: Operand[]
): void {
  assert(operands.length == 1, "pop instructions takes 1 operand");
  let src: Operand = operands[0];
  let byte_length: number = _get_byte_length_stack_instruction(suffix, src);
  cpu.pushStack(cpu.readValue(src, byte_length), byte_length);
};

function _get_byte_length_stack_instruction(
  suffix: InstructionSuffix | null,
  op: Operand
): number {
  let byte_length: number = 4;
  if (suffix == null) {
    if (op.type == OperandType.Register) {
      byte_length = (op as RegisterOperand).getValue().byteLength;
      assert(byte_length >= 2, "stack opperations work only with word or long");
    }
  } else {
    byte_length = suffix;
    if (op.type == OperandType.Register) {
      assert(
        byte_length == (op as RegisterOperand).getValue().byteLength,
        "instruction suffix and register byte length should match"
      );
    }
  }
  return byte_length;
}

export { push, pop };

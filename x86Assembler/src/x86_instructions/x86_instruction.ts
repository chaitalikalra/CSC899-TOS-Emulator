import { CPU } from "../cpu";
import { AssembledCode } from "../assembled_code";
import { Operand, OperandType, RegisterOperand } from "../instruction";

import { move, lea } from "./mov";
import { pop, push } from "./stack";
import { and, xor, or } from "./logical";
import { add, sub, inc, dec } from "./arithmetic"

enum InstructionSuffix {
    Byte = 1,
    Word = 2,
    Long = 4
}

interface InstructionFunc {
    (
        suffix: InstructionSuffix | null,
        cpu: CPU,
        assembled_code: AssembledCode,
        operands: Operand[]
    ): void;
}

const InstructionSet = {
    mov: move.bind(null, null),
    movb: move.bind(null, InstructionSuffix.Byte),
    movw: move.bind(null, InstructionSuffix.Word),
    movl: move.bind(null, InstructionSuffix.Long),
    lea: lea.bind(null, null),
    leaw: lea.bind(null, InstructionSuffix.Word),
    leal: lea.bind(null, InstructionSuffix.Long),
    pop: pop.bind(null, null),
    popw: pop.bind(null, InstructionSuffix.Word),
    popl: pop.bind(null, InstructionSuffix.Long),
    push: push.bind(null, null),
    pushw: push.bind(null, InstructionSuffix.Word),
    pushl: push.bind(null, InstructionSuffix.Long),
    and: and.bind(null, null),
    andb: and.bind(null, InstructionSuffix.Byte),
    andw: and.bind(null, InstructionSuffix.Word),
    andl: and.bind(null, InstructionSuffix.Long),
    or: or.bind(null, null),
    orb: or.bind(null, InstructionSuffix.Byte),
    orw: or.bind(null, InstructionSuffix.Word),
    orl: or.bind(null, InstructionSuffix.Long),
    xor: or.bind(null, null),
    xorb: xor.bind(null, InstructionSuffix.Byte),
    xorw: xor.bind(null, InstructionSuffix.Word),
    xorl: xor.bind(null, InstructionSuffix.Long),
    add: add.bind(null, null),
    addb: add.bind(null, InstructionSuffix.Byte),
    addw: add.bind(null, InstructionSuffix.Word),
    addl: add.bind(null, InstructionSuffix.Long),
    sub: sub.bind(null, null),
    subb: sub.bind(null, InstructionSuffix.Byte),
    subw: sub.bind(null, InstructionSuffix.Word),
    subl: sub.bind(null, InstructionSuffix.Long),
    inc: inc.bind(null, null),
    incb: inc.bind(null, InstructionSuffix.Byte),
    incw: inc.bind(null, InstructionSuffix.Word),
    incl: inc.bind(null, InstructionSuffix.Long),
    dec: dec.bind(null, null),
    decb: dec.bind(null, InstructionSuffix.Byte),
    decw: dec.bind(null, InstructionSuffix.Word),
    decl: dec.bind(null, InstructionSuffix.Long),
};

function get_data_size_src_dest(
    suffix: InstructionSuffix | null = null,
    src: Operand,
    dst: Operand
): number {
    let data_size: number = 4;
    if (dst.type == OperandType.Register) {
        data_size = (dst as RegisterOperand).register.byteLength;
    } else if (src.type == OperandType.Register) {
        data_size = (src as RegisterOperand).register.byteLength;
    } else if (suffix != null) {
        data_size = suffix;
    }

    return data_size;
}

function get_data_size_dest(
  suffix: InstructionSuffix | null = null,
  dst: Operand
): number {
  let data_size: number = 4;
  if (dst.type == OperandType.Register) {
      data_size = (dst as RegisterOperand).register.byteLength;
  } else if (suffix != null) {
      data_size = suffix;
  }
  return data_size;
}

export {
    InstructionFunc,
    InstructionSet,
    InstructionSuffix,
    get_data_size_src_dest,
    get_data_size_dest
};

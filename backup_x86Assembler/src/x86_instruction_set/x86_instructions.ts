import { InstructionOperandSize } from "../instruction";
import { MovInstruction, LeaInstruction } from "./mov";
import { PopInstruction, PushInstruction } from "./stack";
import { AndInstruction, OrInstruction, XorInstruction } from "./logical";
import { AddInstruction, SubInstruction, IncOperator, DecOperator } from "./arithmetic";

const InstructionSet = {
    mov: MovInstruction.bind(null, null),
    movb: MovInstruction.bind(null, InstructionOperandSize.Byte),
    movw: MovInstruction.bind(null, InstructionOperandSize.Word),
    movl: MovInstruction.bind(null, InstructionOperandSize.Long),
    lea: LeaInstruction.bind(null, null),
    leaw: LeaInstruction.bind(null, InstructionOperandSize.Word),
    leal: LeaInstruction.bind(null, InstructionOperandSize.Long),
    pop: PopInstruction.bind(null, null),
    popw: PopInstruction.bind(null, InstructionOperandSize.Word),
    popl: PopInstruction.bind(null, InstructionOperandSize.Long),
    push: PushInstruction.bind(null, null),
    pushw: PushInstruction.bind(null, InstructionOperandSize.Word),
    pushl: PushInstruction.bind(null, InstructionOperandSize.Long),
    and: AndInstruction.bind(null, null),
    andb: AndInstruction.bind(null, InstructionOperandSize.Byte),
    andw: AndInstruction.bind(null, InstructionOperandSize.Word),
    andl: AndInstruction.bind(null, InstructionOperandSize.Long),
    or: OrInstruction.bind(null, null),
    orb: OrInstruction.bind(null, InstructionOperandSize.Byte),
    orw: OrInstruction.bind(null, InstructionOperandSize.Word),
    orl: OrInstruction.bind(null, InstructionOperandSize.Long),
    xor: XorInstruction.bind(null, null),
    xorb: XorInstruction.bind(null, InstructionOperandSize.Byte),
    xorw: XorInstruction.bind(null, InstructionOperandSize.Word),
    xorl: XorInstruction.bind(null, InstructionOperandSize.Long),
    add: AddInstruction.bind(null, null),
    addb: AddInstruction.bind(null, InstructionOperandSize.Byte),
    addw: AddInstruction.bind(null, InstructionOperandSize.Word),
    addl: AddInstruction.bind(null, InstructionOperandSize.Long),
    sub: SubInstruction.bind(null, null),
    subb: SubInstruction.bind(null, InstructionOperandSize.Byte),
    subw: SubInstruction.bind(null, InstructionOperandSize.Word),
    subl: SubInstruction.bind(null, InstructionOperandSize.Long),
    inc: IncOperator.bind(null, null),
    incb: IncOperator.bind(null, InstructionOperandSize.Byte),
    incw: IncOperator.bind(null, InstructionOperandSize.Word),
    incl: IncOperator.bind(null, InstructionOperandSize.Long),
    dec: DecOperator.bind(null, null),
    decb: DecOperator.bind(null, InstructionOperandSize.Byte),
    decw: DecOperator.bind(null, InstructionOperandSize.Word),
    decl: DecOperator.bind(null, InstructionOperandSize.Long),
};

export { InstructionSet };

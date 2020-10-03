import { InstructionOperandSize } from "../instruction";
import { MovInstruction, LeaInstruction } from "./mov";
import { PopInstruction, PushInstruction } from "./stack";
import { AndInstruction, OrInstruction, XorInstruction } from "./logical";
import { AddInstruction, SubInstruction, IncInstruction, DecInstruction } from "./arithmetic";
import { JmpInstruction, JmpNZInstruction } from "./jmp";
import { RetInstruction, CallInstruction } from "./procedure";

const InstructionSet = {
    mov: MovInstruction.bind(null, null),
    movb: MovInstruction.bind(null, InstructionOperandSize.Byte),
    movw: MovInstruction.bind(null, InstructionOperandSize.Word),
    movl: MovInstruction.bind(null, InstructionOperandSize.Long),
    lea: LeaInstruction.bind(null, null),
    leab: LeaInstruction.bind(null, InstructionOperandSize.Byte),
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
    inc: IncInstruction.bind(null, null),
    incb: IncInstruction.bind(null, InstructionOperandSize.Byte),
    incw: IncInstruction.bind(null, InstructionOperandSize.Word),
    incl: IncInstruction.bind(null, InstructionOperandSize.Long),
    dec: DecInstruction.bind(null, null),
    decb: DecInstruction.bind(null, InstructionOperandSize.Byte),
    decw: DecInstruction.bind(null, InstructionOperandSize.Word),
    decl: DecInstruction.bind(null, InstructionOperandSize.Long),
    jmp: JmpInstruction.bind(null, null),
    jnz: JmpNZInstruction.bind(null, null),
    ret: RetInstruction.bind(null, null),
    call: CallInstruction.bind(null, null),
};

export { InstructionSet };

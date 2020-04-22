import { MovInstruction, LeaInstruction } from "./mov";
import { NopInstruction } from "./nop";
import { PushInstruction } from "./stack";
import { AndInstruction, OrInstruction, XorInstruction } from "./logical";
import { AddInstruction, SubInstruction, IncInstruction, DecInstruction } from "./arithmetic";

const InstructionSet = {
    mov: MovInstruction.bind(null, "mov"),
    lea: LeaInstruction.bind(null, "lea"),
    nop: NopInstruction.bind(null, "nop"),
    push: PushInstruction.bind(null, "push"),
    pop: PushInstruction.bind(null, "pop"),
    and: AndInstruction.bind(null, "and"),
    or: OrInstruction.bind(null, "or"),
    xor: XorInstruction.bind(null, "xor"),
    add: AddInstruction.bind(null, "add"),
    sub: SubInstruction.bind(null, "sub"),
    inc: IncInstruction.bind(null, "inc"),
    dec: DecInstruction.bind(null, "dec"),
};

export { InstructionSet };

import { MovInstruction, LeaInstruction } from "./mov";
import { NopInstruction } from "./nop";
import {
    PushInstruction,
    PopInstruction,
    PushfInstruction,
    PushfdInstruction,
    PopfInstruction,
    PopfdInstruction,
    PopadInstruction,
    PopaInstruction,
    PushadInstruction,
    PushaInstruction,
} from "./stack";
import { AndInstruction, OrInstruction, XorInstruction } from "./logical";
import {
    AddInstruction,
    SubInstruction,
    IncInstruction,
    DecInstruction,
} from "./arithmetic";
import { JmpInstruction, JnzInstruction } from "./jmp";
import { CallInstruction, RetInstruction } from "./procedure";

const InstructionSet = {
    mov: MovInstruction.bind(null, "mov"),
    lea: LeaInstruction.bind(null, "lea"),
    nop: NopInstruction.bind(null, "nop"),
    push: PushInstruction.bind(null, "push"),
    pop: PopInstruction.bind(null, "pop"),
    and: AndInstruction.bind(null, "and"),
    or: OrInstruction.bind(null, "or"),
    xor: XorInstruction.bind(null, "xor"),
    add: AddInstruction.bind(null, "add"),
    sub: SubInstruction.bind(null, "sub"),
    inc: IncInstruction.bind(null, "inc"),
    dec: DecInstruction.bind(null, "dec"),
    jmp: JmpInstruction.bind(null, "jmp"),
    jnz: JnzInstruction.bind(null, "jnz"),
    jne: JnzInstruction.bind(null, "jne"),
    call: CallInstruction.bind(null, "call"),
    ret: RetInstruction.bind(null, "ret"),
    pushf: PushfInstruction.bind(null, "pushf"),
    pushfd: PushfdInstruction.bind(null, "pushfd"),
    popf: PopfInstruction.bind(null, "popf"),
    popfd: PopfdInstruction.bind(null, "popfd"),
    pusha: PushaInstruction.bind(null, "pusha"),
    pushad: PushadInstruction.bind(null, "pushad"),
    popa: PopaInstruction.bind(null, "popa"),
    popad: PopadInstruction.bind(null, "popad"),
};

export { InstructionSet };

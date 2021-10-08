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
import {
    ClcInstruction,
    CldInstruction,
    CliInstruction,
    CmcInstruction,
    LahfInstruction,
    SahfInstruction,
    StcInstruction,
    StdInstruction,
    StiInstruction,
} from "./eflags";
import {
    RclInstruction,
    RcrInstruction,
    RolInstruction,
    RorInstruction,
    SalInstruction,
    SarInstruction,
    ShlInstruction,
    ShrInstruction,
} from "./shift_rotate";

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
    lahf: LahfInstruction.bind(null, "lahf"),
    sahf: SahfInstruction.bind(null, "sahf"),
    stc: StcInstruction.bind(null, "stc"),
    std: StdInstruction.bind(null, "std"),
    sti: StiInstruction.bind(null, "sti"),
    clc: ClcInstruction.bind(null, "clc"),
    cld: CldInstruction.bind(null, "cld"),
    cli: CliInstruction.bind(null, "cli"),
    cmc: CmcInstruction.bind(null, "cmc"),
    shl: ShlInstruction.bind(null, "shl"),
    shr: ShrInstruction.bind(null, "shr"),
    sal: SalInstruction.bind(null, "sal"),
    sar: SarInstruction.bind(null, "sar"),
    rol: RolInstruction.bind(null, "rol"),
    ror: RorInstruction.bind(null, "ror"),
    rcl: RclInstruction.bind(null, "rcl"),
    rcr: RcrInstruction.bind(null, "rcr"),
};

export { InstructionSet };

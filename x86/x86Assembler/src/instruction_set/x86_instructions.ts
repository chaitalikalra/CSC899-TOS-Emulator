import { InstructionOperandSize } from "../instruction";
import { MovInstruction, LeaInstruction } from "./mov";
import {
    PopAllInstruction,
    PopFlagsInstruction,
    PopInstruction,
    PushAllInstruction,
    PushFlagsInstruction,
    PushInstruction,
} from "./stack";
import {
    AndInstruction,
    NotInstruction,
    OrInstruction,
    TestInstruction,
    XorInstruction,
} from "./logical";
import {
    AddInstruction,
    SubInstruction,
    IncInstruction,
    DecInstruction,
    AddWithCarryInstruction,
    SubWithBorrowInstruction,
    NegInstruction,
    CmpInstruction,
    MulInstruction,
    ImulInstruction,
    DivInstruction,
    IdivInstruction,
} from "./arithmetic";
import { JmpInstruction, JmpNZInstruction } from "./jmp";
import { RetInstruction, CallInstruction } from "./procedure";
import { NopInstruction } from "./nop";
import {
    ClearCarryFlagInstruction,
    ClearDirectionFlagInstruction,
    ClearInterruptFlagInstruction,
    ComplementCarryFlagInstruction,
    LahfInstruction,
    SahfInstruction,
    SetCarryFlagInstruction,
    SetDirectionFlagInstruction,
    SetInterruptFlagInstruction,
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
    not: NotInstruction.bind(null, null),
    notb: NotInstruction.bind(null, InstructionOperandSize.Byte),
    notw: NotInstruction.bind(null, InstructionOperandSize.Word),
    notl: NotInstruction.bind(null, InstructionOperandSize.Long),
    test: TestInstruction.bind(null, null),
    testb: TestInstruction.bind(null, InstructionOperandSize.Byte),
    testw: TestInstruction.bind(null, InstructionOperandSize.Word),
    testl: TestInstruction.bind(null, InstructionOperandSize.Long),
    add: AddInstruction.bind(null, null),
    addb: AddInstruction.bind(null, InstructionOperandSize.Byte),
    addw: AddInstruction.bind(null, InstructionOperandSize.Word),
    addl: AddInstruction.bind(null, InstructionOperandSize.Long),
    adc: AddWithCarryInstruction.bind(null, null),
    adcb: AddWithCarryInstruction.bind(null, InstructionOperandSize.Byte),
    adcw: AddWithCarryInstruction.bind(null, InstructionOperandSize.Word),
    adcl: AddWithCarryInstruction.bind(null, InstructionOperandSize.Long),
    sub: SubInstruction.bind(null, null),
    subb: SubInstruction.bind(null, InstructionOperandSize.Byte),
    subw: SubInstruction.bind(null, InstructionOperandSize.Word),
    subl: SubInstruction.bind(null, InstructionOperandSize.Long),
    sbb: SubWithBorrowInstruction.bind(null, null),
    sbbb: SubWithBorrowInstruction.bind(null, InstructionOperandSize.Byte),
    sbbw: SubWithBorrowInstruction.bind(null, InstructionOperandSize.Word),
    sbbl: SubWithBorrowInstruction.bind(null, InstructionOperandSize.Long),
    inc: IncInstruction.bind(null, null),
    incb: IncInstruction.bind(null, InstructionOperandSize.Byte),
    incw: IncInstruction.bind(null, InstructionOperandSize.Word),
    incl: IncInstruction.bind(null, InstructionOperandSize.Long),
    dec: DecInstruction.bind(null, null),
    decb: DecInstruction.bind(null, InstructionOperandSize.Byte),
    decw: DecInstruction.bind(null, InstructionOperandSize.Word),
    decl: DecInstruction.bind(null, InstructionOperandSize.Long),
    neg: NegInstruction.bind(null, null),
    negb: NegInstruction.bind(null, InstructionOperandSize.Byte),
    negw: NegInstruction.bind(null, InstructionOperandSize.Word),
    negl: NegInstruction.bind(null, InstructionOperandSize.Long),
    cmp: CmpInstruction.bind(null, null),
    cmpb: CmpInstruction.bind(null, InstructionOperandSize.Byte),
    cmpw: CmpInstruction.bind(null, InstructionOperandSize.Word),
    cmpl: CmpInstruction.bind(null, InstructionOperandSize.Long),
    jmp: JmpInstruction.bind(null, null),
    jnz: JmpNZInstruction.bind(null, null),
    ret: RetInstruction.bind(null, null),
    call: CallInstruction.bind(null, null),
    nop: NopInstruction.bind(null, null),
    pushf: PushFlagsInstruction.bind(null, InstructionOperandSize.Word),
    pushfd: PushFlagsInstruction.bind(null, InstructionOperandSize.Long),
    popf: PopFlagsInstruction.bind(null, InstructionOperandSize.Word),
    popfd: PopFlagsInstruction.bind(null, InstructionOperandSize.Long),
    pusha: PushAllInstruction.bind(null, InstructionOperandSize.Word),
    pushad: PushAllInstruction.bind(null, InstructionOperandSize.Long),
    popa: PopAllInstruction.bind(null, InstructionOperandSize.Word),
    popad: PopAllInstruction.bind(null, InstructionOperandSize.Long),
    lahf: LahfInstruction.bind(null, null),
    sahf: SahfInstruction.bind(null, null),
    stc: SetCarryFlagInstruction.bind(null, null),
    clc: ClearCarryFlagInstruction.bind(null, null),
    cmc: ComplementCarryFlagInstruction.bind(null, null),
    sti: SetInterruptFlagInstruction.bind(null, null),
    cli: ClearInterruptFlagInstruction.bind(null, null),
    std: SetDirectionFlagInstruction.bind(null, null),
    cld: ClearDirectionFlagInstruction.bind(null, null),
    sal: SalInstruction.bind(null, null),
    salb: SalInstruction.bind(null, InstructionOperandSize.Byte),
    salw: SalInstruction.bind(null, InstructionOperandSize.Word),
    sall: SalInstruction.bind(null, InstructionOperandSize.Long),
    sar: SarInstruction.bind(null, null),
    sarb: SarInstruction.bind(null, InstructionOperandSize.Byte),
    sarw: SarInstruction.bind(null, InstructionOperandSize.Word),
    sarl: SarInstruction.bind(null, InstructionOperandSize.Long),
    shl: ShlInstruction.bind(null, null),
    shlb: ShlInstruction.bind(null, InstructionOperandSize.Byte),
    shlw: ShlInstruction.bind(null, InstructionOperandSize.Word),
    shll: ShlInstruction.bind(null, InstructionOperandSize.Long),
    shr: ShrInstruction.bind(null, null),
    shrb: ShrInstruction.bind(null, InstructionOperandSize.Byte),
    shrw: ShrInstruction.bind(null, InstructionOperandSize.Word),
    shrl: ShrInstruction.bind(null, InstructionOperandSize.Long),
    rol: RolInstruction.bind(null, null),
    rolb: RolInstruction.bind(null, InstructionOperandSize.Byte),
    rolw: RolInstruction.bind(null, InstructionOperandSize.Word),
    roll: RolInstruction.bind(null, InstructionOperandSize.Long),
    ror: RorInstruction.bind(null, null),
    rorb: RorInstruction.bind(null, InstructionOperandSize.Byte),
    rorw: RorInstruction.bind(null, InstructionOperandSize.Word),
    rorl: RorInstruction.bind(null, InstructionOperandSize.Long),
    rcl: RclInstruction.bind(null, null),
    rclb: RclInstruction.bind(null, InstructionOperandSize.Byte),
    rclw: RclInstruction.bind(null, InstructionOperandSize.Word),
    rcll: RclInstruction.bind(null, InstructionOperandSize.Long),
    rcr: RcrInstruction.bind(null, null),
    rcrb: RcrInstruction.bind(null, InstructionOperandSize.Byte),
    rcrw: RcrInstruction.bind(null, InstructionOperandSize.Word),
    rcrl: RcrInstruction.bind(null, InstructionOperandSize.Long),
    mul: MulInstruction.bind(null, null),
    mulb: MulInstruction.bind(null, InstructionOperandSize.Byte),
    mulw: MulInstruction.bind(null, InstructionOperandSize.Word),
    mull: MulInstruction.bind(null, InstructionOperandSize.Long),
    imul: ImulInstruction.bind(null, null),
    imulb: ImulInstruction.bind(null, InstructionOperandSize.Byte),
    imulw: ImulInstruction.bind(null, InstructionOperandSize.Word),
    imull: ImulInstruction.bind(null, InstructionOperandSize.Long),
    div: DivInstruction.bind(null, null),
    divb: DivInstruction.bind(null, InstructionOperandSize.Byte),
    divw: DivInstruction.bind(null, InstructionOperandSize.Word),
    divl: DivInstruction.bind(null, InstructionOperandSize.Long),
    idiv: IdivInstruction.bind(null, null),
    idivb: IdivInstruction.bind(null, InstructionOperandSize.Byte),
    idivw: IdivInstruction.bind(null, InstructionOperandSize.Word),
    idivl: IdivInstruction.bind(null, InstructionOperandSize.Long),
};

export { InstructionSet };

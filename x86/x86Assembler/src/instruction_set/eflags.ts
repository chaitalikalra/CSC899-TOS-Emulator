import { Instruction } from "../instruction";
import { assert } from "../error";
import { AssembledProgram } from "../assembler";
import { combineMachineCode } from "../assembler_utils";

abstract class FlagInstruction extends Instruction {
    abstract readonly Opcode: number[];

    protected validateInstruction_(): void {
        assert(
            this.operands.length == 0,
            "instruction does not take any operands"
        );
    }

    calculateLength(): number {
        // Only 1 byte for opcode
        return 1;
    }

    generateMachineCode(assembledProgram: AssembledProgram, idx: number): void {
        this.machineCode = combineMachineCode([], this.Opcode);
    }
}

class LahfInstruction extends FlagInstruction {
    readonly Opcode: number[] = [0x9f];

    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "stc";
    }
}

class SahfInstruction extends FlagInstruction {
    readonly Opcode: number[] = [0x9e];

    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "stc";
    }
}

class SetCarryFlagInstruction extends FlagInstruction {
    readonly Opcode: number[] = [0xf9];

    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "stc";
    }
}

class ClearCarryFlagInstruction extends FlagInstruction {
    readonly Opcode: number[] = [0xf8];

    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "clc";
    }
}

class ComplementCarryFlagInstruction extends FlagInstruction {
    readonly Opcode: number[] = [0xf5];

    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "cmc";
    }
}

class SetInterruptFlagInstruction extends FlagInstruction {
    readonly Opcode: number[] = [0xfb];

    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "sti";
    }
}

class ClearInterruptFlagInstruction extends FlagInstruction {
    readonly Opcode: number[] = [0xfa];

    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "cli";
    }
}

class SetDirectionFlagInstruction extends FlagInstruction {
    readonly Opcode: number[] = [0xfd];

    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "std";
    }
}

class ClearDirectionFlagInstruction extends FlagInstruction {
    readonly Opcode: number[] = [0xfc];

    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "cld";
    }
}

export {
    LahfInstruction,
    SahfInstruction,
    SetCarryFlagInstruction,
    SetInterruptFlagInstruction,
    SetDirectionFlagInstruction,
    ClearCarryFlagInstruction,
    ClearInterruptFlagInstruction,
    ClearDirectionFlagInstruction,
    ComplementCarryFlagInstruction,
};

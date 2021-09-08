import { Instruction } from "../instruction";
import {
    Operand,
    OperandType,
    RegisterOperand,
    NumericConstantOperand,
} from "../operand";
import { assert } from "../error";
import { uint8 } from "../utils";
import { AssembledProgram } from "../assembler";
import {
    OPERAND_SIZE_OVERRIDE,
    fillModRmSibDisp,
    getImmediateBytes,
    combineMachineCode,
    REGISTER_CODES,
    getModRmSibDispLength,
} from "../assembler_utils";

abstract class ShiftRotateInstruction extends Instruction {
    readonly OpcodeRmOnly: number = 0xd0;
    readonly OpcodeRmCl: number = 0xd2;
    readonly OpcodeRmImm: number = 0xc0;
    abstract readonly RegValue: number;
    abstract readonly BaseMnemonic: string;

    protected setBaseMnemonic_(): void {
        this.baseMnemonic = this.BaseMnemonic;
    }

    private getDestAndCounterOperands_(): [Operand, Operand | null] {
        if (this.operands.length == 2)
            return [this.operands[1], this.operands[0]];
        else return [this.operands[0], null];
    }

    protected validateInstruction_(): void {
        assert(
            this.operands.length == 1 || this.operands.length == 2,
            this.operator + " instruction takes at most 2 operands"
        );

        let [dst, counter] = this.getDestAndCounterOperands_();
        assert(
            dst.type == OperandType.IndirectAddress ||
                dst.type == OperandType.Register,
            "Destination can only be a register or memory address for " +
                this.operator +
                " instruction."
        );
        if (counter != null) {
            assert(
                counter.type == OperandType.NumericConstant ||
                    (counter.type == OperandType.Register &&
                        (counter as RegisterOperand).name == "cl"),
                "Counter for " +
                    this.operator +
                    " instruction must be either a constant or CL register."
            );
            if (counter.type == OperandType.NumericConstant) {
                let val: number = (counter as NumericConstantOperand).value;
                assert(
                    val == uint8(val),
                    "Counter for " + this.operator + " must be 1 byte"
                );
            }
        }
    }

    calculateLength(): number {
        let instructionLength: number = 0;
        // For 16-bit operands, we add a prefix byte
        if (this.operandSize == 2) {
            instructionLength += 1;
        }
        // Add 1 byte for opcode
        instructionLength += 1;
        let [dst, counter] = this.getDestAndCounterOperands_();
        // Add bytes for Mod-reg-rm, sib and disp bytes
        instructionLength += getModRmSibDispLength(dst);
        // Add 1 byte if counter is immediate
        if (counter != null && counter.type == OperandType.NumericConstant)
            instructionLength += getModRmSibDispLength(dst);
        return instructionLength;
    }

    generateMachineCode(assembledProgram: AssembledProgram, idx: number): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_285.html
        // Reference: https://c9x.me/x86/html/file_module_x86_id_273.html
        let prefix: number[] = [];
        if (this.operandSize == 2) {
            prefix.push(OPERAND_SIZE_OVERRIDE);
        }
        let [dst, counter] = this.getDestAndCounterOperands_();
        // Opcode for 16/32 bit instructions is 1 more than opcode for 8 bits
        let valueToAdd: number = this.operandSize > 1 ? 1 : 0;
        let opcode: number[] = [];
        let mod_rm_sib_disp: number[] = fillModRmSibDisp(
            dst,
            null,
            this.RegValue
        );
        let immediate: number[] = [];

        if (counter != null) {
            if (counter.type == OperandType.Register)
                // If Counter is CL
                opcode.push(this.OpcodeRmCl + valueToAdd);
            else if ((counter as NumericConstantOperand).value == 1)
                // Set counter to null, so that no Imm opcode  can be used
                counter = null;
            else {
                // Any other Imm value
                opcode.push(this.OpcodeRmImm + valueToAdd);
                immediate = getImmediateBytes(
                    (counter as NumericConstantOperand).getValue(),
                    1
                );
            }
        }
        // We have an if here because counter can be set to null if the
        // immediate operand is 1
        // For example: "sal $1, %eax" is same as "sal %eax"
        if (counter == null) {
            opcode.push(this.OpcodeRmOnly + valueToAdd);
        }

        this.machineCode = combineMachineCode(
            prefix,
            opcode,
            mod_rm_sib_disp,
            immediate
        );
    }
}

class SalInstruction extends ShiftRotateInstruction {
    readonly BaseMnemonic: string = "sal";
    readonly RegValue: number = 4;
}

class SarInstruction extends ShiftRotateInstruction {
    readonly BaseMnemonic: string = "sar";
    readonly RegValue: number = 7;
}

class ShlInstruction extends ShiftRotateInstruction {
    readonly BaseMnemonic: string = "shl";
    readonly RegValue: number = 4;
}

class ShrInstruction extends ShiftRotateInstruction {
    readonly BaseMnemonic: string = "shr";
    readonly RegValue: number = 5;
}

class RclInstruction extends ShiftRotateInstruction {
    readonly BaseMnemonic: string = "rcl";
    readonly RegValue: number = 2;
}

class RcrInstruction extends ShiftRotateInstruction {
    readonly BaseMnemonic: string = "rcr";
    readonly RegValue: number = 3;
}

class RolInstruction extends ShiftRotateInstruction {
    readonly BaseMnemonic: string = "rol";
    readonly RegValue: number = 0;
}

class RorInstruction extends ShiftRotateInstruction {
    readonly BaseMnemonic: string = "ror";
    readonly RegValue: number = 1;
}

export {
    SalInstruction,
    SarInstruction,
    ShlInstruction,
    ShrInstruction,
    RclInstruction,
    RcrInstruction,
    RolInstruction,
    RorInstruction,
};

import { Instruction } from "../instruction";
import { assert } from "../error";
import {
    Operand,
    OperandType,
    RegisterOperand,
    NumericConstantOperand,
} from "../operand";
import { AssembledProgram } from "../assembler";
import {
    OPERAND_SIZE_OVERRIDE,
    REGISTER_CODES,
    fillModRmSibDisp,
    combineMachineCode,
    getImmediateBytes,
    getModRmSibDispLength,
} from "../assembler_utils";

class PopInstruction extends Instruction {
    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "pop";
    }

    protected validateInstruction_(): void {
        assert(this.operands.length == 1, "pop instructions takes 1 operand");
        let dst: Operand = this.operands[0];
        assert(
            dst.type == OperandType.IndirectAddress ||
                dst.type == OperandType.Register,
            "pop instruction operand can be only memory or register"
        );
        assert(
            this.operandSize >= 2,
            "pop operand size can only be 16/32 bits"
        );
    }

    calculateLength(): number {
        let instructionLength: number = 0;
        // For 16-bit operands, we add a prefix byte
        if (this.operandSize == 2) {
            instructionLength += 1;
        }
        // Add 1 byte for opcode
        instructionLength += 1;
        let dst: Operand = this.operands[0];
        if (dst.type != OperandType.Register) {
            instructionLength += getModRmSibDispLength(dst);
        }
        return instructionLength;
    }

    generateMachineCode(assembledProgram: AssembledProgram, idx: number): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_248.html
        let prefix: number[] = [];
        if (this.operandSize == 2) {
            prefix.push(OPERAND_SIZE_OVERRIDE);
        }
        let dst: Operand = this.operands[0];
        let opcode: number[] = [];
        let mod_rm_sib_disp: number[] = [];

        if (dst.type == OperandType.Register) {
            // Pop to register
            let base_opcode: number = 0x58;
            opcode.push(
                base_opcode + REGISTER_CODES[(dst as RegisterOperand).name]
            );
        } else {
            // Pop to memory
            opcode.push(0x8f);
            mod_rm_sib_disp = fillModRmSibDisp(dst, null, 0);
        }
        this.machineCode = combineMachineCode(
            (prefix = prefix),
            (opcode = opcode),
            (mod_rm_sib_disp = mod_rm_sib_disp)
        );
    }
}

class PushInstruction extends Instruction {
    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "push";
    }

    protected validateInstruction_(): void {
        assert(this.operands.length == 1, "push instructions takes 1 operand");
        assert(
            this.operandSize >= 2,
            "push operand size can only be 16/32 bits"
        );
    }

    calculateLength(): number {
        let instructionLength: number = 0;
        // For 16-bit operands, we add a prefix byte
        if (this.operandSize == 2) {
            instructionLength += 1;
        }
        // Add 1 byte for opcode
        instructionLength += 1;
        let src: Operand = this.operands[0];
        if (src.type == OperandType.NumericConstant) {
            instructionLength += this.operandSize;
        } else if (src.type == OperandType.IndirectAddress) {
            instructionLength += getModRmSibDispLength(src);
        }
        return instructionLength;
    }

    generateMachineCode(assembledProgram: AssembledProgram, idx: number): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_269.html
        let prefix: number[] = [];
        if (this.operandSize == 2) {
            prefix.push(OPERAND_SIZE_OVERRIDE);
        }
        let src: Operand = this.operands[0];
        let opcode: number[] = [];
        let mod_rm_sib_disp: number[] = [];
        let immediate: number[] = [];

        if (src.type == OperandType.NumericConstant) {
            // Push Immediate Value
            if (this.operandSize == 1) opcode.push(0x6a);
            else opcode.push(0x68);
            immediate = getImmediateBytes(
                (src as NumericConstantOperand).getValue(),
                this.operandSize
            );
        } else if (src.type == OperandType.Register) {
            // Push Register value
            let base_opcode: number = 0x50;
            opcode.push(
                base_opcode + REGISTER_CODES[(src as RegisterOperand).name]
            );
        } else {
            // Push Memory
            opcode.push(0xff);
            mod_rm_sib_disp = fillModRmSibDisp(src, null, 6);
        }
        this.machineCode = combineMachineCode(
            prefix,
            opcode,
            mod_rm_sib_disp,
            immediate
        );
    }
}

class PushFlagsInstruction extends Instruction {
    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "pushf";
    }

    protected validateInstruction_(): void {
        assert(this.operands.length == 0, "pushf does not take any operands");
        assert(
            this.operandSize >= 2,
            "pushf operand size can only be 16/32 bits"
        );
    }

    calculateLength(): number {
        // 1 byte for opcode + 1 additional prefix byte for 16 bits
        return 1 + (this.operandSize == 2 ? 1 : 0);
    }

    generateMachineCode(assembledProgram: AssembledProgram, idx: number): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_271.html
        let prefix: number[] = [];
        if (this.operandSize == 2) {
            prefix.push(OPERAND_SIZE_OVERRIDE);
        }
        let opcode: number[] = [0x9c];
        this.machineCode = combineMachineCode(prefix, opcode);
    }
}

class PopFlagsInstruction extends Instruction {
    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "popf";
    }

    protected validateInstruction_(): void {
        assert(this.operands.length == 0, "popf does not take any operands");
        assert(
            this.operandSize >= 2,
            "popf operand size can only be 16/32 bits"
        );
    }

    calculateLength(): number {
        // 1 byte for opcode + 1 additional prefix byte for 16 bits
        return 1 + (this.operandSize == 2 ? 1 : 0);
    }

    generateMachineCode(assembledProgram: AssembledProgram, idx: number): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_250.html
        let prefix: number[] = [];
        if (this.operandSize == 2) {
            prefix.push(OPERAND_SIZE_OVERRIDE);
        }
        let opcode: number[] = [0x9d];
        this.machineCode = combineMachineCode(prefix, opcode);
    }
}

class PushAllInstruction extends Instruction {
    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "pusha";
    }

    protected validateInstruction_(): void {
        assert(this.operands.length == 0, "pusha does not take any operands");
        assert(
            this.operandSize >= 2,
            "pusha operand size can only be 16/32 bits"
        );
    }

    calculateLength(): number {
        // 1 byte for opcode + 1 additional prefix byte for 16 bits
        return 1 + (this.operandSize == 2 ? 1 : 0);
    }

    generateMachineCode(assembledProgram: AssembledProgram, idx: number): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_270.html
        let prefix: number[] = [];
        if (this.operandSize == 2) {
            prefix.push(OPERAND_SIZE_OVERRIDE);
        }
        let opcode: number[] = [0x60];
        this.machineCode = combineMachineCode(prefix, opcode);
    }
}

class PopAllInstruction extends Instruction {
    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "popa";
    }

    protected validateInstruction_(): void {
        assert(this.operands.length == 0, "popa does not take any operands");
        assert(
            this.operandSize >= 2,
            "popa operand size can only be 16/32 bits"
        );
    }

    calculateLength(): number {
        // 1 byte for opcode + 1 additional prefix byte for 16 bits
        return 1 + (this.operandSize == 2 ? 1 : 0);
    }

    generateMachineCode(assembledProgram: AssembledProgram, idx: number): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_249.html
        let prefix: number[] = [];
        if (this.operandSize == 2) {
            prefix.push(OPERAND_SIZE_OVERRIDE);
        }
        let opcode: number[] = [0x61];
        this.machineCode = combineMachineCode(prefix, opcode);
    }
}

export {
    PopInstruction,
    PushInstruction,
    PushFlagsInstruction,
    PopFlagsInstruction,
    PushAllInstruction,
    PopAllInstruction,
};

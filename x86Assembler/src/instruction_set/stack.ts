import { Instruction } from "../instruction";
import { assert } from "../error";
import {
    Operand,
    OperandType,
    RegisterOperand,
    NumericConstantOperand
} from "../operand";
import { AssembledProgram } from "../assembler";
import {
    OPERAND_SIZE_OVERRIDE,
    REGISTER_CODES,
    fillModRmSibDisp,
    combineMachineCode,
    getImmediateBytes
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

    generateMachineCode(assembledProgram: AssembledProgram): void {
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

    generateMachineCode(assembledProgram: AssembledProgram): void {
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

export { PopInstruction, PushInstruction };

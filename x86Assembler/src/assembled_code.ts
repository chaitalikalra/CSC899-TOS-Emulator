import {
    Instruction,
    Operand,
    RegisterOperand,
    IndirectAddressOperand,
    NumericConstantOperand,
    LabelAddressOperand
} from "./instruction";
import { parse } from "./x86_parser";
import { CPU } from "./cpu";
import { InstructionSet } from "./x86_instruction_set/x86_instructions";
import { Register } from "./register";
import { assert } from "./utils";

interface LabelMap {
    [index: string]: number;
}

class AssembledCode {
    instructions: Instruction[];
    labelMap: LabelMap;
    instructionPtr: number;

    constructor(
        instructions: Instruction[],
        labelMap: LabelMap,
        instructionPtr: number | null = null
    ) {
        this.instructions = instructions;
        this.labelMap = labelMap;

        if (instructionPtr != null) this.instructionPtr = instructionPtr;

        if (this.instructionPtr == null) {
            if ("start" in this.labelMap)
                this.instructionPtr = this.labelMap["start"];
            else this.instructionPtr = 0;
        }
    }

    static parseAssembly(program: string, cpu: CPU): AssembledCode {
        let rawInstructions: object[];
        rawInstructions = parse(program);

        let returnInstructions: Instruction[] = [];
        let labelMap = {};

        for (let i of rawInstructions) {
            let label: object | null = i["label"];
            let instruction: Instruction = AssembledCode.parseInstruction(
                i["instruction"],
                cpu
            );
            // Returns count after pushing
            let count: number = returnInstructions.push(instruction);
            if (label != null) {
                // Label points to the newly added instruction
                labelMap[label["value"]] = count - 1;
            }
        }
        return new AssembledCode(returnInstructions, labelMap);
    }

    static parseInstruction(i: object, cpu: CPU): Instruction | null {
        let operator: string = i["operator"];
        let operands: Operand[] = [];
        for (let op of i["operands"]) {
            let opTag: string = op["value"]["tag"];

            if (opTag == "Register") {
                let name: string = op["value"]["value"];
                let reg: Register = Instruction.getRegister(name, cpu);
                operands.push(new RegisterOperand(name, reg));
            } else if (opTag == "IndirectAddess") {
                let offset: number =
                    op["value"]["offset"] == null ? 0 : op["value"]["offset"];
                let scale: number =
                    op["value"]["scale"] == null ? 1 : op["value"]["scale"];

                let baseRegister: Register | null = null;
                if (op["value"]["baseReg"] != null)
                    baseRegister = Instruction.getRegister(
                        op["value"]["baseReg"]["value"],
                        cpu
                    );

                let indexRegister: Register | null = null;
                if (op["value"]["indexReg"] != null)
                    indexRegister = Instruction.getRegister(
                        op["value"]["indexReg"]["value"],
                        cpu
                    );

                operands.push(
                    new IndirectAddressOperand(
                        baseRegister,
                        offset,
                        indexRegister,
                        scale
                    )
                );
            } else if (opTag == "NumericConstant") {
                operands.push(new NumericConstantOperand(op["value"]["value"]));
            } else if (opTag == "LabelAddress") {
                operands.push(new LabelAddressOperand(op["value"]["value"]));
            } else {
                throw new Error("Invalid parsed operand type: " + opTag);
            }
        }

        assert(operator in InstructionSet, "Invalid instruction: " + operator);
        return new InstructionSet[operator](operator, operands);
    }
}

export { AssembledCode };

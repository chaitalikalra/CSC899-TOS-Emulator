import { parse, SyntaxError } from "./x86_parser";
import { Instruction } from "./instruction";
import { AssemblyError } from "./error";
import { Operand, RegisterOperand, IndirectAddressOperand, NumericConstantOperand, LabelAddressOperand } from "./operand";
import { InstructionSet } from "./instruction_set/x86_instructions";

class Assembler {
    public assembleProgram(program: string) {
        // Step 1: Read program from string using the parse tree grammar in an array of raw objects
        let rawInstructions: object[];
        try {
            rawInstructions = parse(program);
        } catch (ex) {
            throw AssemblyError.throwSyntaxError(ex.message);
        }

        // Step 2: Pass 1 of the Assembler that builds the symbol table and instruction objects
        let assembledProgram: AssembledProgram = this.assemblerPass1_(rawInstructions);

        // Step 3: Pass 2 of the assembler generates machine code for the instructions
        this.assemblerPass2_(assembledProgram);
        
        return assembledProgram;
    }

    private assemblerPass1_(rawInstructions: object[]) {
        let instructions: Instruction[] = [];
        let symbolTable: LabelMap = {};

        for (let i of rawInstructions) {
            let label: object | null = i["label"];
            let count: number = instructions.push(
                this.parseInstruction(i["instruction"])
            );
            if (label != null) {
                // Label points to the newly added instruction
                symbolTable[label["value"]] = count - 1;
            }
        }
        return new AssembledProgram(instructions, symbolTable);
    }

    private assemblerPass2_(assembledProgram: AssembledProgram) {
        assembledProgram.generateMachineCode();
    }

    private parseInstruction(i: object): Instruction {
        let operator: string = i["operator"];
        let operands: Operand[] = [];
        for (let op of i["operands"]) {
            let opTag: string = op["value"]["tag"];

            if (opTag == "Register") {
                let name: string = op["value"]["value"];
                operands.push(new RegisterOperand(name));
            } else if (opTag == "IndirectAddess") {
                let offset: number =
                    op["value"]["offset"] == null ? 0 : op["value"]["offset"];
                let scale: number =
                    op["value"]["scale"] == null ? 1 : op["value"]["scale"];

                let baseRegister: string | null = op["value"]["baseReg"];
                let indexRegister: string | null = op["value"]["indexReg"];
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

        if (InstructionSet[operator] == undefined) {
            throw AssemblyError.throwInvalidOperatorError(operator);
        }
        return new InstructionSet[operator](operator, operands);
    }
}

interface AddrInstructionMap {
    [addr: number]: number;
}

class AssembledProgram {
    instructions: Instruction[];
    symbolTable: LabelMap;
    instructionStartAddr: number[];
    addrInstructionIndexMap: AddrInstructionMap;

    constructor(instructions: Instruction[], symbolTable: LabelMap) {
        this.instructions = instructions;
        this.symbolTable = symbolTable;
    }

    generateMachineCode(): void {
        this.instructionStartAddr = [];
        this.addrInstructionIndexMap = {};

        let startAddr: number = 0;
        for (let i = 0; i < this.instructions.length; i++) {
            this.instructionStartAddr.push(startAddr);
            this.addrInstructionIndexMap[startAddr] = i;
            this.instructions[i].generateMachineCode(this);
            startAddr += this.instructions[i].machineCode.length;
        }
    }
}

interface LabelMap {
    [index: string]: number;
}

export { Assembler, AssembledProgram };

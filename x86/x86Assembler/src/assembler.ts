import { parse, SyntaxError } from "./x86_parser";
import {
    Instruction,
    InstructionInterface,
    AssemblerDirective,
} from "./instruction";
import { AssemblyError } from "./error";
import {
    Operand,
    RegisterOperand,
    IndirectAddressOperand,
    NumericConstantOperand,
    LabelAddressOperand,
} from "./operand";
import { InstructionSet } from "./instruction_set/x86_instructions";
import { AssemblerDirectives } from "./assembler_directives/x86_assembler_directives";
import { deepcopy } from "./utils";

class Assembler {
    static readonly INSTRUCTION_TAG: string = "InstructionWithLabel";
    static readonly DIRECTIVE_TAG: string = "DirectiveWithLabel";

    public assembleProgram(program: string) {
        // Step 0: Read program from string using the parse tree grammar in an array of raw objects
        let rawInstructions: object[];
        try {
            rawInstructions = parse(program);
        } catch (ex) {
            throw AssemblyError.throwSyntaxError(
                ex.message,
                ex.location.start.line
            );
        }

        // Step 1: Pass 1 of the Assembler that does the following:
        // a. Creates instruction objects
        // b. Validates the instruction syntax and operand format
        // c. Calculates the size of the instruction and the data
        // d. builds the symbol table
        let assembledProgram: AssembledProgram = this.assemblerPass1_(
            rawInstructions
        );

        // Step 3: Pass 2 of the assembler generates machine code for the instructions
        this.assemblerPass2_(assembledProgram);

        // Step 4: Add metadata for the PC for debugging
        assembledProgram.createMetadata(rawInstructions, program);

        return assembledProgram;
    }

    private buildAssembledProgramObject_(
        rawInstructions: object[]
    ): AssembledProgram {
        let instructions: InstructionInterface[] = [];
        let symbolTable: LabelMap = {};

        for (let i of rawInstructions) {
            let label: object | null = i["label"];
            let count: number;
            try {
                if (i["tag"] == Assembler.INSTRUCTION_TAG) {
                    count = instructions.push(
                        this.parseInstruction(i["instruction"])
                    );
                } else if (i["tag"] == Assembler.DIRECTIVE_TAG) {
                    count = instructions.push(
                        this.parseDirective(i["directive"])
                    );
                }
            } catch (ex) {
                if (!ex.lineNum) {
                    ex.lineNum = i["instruction"]["location"]["start"]["line"];
                }
                throw ex;
            }

            if (label != null) {
                // Label points to the newly added instruction
                symbolTable[label["value"]] = count - 1;
            }
        }
        return new AssembledProgram(instructions, symbolTable);
    }

    private assemblerPass1_(rawInstructions: object[]): AssembledProgram {
        let assembledProgram: AssembledProgram = this.buildAssembledProgramObject_(
            rawInstructions
        );
        assembledProgram.generateInstructionLengthsAndOffsets();
        return assembledProgram;
    }

    private assemblerPass2_(assembledProgram: AssembledProgram) {
        assembledProgram.generateMachineCode();
    }

    private parseDirective(i: Object): AssemblerDirective {
        let operator: string = i["operator"];
        let operands: (string | number)[] = [];
        for (let op of i["operands"]) {
            operands.push(op["value"]);
        }
        if (AssemblerDirectives[operator] == undefined) {
            throw AssemblyError.throwInvalidDirectiveError(
                operator,
                i["location"]["start"]["line"]
            );
        }
        return new AssemblerDirectives[operator](operator, operands);
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
                    op["value"]["offset"] == null
                        ? 0
                        : op["value"]["offset"]["value"];
                let scale: number =
                    op["value"]["scale"] == null
                        ? 1
                        : op["value"]["scale"]["value"];

                let baseRegister: string | null =
                    op["value"]["baseReg"] != null
                        ? op["value"]["baseReg"]["value"]
                        : null;
                let indexRegister: string | null =
                    op["value"]["indexReg"] != null
                        ? op["value"]["indexReg"]["value"]
                        : null;
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
                operands.push(
                    new LabelAddressOperand(op["value"]["value"]["value"])
                );
            } else {
                throw new Error("Invalid parsed operand type: " + opTag);
            }
        }

        if (InstructionSet[operator] == undefined) {
            throw AssemblyError.throwInvalidOperatorError(
                operator,
                i["location"]["start"]["line"]
            );
        }
        return new InstructionSet[operator](operator, operands);
    }
}

interface AddrInstructionMap {
    [addr: number]: number;
}

class AssembledProgram {
    instructions: InstructionInterface[];
    symbolTable: LabelMap;
    reverseSymbolTable: IndexLabelMap;
    instructionStartAddr: number[];
    addrInstructionIndexMap: AddrInstructionMap;
    instructionLengths: number[];
    metadata: Object = {};

    constructor(instructions: InstructionInterface[], symbolTable: LabelMap) {
        this.instructions = instructions;
        this.symbolTable = symbolTable;
        this.reverseSymbolTable = {};
        for (let label in this.symbolTable) {
            this.reverseSymbolTable[this.symbolTable[label]] = label;
        }
    }

    generateInstructionLengthsAndOffsets(): void {
        this.instructionStartAddr = [];
        this.instructionLengths = [];
        this.addrInstructionIndexMap = {};

        let startAddr: number = 0;
        for (let i = 0; i < this.instructions.length; i++) {
            this.instructionStartAddr.push(startAddr);
            this.addrInstructionIndexMap[startAddr] = i;
            this.instructionLengths.push(
                this.instructions[i].calculateLength()
            );
            startAddr += this.instructionLengths[i];
        }
    }

    generateMachineCode(): void {
        for (let i = 0; i < this.instructions.length; i++) {
            this.instructions[i].generateMachineCode(this, i);
        }
    }

    toString(): string {
        let ret: string = "";
        ret += "Addr\t\t\tMachine Code\t\t\tAssembly\n";
        ret += "-".repeat(80) + "\n";
        for (let i = 0; i < this.instructions.length; i++) {
            let label: string | null = null;
            if (this.reverseSymbolTable[i] != undefined) {
                label = this.reverseSymbolTable[i];
            }
            ret +=
                this.instructionStartAddr[i].toString(16) +
                ":\t\t\t" +
                this.instructions[i].toString(label) +
                "\n";
        }
        return ret;
    }

    toTable(): object[] {
        let ret: object[] = [];
        for (let i = 0; i < this.instructions.length; i++) {
            let ins: object = {};
            ins["address"] = this.instructionStartAddr[i].toString(16);
            ins["label"] = "";
            if (this.reverseSymbolTable[i] != undefined) {
                ins["label"] = this.reverseSymbolTable[i];
            }
            let ob = this.instructions[i].toTable();
            ins["machine_code"] = ob["machine_code"];
            ins["value"] = ob["value"];
            ins["operator"] = ob["operator"];
            ins["operands"] = ob["operands"];
            ret.push(ins);
        }
        return ret;
    }

    getMachineCode(): Uint8Array {
        let retBytes: number[] = [];
        for (let instruction of this.instructions) {
            retBytes.push(...instruction.machineCode);
        }
        return new Uint8Array(retBytes);
    }

    createMetadata(rawInstructions: object[], program: string) {
        this.metadata = {};
        this.metadata["program"] = program;
        this.metadata["line_nums"] = [];
        for (let i: number = 0; i < rawInstructions.length; i++) {
            let ins: object = rawInstructions[i];
            let key: string = "";
            if (ins["tag"] == "DirectiveWithLabel") {
                key = "directive";
            } else if (ins["tag"] == "InstructionWithLabel") {
                key = "instruction";
            } else {
                continue;
            }
            this.metadata["line_nums"].push(
                ins[key]["location"]["start"]["line"]
            );
        }
    }

    genMetadata(): Object {
        let metadata: Object = deepcopy(this.metadata);
        metadata["symbol_table"] = deepcopy(this.symbolTable);
        metadata["reverse_symbol_table"] = deepcopy(this.reverseSymbolTable);
        metadata["instruction_start_addr"] = deepcopy(
            this.instructionStartAddr
        );
        metadata["instruction_lengths"] = deepcopy(this.instructionLengths);
        metadata["addr_instruction_map"] = deepcopy(
            this.addrInstructionIndexMap
        );
        return metadata;
    }
}

interface LabelMap {
    [index: string]: number;
}

interface IndexLabelMap {
    [index: number]: string;
}

export { Assembler, AssembledProgram };

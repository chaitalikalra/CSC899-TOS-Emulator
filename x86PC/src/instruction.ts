import { x86Operand, parseOperand } from "./operand";
import { parse, SyntaxError } from "./x86_operands_parser";
import { assert } from "./error";

enum InstructionOperandSize {
    Byte = 1,
    Word = 2,
    Long = 4,
}

abstract class x86Instruction {
    static MAX_INSTRUCTION_LENGTH: number = 10;

    instructionName: string;
    mnemonic: string;
    byteLength: number;
    address: number;
    bytes: Uint8Array;
    operands: x86Operand[];
    instructionOpSize: number;

    constructor(
        instructionName: string,
        mnemonic: string,
        address: number,
        bytes: number[],
        opString: string = ""
    ) {
        this.instructionName = instructionName;
        this.mnemonic = mnemonic;
        this.address = address;
        this.bytes = new Uint8Array(bytes);
        this.byteLength = bytes.length;
        this.operands = [];
        this.instructionOpSize = InstructionOperandSize.Long;

        if (opString.length > 0) {
            let opObjs: object[] = parse(opString);
            for (let o of opObjs) {
                this.operands.push(parseOperand(o));
            }
        }

        // Set instruction operand size
        if (this.mnemonic != this.instructionName) {
            assert(
                this.mnemonic.length - this.instructionName.length == 1,
                "Could not get operand size"
            );
            let modifier: string = this.mnemonic.slice(-1);
            switch (modifier) {
                case "b":
                    this.instructionOpSize = InstructionOperandSize.Byte;
                    break;

                case "w":
                    this.instructionOpSize = InstructionOperandSize.Word;
                    break;

                case "l":
                    this.instructionOpSize = InstructionOperandSize.Long;
                    break;

                default:
                    assert(false, "Could not get operand size from mnemonic");
            }
        }
    }
}

export { x86Instruction };

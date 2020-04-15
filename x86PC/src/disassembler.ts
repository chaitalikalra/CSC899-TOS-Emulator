import * as cs from "./capstone-x86";
import { x86Instruction } from "./instruction";
import { InstructionSet } from "./instruction_set/x86_instructions";
import { RuntimeError } from "./error";

class x86Disassembler {
    capstone: any;

    constructor() {
        this.capstone = new cs.cs.Capstone(cs.cs.ARCH_X86, cs.cs.MODE_32);
        this.capstone.option(cs.cs.OPT_SYNTAX, cs.cs.OPT_SYNTAX_ATT);
    }

    getNextInstructionFromBytes(
        bytes: Uint8Array,
        startAddress: number
    ): x86Instruction | null {
        let objs: object[];
        try {
            objs = this.capstone.disasm(bytes, startAddress, 1);
        } catch (e) {
            return null;
        }

        if (objs.length == 0) return null;
        objs[0]["instructionName"] = this.capstone.insn_name(objs[0]["id"]);
        return x86Disassembler.parseInstruction(objs[0]);
    }

    static parseInstruction(o: object): x86Instruction {
        if (InstructionSet[o["instructionName"]] == undefined) {
            throw RuntimeError.throwInstructionNotSupportedError(
                o["instructionName"]
            );
        }
        return new InstructionSet[o["instructionName"]](
            o["mnemonic"],
            o["address"],
            o["bytes"],
            o["op_str"]
        );
    }
}

export { x86Disassembler };

import { MovInstruction } from "./mov";
import { NopInstruction } from "./nop";

const InstructionSet = {
    mov: MovInstruction.bind(null, "mov"),
    nop: NopInstruction.bind(null, "nop"),
};

export { InstructionSet };

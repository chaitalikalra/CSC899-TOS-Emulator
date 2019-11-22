import { CPU } from "../cpu";
import { AssembledCode } from "../assembled_code";
import { Operand } from "../instruction";

import { move, lea } from "./mov"
import { pop, push } from "./stack";

enum InstructionSuffix {
  Byte = 1,
  Word = 2,
  Long = 4
}

interface InstructionFunc {
  (
    suffix: InstructionSuffix | null,
    cpu: CPU,
    assembled_code: AssembledCode,
    operands: Operand[],
  ): void;
}

const InstructionSet = {
    "mov": move.bind(null, null),
    "movb": move.bind(null, InstructionSuffix.Byte),
    "movw": move.bind(null, InstructionSuffix.Word),
    "movl": move.bind(null, InstructionSuffix.Long),
    "lea": lea.bind(null, null),
    "leaw": lea.bind(null, InstructionSuffix.Word),
    "leal": lea.bind(null, InstructionSuffix.Long),
    "pop": pop.bind(null, null),
    "popw": pop.bind(null, InstructionSuffix.Word),
    "popl": pop.bind(null, InstructionSuffix.Long),
    "push": push.bind(null, null),
    "pushw": push.bind(null, InstructionSuffix.Word),
    "pushl": push.bind(null, InstructionSuffix.Long),
};

export { InstructionFunc, InstructionSet, InstructionSuffix };

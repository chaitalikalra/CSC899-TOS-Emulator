import { x86Instruction } from "../instruction";
import { CPU } from "../cpu";
import { booleanArrayToNumber, numberToBooleanArray } from "../utils";

class LahfInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        let booleanArray: boolean[] = [
            cpu.eFlags.getSignFlag(),
            cpu.eFlags.getZeroFlag(),
            false,
            cpu.eFlags.getAdjustFlag(),
            false,
            cpu.eFlags.getParityFlag(),
            true,
            cpu.eFlags.getCarryFlag(),
        ];
        cpu.registers["ah"].setNumericvalue(booleanArrayToNumber(booleanArray));
    }
}

class SahfInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        let booleanAHArray: boolean[] = numberToBooleanArray(
            cpu.registers["ah"].getNumericValue(),
            8
        );
        cpu.eFlags.setSignFlag(booleanAHArray[0]);
        cpu.eFlags.setZeroFlag(booleanAHArray[1]);
        cpu.eFlags.setAdjustFlag(booleanAHArray[3]);
        cpu.eFlags.setParityFlag(booleanAHArray[5]);
        cpu.eFlags.setCarryFlag(booleanAHArray[7]);
    }
}

class StcInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        cpu.eFlags.setCarryFlag(true);
    }
}

class ClcInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        cpu.eFlags.setCarryFlag(false);
    }
}

class CmcInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        cpu.eFlags.setCarryFlag(!cpu.eFlags.getCarryFlag());
    }
}

class StdInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        cpu.eFlags.setDirectionFlag(true);
    }
}

class CldInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        cpu.eFlags.setDirectionFlag(false);
    }
}

class StiInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        cpu.eFlags.setInterruptFlag(true);
    }
}

class CliInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        cpu.eFlags.setInterruptFlag(false);
    }
}

export {
    LahfInstruction,
    SahfInstruction,
    StcInstruction,
    StiInstruction,
    StdInstruction,
    CmcInstruction,
    CldInstruction,
    ClcInstruction,
    CliInstruction,
};

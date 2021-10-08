import { InstructionOperandSize, x86Instruction } from "../instruction";
import { CPU } from "../cpu";
import {
    x86NumericOperand,
    x86Operand,
    x86OperandType,
    x86RegisterOperand,
} from "../operand";
import { booleanArrayToNumber, numberToBooleanArray } from "../utils";

abstract class ShiftRotateInstruction extends x86Instruction {
    protected _getCounterValue(cpu: CPU): number {
        if (this.operands.length == 1) return 1;
        return cpu.readOperand(this.operands[1], InstructionOperandSize.Byte);
    }

    protected _getValueToShift(src: x86Operand, cpu: CPU): number {
        return cpu.readOperand(src, this.instructionOpSize);
    }

    protected _getBoolArray(src: x86Operand, cpu: CPU): boolean[] {
        let val: number = this._getValueToShift(src, cpu);
        // reverse is applied because we want the 0th element to be at the end
        return numberToBooleanArray(val, this.instructionOpSize * 8).reverse();
    }

    protected _writeToOperand(
        cpu: CPU,
        src: x86Operand,
        boolArr: boolean[]
    ): void {
        // boolArr has 0th element bit at the end of arr, so reverse() before
        // sending to booleanArrayToNumber util
        cpu.writeOperand(src, booleanArrayToNumber(boolArr.reverse()));
    }
}

abstract class ShiftInstruction extends ShiftRotateInstruction {
    protected abstract readonly _shiftFnc: (
        boolArr: boolean[],
        ctr: number,
        fill: boolean
    ) => [boolean[], boolean];

    protected abstract _getFill(boolArr: boolean[]): boolean;

    protected shiftLeft(
        boolArr: boolean[],
        ctr: number,
        fill: boolean = false
    ): [boolean[], boolean] {
        let originalLength: number = boolArr.length;
        let carry: boolean = ctr <= originalLength ? boolArr[ctr - 1] : false;
        boolArr = boolArr.slice(ctr);
        return [
            [...boolArr, ...Array(originalLength - boolArr.length).fill(fill)],
            carry,
        ];
    }

    protected shiftRight(
        boolArr: boolean[],
        ctr: number,
        fill: boolean = false
    ): [boolean[], boolean] {
        let leftShiftedResult: [boolean[], boolean] = this.shiftLeft(
            boolArr.reverse(),
            ctr,
            fill
        );
        return [leftShiftedResult[0].reverse(), leftShiftedResult[1]];
    }

    executeInstruction(cpu: CPU) {
        let src: x86Operand = this.operands[0];
        let ctr: number = this._getCounterValue(cpu);
        let boolArr: boolean[] = this._getBoolArray(src, cpu);
        let shiftResult: [boolean[], boolean] = this._shiftFnc(
            boolArr,
            ctr,
            this._getFill(boolArr)
        );
        this._writeToOperand(cpu, src, shiftResult[0]);
        cpu.eFlags.setCarryFlag(shiftResult[1]);
    }
}

class ShlInstruction extends ShiftInstruction {
    protected readonly _shiftFnc = this.shiftLeft;

    protected _getFill(boolArr: boolean[]): boolean {
        return false;
    }
}

class SalInstruction extends ShlInstruction {}

class ShrInstruction extends ShiftInstruction {
    protected readonly _shiftFnc = this.shiftRight;

    protected _getFill(boolArr: boolean[]): boolean {
        return false;
    }
}

class SarInstruction extends ShrInstruction {
    protected _getFill(boolArr: boolean[]): boolean {
        return boolArr[0];
    }
}

abstract class RotateInstruction extends ShiftRotateInstruction {
    protected abstract readonly _useCarry: boolean;
    protected abstract readonly _rotateFnc: (
        boolArr: boolean[],
        ctr: number
    ) => boolean[];

    protected _rotateLeft(boolArr: boolean[], ctr: number): boolean[] {
        return [...boolArr.slice(ctr), ...boolArr.slice(0, ctr)];
    }

    protected _rotateRight(boolArr: boolean[], ctr: number): boolean[] {
        return [
            ...boolArr.slice(boolArr.length - ctr),
            ...boolArr.slice(0, boolArr.length - ctr),
        ];
    }

    executeInstruction(cpu: CPU) {
        let src: x86Operand = this.operands[0];
        let ctr: number = this._getCounterValue(cpu);
        let boolArr: boolean[] = this._getBoolArray(src, cpu);
        if (this._useCarry)
            // add carry to be rotated
            boolArr.splice(0, 0, cpu.eFlags.getCarryFlag());
        let rotatedArr: boolean[] = this._rotateFnc(boolArr, ctr);
        if (this._useCarry) {
            cpu.eFlags.setCarryFlag(rotatedArr[0]);
            rotatedArr.splice(0, 1);
        }
        this._writeToOperand(cpu, src, rotatedArr);
    }
}

class RolInstruction extends RotateInstruction {
    protected readonly _useCarry: boolean = false;
    protected readonly _rotateFnc = this._rotateLeft;
}

class RclInstruction extends RolInstruction {
    protected readonly _useCarry: boolean = true;
}

class RorInstruction extends RotateInstruction {
    protected readonly _useCarry: boolean = false;
    protected readonly _rotateFnc = this._rotateRight;
}

class RcrInstruction extends RorInstruction {
    protected readonly _useCarry: boolean = true;
}

export {
    ShlInstruction,
    SalInstruction,
    SarInstruction,
    ShrInstruction,
    RolInstruction,
    RorInstruction,
    RclInstruction,
    RcrInstruction,
};

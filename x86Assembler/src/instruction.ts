import { CPU } from "./cpu";
import { Register } from "./register";

interface Operand {
    type: OperandType;
}

enum OperandType {
    NumericConstant = "numericConstant",
    IndirectAddress = "indirectAddres",
    Register = "register",
    LabelAddress = "labelAddress"
}

class RegisterOperand implements Operand {
    type: OperandType;
    name: string;
    register: Register;
    constructor(name: string, register: Register) {
        this.type = OperandType.Register;
        this.name = name;
        this.register = register;
    }
}

class IndirectAddressOperand implements Operand {
    type: OperandType;
    offset: number;
    baseRegister: Register | null;
    scale: number;
    indexRegister: Register | null;

    constructor(baseRegister: Register | null, offset: number,
        indexRegister: Register | null, scale: number) {
        this.type = OperandType.IndirectAddress;
        this.baseRegister = baseRegister;
        this.indexRegister = indexRegister;
        this.offset = offset;
        this.scale = scale;
    }
}

class NumericConstantOperand implements Operand {
    type: OperandType;
    value: number;
    constructor(value: number) {
        this.type = OperandType.NumericConstant;
        this.value = value;
    }
}

class LabelAddressOperand implements Operand {
    type:OperandType;
    name:string;
    constructor(name: string) {
        this.type = OperandType.LabelAddress;
        this.name = name;
    }
}

class Instruction {
    operator: string;
    operands: Operand[];

    constructor(operator: string, operands: Operand[]) {
        this.operator = operator;
        this.operands = operands;
    }

    static parseInstruction(i: object, cpu: CPU) : Instruction | null {
        let operator: string = i["operator"];
        let operands: Operand[] = [];
        for (let op of i["operands"]) {
            let opTag: string = op["value"]["tag"];

            if (opTag == "Register") {
                let name: string = op["value"]["value"];
                let reg: Register = Instruction.getRegister(name, cpu);
                operands.push(new RegisterOperand(name, reg));
            } else if (opTag == "IndirectAddess") {
                let offset: number = (op["value"]["offset"] == null ? 0 : op["value"]["offset"]);
                let scale: number = (op["value"]["scale"] == null ? 1 : op["value"]["scale"]);

                let baseRegister: Register | null = null;
                if (op["value"]["baseReg"] != null)
                    baseRegister = Instruction.getRegister(
                        op["value"]["baseReg"]["value"], cpu);

                let indexRegister: Register | null = null;
                if (op["value"]["indexReg"] != null)
                    indexRegister = Instruction.getRegister(
                        op["value"]["indexReg"]["value"], cpu);

                operands.push(new IndirectAddressOperand(baseRegister, offset,
                     indexRegister, scale));
            } else if (opTag == "NumericConstant") {
                operands.push(new NumericConstantOperand(op["value"]["value"]));
            } else if (opTag == "LabelAddress") {
                operands.push(new LabelAddressOperand(op["value"]["value"]));
            } else {
                throw new Error("Invalid parsed operand type: " + opTag);
            }
        }
        return new Instruction(operator, operands);
    }

    static getRegister(name: string, cpu: CPU) : Register {
        let reg: Register | undefined = cpu.getRegister(name);
        if (reg == undefined) {
            throw new Error("Invalid Register: " + name);
        }
        return reg;
    }
}

export { Instruction };

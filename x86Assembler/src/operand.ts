import { AssemblyError } from "./error";

interface Operand {
    type: OperandType;
    toString(): string;
}

enum OperandType {
    NumericConstant = "numericConstant",
    IndirectAddress = "indirectAddres",
    Register = "register",
    LabelAddress = "labelAddress",
}

interface RegisterSizeMap {
    [index: string]: number;
}

class RegisterOperand implements Operand {
    static x86Registers: RegisterSizeMap = {
        eax: 4,
        ecx: 4,
        edx: 4,
        ebx: 4,
        esp: 4,
        ebp: 4,
        esi: 4,
        edi: 4,
        ax: 2,
        cx: 2,
        dx: 2,
        bx: 2,
        sp: 2,
        bp: 2,
        si: 2,
        di: 2,
        al: 1,
        ah: 1,
        bl: 1,
        bh: 1,
        dl: 1,
        dh: 1,
        cl: 1,
        ch: 1,
    };

    type: OperandType;
    name: string;

    constructor(name: string) {
        this.type = OperandType.Register;
        if (RegisterOperand.x86Registers[name] == undefined) {
            throw AssemblyError.throwInvalidRegisterError(name);
        }
        this.name = name;
    }

    public toString(): string {
        return "%" + this.name;
    }

    public getRegisterSize(): number {
        return RegisterOperand.x86Registers[this.name];
    }
}

enum IndirectAddressScale {
    Scale1 = 1,
    Scale2 = 2,
    Scale4 = 4,
    Scale8 = 8,
}

class IndirectAddressOperand implements Operand {
    type: OperandType;
    offset: number;
    baseRegister: string | null;
    scale: IndirectAddressScale;
    indexRegister: string | null;

    constructor(
        baseRegister: string | null,
        offset: number,
        indexRegister: string | null,
        scale: number
    ) {

        if (baseRegister != null) {
            baseRegister = baseRegister.trim().toLowerCase();
        }

        this.type = OperandType.IndirectAddress;
        this.baseRegister = baseRegister;
        this.indexRegister = indexRegister;
        this.offset = offset;
        this.scale = scale;
    }

    public toString(): string {
        let content: string = "";
        if (this.baseRegister != null) content += "%" + this.baseRegister;
        if (this.indexRegister != null) {
            content += ",";
            content += "%" + this.indexRegister;
        }
        if (this.scale != 1) {
            content += ",";
            content += this.scale.toString();
        }
        if (this.offset != 0) {
            return this.offset.toString() + "(" + content + ")";
        } else {
            return "(" + content + ")";
        }
    }
}

class NumericConstantOperand implements Operand {
    type: OperandType;
    value: number;
    constructor(value: number) {
        this.type = OperandType.NumericConstant;
        this.value = value;
    }

    public getValue(): number {
        return this.value;
    }

    public toString(): string {
        return "$0x" + this.value.toString(16);
    }
}

class LabelAddressOperand implements Operand {
    type: OperandType;
    name: string;
    constructor(name: string) {
        this.type = OperandType.LabelAddress;
        this.name = name;
    }

    public toString(): string {
        return this.name;
    }
}

export {
    Operand,
    OperandType,
    RegisterOperand,
    LabelAddressOperand,
    IndirectAddressOperand,
    NumericConstantOperand,
    IndirectAddressScale,
};

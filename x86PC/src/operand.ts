enum x86OperandType {
    Numeric = "numeric",
    Address = "address",
    Register = "register",
}

interface x86Operand {
    type: x86OperandType;
}

class x86RegisterOperand implements x86Operand {
    type: x86OperandType;
    name: string;

    constructor(name: string) {
        this.type = x86OperandType.Register;
        this.name = name;
    }
}

class x86NumericOperand implements x86Operand {
    type: x86OperandType;
    value: number;

    constructor(value: number) {
        this.type = x86OperandType.Numeric;
        this.value = value;
    }
}

class x86AddressOperand implements x86Operand {
    type: x86OperandType;
    offset: number;
    baseRegister: string | null;
    scale: number;
    indexRegister: string | null;

    constructor(
        baseRegister: string | null,
        offset: number,
        indexRegister: string | null,
        scale: number
    ) {
        this.type = x86OperandType.Address;
        this.baseRegister = baseRegister;
        this.indexRegister = indexRegister;
        this.offset = offset;
        this.scale = scale;
    }
}

function parseOperand(op: object): x86Operand {
    let opTag: string = op["tag"];
    if (opTag == "Register") {
        return new x86RegisterOperand(op["value"]);
    } else if (opTag == "IndirectAddess") {
        let offset: number =
            op["offset"] == null ? 0 : op["offset"]["value"];
        let scale: number =
            op["scale"] == null ? 1 : op["scale"]["value"];

        let baseRegister: string | null =
            op["baseReg"] != null
                ? op["baseReg"]["value"]
                : null;
        let indexRegister: string | null =
            op["indexReg"] != null
                ? op["indexReg"]["value"]
                : null;
        return new x86AddressOperand(
            baseRegister,
            offset,
            indexRegister,
            scale
        );
    } else if (opTag == "NumericConstant") {
        return new x86NumericOperand(op["value"]);
    } else {
        return null;
    }
}

export {
    x86OperandType,
    x86Operand,
    x86RegisterOperand,
    x86AddressOperand,
    x86NumericOperand,
    parseOperand,
};

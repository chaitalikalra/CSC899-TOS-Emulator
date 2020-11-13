enum ErrorType {
    SyntaxError,
    InvalidOperator,
    InvalidDirective,
    InvalidRegister,
    InvalidOperandType,
    InvalidOperandSize,
    InvalidLabel,
    AssertionError,
    InvalidIndirectAddress,
}

class AssemblyError extends Error {
    errorType: ErrorType;
    lineNum: number;

    constructor(errorType: ErrorType, message: string, lineNum?: number) {
        super(message);
        // Set the prototype explicitly.
        // Needed to throw custom errors.
        // https://stackoverflow.com/questions/41102060/typescript-extending-error-class
        Object.setPrototypeOf(this, AssemblyError.prototype);
        this.errorType = errorType;
        this.lineNum = lineNum;
    }

    private _getMessage(): string {
        if (this.lineNum) {
            return (
                "Line " +
                this.lineNum +
                ", " +
                ErrorType[this.errorType] +
                ": " +
                this.message
            );
        } else {
            return ErrorType[this.errorType] + ": " + this.message;
        }
    }

    getErrorObject(): object {
        return {
            type: ErrorType[this.errorType],
            message: this._getMessage(),
            line: this.lineNum,
        };
    }

    static throwSyntaxError(m: string, lineNum?: number) {
        return new AssemblyError(ErrorType.SyntaxError, m, lineNum);
    }

    static throwInvalidRegisterError(register: string, lineNum?: number) {
        return new AssemblyError(
            ErrorType.InvalidRegister,
            `Invalid register provided: ${register}`,
            lineNum
        );
    }

    static throwInvalidOperandTypeError(operandType: string, lineNum?: number) {
        return new AssemblyError(
            ErrorType.InvalidOperandType,
            `Invalid operand type provided ${operandType}`,
            lineNum
        );
    }

    static throwInvalidOperatorError(op: string, lineNum?: number) {
        return new AssemblyError(
            ErrorType.InvalidOperator,
            `Invalid operator provided ${op}`,
            lineNum
        );
    }

    static throwInvalidDirectiveError(op: string, lineNum?: number) {
        return new AssemblyError(
            ErrorType.InvalidDirective,
            `Invalid directive provided ${op}`,
            lineNum
        );
    }

    static throwInvalidOperandSizeError(op: string, lineNum?: number) {
        return new AssemblyError(
            ErrorType.InvalidOperandSize,
            `Invalid operator size for operator ${op}`,
            lineNum
        );
    }

    static throwInvalidIndirectAddressError(op: string, lineNum?: number) {
        return new AssemblyError(
            ErrorType.InvalidIndirectAddress,
            `Invalid indirect address ${op}`,
            lineNum
        );
    }

    static throwInvalidLabelError(label: string, lineNum?: number) {
        return new AssemblyError(
            ErrorType.InvalidLabel,
            `Invalid label ${label}`,
            lineNum
        );
    }
}

function assert(condition: boolean, message: string, lineNum?: number) {
    if (!condition)
        throw new AssemblyError(ErrorType.AssertionError, message, lineNum);
}

export { AssemblyError, assert };

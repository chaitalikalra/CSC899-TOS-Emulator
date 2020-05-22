enum ErrorType {
    SyntaxError,
    InvalidOperator,
    InvalidDirective,
    InvalidRegister,
    InvalidOperandType,
    InvalidOperandSize,
    AssertionError
}

class AssemblyError extends Error {
    errorType: ErrorType;

    constructor(errorType: ErrorType, message: string) {
        super(message);
        // Set the prototype explicitly.
        // Needed to throw custom errors.
        // https://stackoverflow.com/questions/41102060/typescript-extending-error-class
        Object.setPrototypeOf(this, AssemblyError.prototype);
        this.errorType = errorType;
    }

    static throwSyntaxError(m: string) {
        return new AssemblyError(
            ErrorType.SyntaxError,
            `Syntax error in provided assembly code. Error: ${m}`
        );
    }

    static throwInvalidRegisterError(register: string) {
        return new AssemblyError(
            ErrorType.InvalidRegister,
            `Invalid register provided: ${register}`
        );
    }

    static throwInvalidOperandTypeError(operandType: string) {
        return new AssemblyError(
            ErrorType.InvalidOperandType,
            `Invalid operand type provided: ${operandType}`
        );
    }

    static throwInvalidOperatorError(op: string) {
        return new AssemblyError(
            ErrorType.InvalidOperator,
            `Invalid operator provided: ${op}`
        );
    }

    static throwInvalidDirectiveError(op: string) {
        return new AssemblyError(
            ErrorType.InvalidDirective,
            `Invalid directive provided: ${op}`
        );
    }

    static throwInvalidOperandSizeError(op: string) {
        return new AssemblyError(
            ErrorType.InvalidOperandSize,
            `Invalid operator size for operator: ${op}`
        );
    }
}

function assert(condition: boolean, message: string) {
    if (!condition) throw new AssemblyError(ErrorType.AssertionError, message);
}

export { AssemblyError, assert };

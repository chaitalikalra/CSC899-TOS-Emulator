enum ErrorType {
    LowMemoryError,
    AssertionError,
    InstructionNotSupportedError,
}

class RuntimeError extends Error {
    errorType: ErrorType;

    constructor(errorType: ErrorType, message: string) {
        super(message);
        // Set the prototype explicitly.
        // Needed to throw custom errors.
        // https://stackoverflow.com/questions/41102060/typescript-extending-error-class
        Object.setPrototypeOf(this, RuntimeError.prototype);
        this.errorType = errorType;
    }

    static throwLowMemoryError(m: string) {
        return new RuntimeError(
            ErrorType.LowMemoryError,
            `Low memory error. Error: ${m}`
        );
    }

    static throwInstructionNotSupportedError(i: string) {
        return new RuntimeError(
            ErrorType.InstructionNotSupportedError,
            `Instruction ${i} not yet supported.`
        );
    }
}

function assert(condition: boolean, message: string) {
    if (!condition) throw new RuntimeError(ErrorType.AssertionError, message);
}

export { RuntimeError, assert };

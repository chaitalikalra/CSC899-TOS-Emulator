import { AssemblerDirective } from "../instruction";
import { AssembledProgram } from "../assembler";
import { assert } from "../error";
import { uint8, uint16, uint32 } from "../utils";

class ByteDirective extends AssemblerDirective {
    generateMachineCode(assembledProgram: AssembledProgram): void {
        let code: number[] = [];
        for (let e of this.expressions) {
            code.push(uint8(e as number))
        }
        this.machineCode = new Uint8Array(code);
    }

    validateDirective_(): void {
        // Check atleast 1 expression is provided
        assert(this.expressions.length > 0, "Directive must contain an expression");

        // Check expression types
        for (let e of this.expressions) {
            assert(typeof(e) == "number", "Directive expression must be a string");
            assert(uint8(e as number) == e, "Expression should be a byte");
        }
    }
}

class ValueDirective extends AssemblerDirective {
    generateMachineCode(assembledProgram: AssembledProgram): void {
        let code: number[] = [];
        for (let e of this.expressions) {
            code.push(uint16(e as number));
        }
        this.machineCode = new Uint8Array((new Uint16Array(code)).buffer);
    }

    validateDirective_(): void {
        // Check atleast 1 expression is provided
        assert(this.expressions.length > 0, "Directive must contain an expression");

        // Check expression types
        for (let e of this.expressions) {
            assert(typeof(e) == "number", "Directive expression must be a string");
            assert(uint16(e as number) == e, "Expression should be a byte");
        }
    }
}

class LongDirective extends AssemblerDirective {
    generateMachineCode(assembledProgram: AssembledProgram): void {
        let code: number[] = [];
        for (let e of this.expressions) {
            code.push(uint32(e as number));
        }
        this.machineCode = new Uint8Array((new Uint32Array(code)).buffer);
    }

    validateDirective_(): void {
        // Check atleast 1 expression is provided
        assert(this.expressions.length > 0, "Directive must contain an expression");

        // Check expression types
        for (let e of this.expressions) {
            assert(typeof(e) == "number", "Directive expression must be a string");
            assert(uint32(e as number) == e, "Expression should be a byte");
        }
    }
}

export {ByteDirective, ValueDirective, LongDirective};
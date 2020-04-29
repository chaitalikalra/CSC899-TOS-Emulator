import { Expect, Test, TestFixture, TestCase } from "alsatian";
import { parse, SyntaxError } from "../src/x86_parser";

@TestFixture("Test fixture to test x86 Parser from pegJS")
export class ParserTestFixture {
    @Test("Check nullary instruction being parse correctly")
    @TestCase("ret", "ret")
    @TestCase("mov", "mov")
    testNullaryInstruction(instruction: string, parsedOperator: string) {
        let instructions: object[] = parse(instruction);
        Expect(instructions.length).toBe(1);
        Expect(instructions[0]["tag"]).toBe("InstructionWithLabel");
        Expect(instructions[0]["instruction"]["operator"]).toBe(parsedOperator);
        Expect(instructions[0]["instruction"]["operands"].length).toBe(0);
        Expect(instructions[0]["label"]).toBeNull();
    }

    @Test("Check unary instruction being parse correctly")
    @TestCase("push %eax", "push")
    @TestCase("pop %ebx", "pop")
    testUnaryInstruction(instruction: string, parsedOperator: string) {
        let instructions: object[] = parse(instruction);
        Expect(instructions.length).toBe(1);
        Expect(instructions[0]["tag"]).toBe("InstructionWithLabel");
        Expect(instructions[0]["instruction"]["operator"]).toBe(parsedOperator);
        Expect(instructions[0]["instruction"]["operands"].length).toBe(1);
        Expect(instructions[0]["label"]).toBeNull();
    }

    @Test("Check binary instruction being parse correctly")
    @TestCase("mov %eax, %ebx", "mov")
    @TestCase("add   %ebx,    %ecx", "add")
    testBinaryInstruction(instruction: string, parsedOperator: string) {
        let instructions: object[] = parse(instruction);
        Expect(instructions.length).toBe(1);
        Expect(instructions[0]["tag"]).toBe("InstructionWithLabel");
        Expect(instructions[0]["instruction"]["operator"]).toBe(parsedOperator);
        Expect(instructions[0]["instruction"]["operands"].length).toBe(2);
        Expect(instructions[0]["label"]).toBeNull();
    }

    @Test("Test register operands")
    @TestCase("mov %eax, %ebx", "mov", ["eax", "ebx"])
    @TestCase("add   %esi,    %ecx", "add", ["esi", "ecx"])
    @TestCase("push   %ax", "push", ["ax"])
    testRegisterOperand(
        instruction: string,
        parsedOperator: string,
        parsedRegisters: string[]
    ) {
        let instructions: object[] = parse(instruction);
        Expect(instructions.length).toBe(1);
        Expect(instructions[0]["tag"]).toBe("InstructionWithLabel");
        Expect(instructions[0]["instruction"]["operator"]).toBe(parsedOperator);
        Expect(instructions[0]["instruction"]["operands"].length).toBe(
            parsedRegisters.length
        );
        Expect(instructions[0]["label"]).toBeNull();
        for (let i = 0; i < parsedRegisters.length; i++) {
            Expect(
                instructions[0]["instruction"]["operands"][i]["value"]["tag"]
            ).toBe("Register");
            Expect(
                instructions[0]["instruction"]["operands"][i]["value"]["value"]
            ).toBe(parsedRegisters[i]);
        }
    }

    @Test("Test immediate operands")
    @TestCase("push   $0x23", "push", [0x23])
    @TestCase("push   $23", "push", [23])
    testImmediateOperand(
        instruction: string,
        parsedOperator: string,
        parsedOperands: number[]
    ) {
        let instructions: object[] = parse(instruction);
        Expect(instructions.length).toBe(1);
        Expect(instructions[0]["tag"]).toBe("InstructionWithLabel");
        Expect(instructions[0]["instruction"]["operator"]).toBe(parsedOperator);
        Expect(instructions[0]["instruction"]["operands"].length).toBe(
            parsedOperands.length
        );
        Expect(instructions[0]["label"]).toBeNull();
        for (let i = 0; i < parsedOperands.length; i++) {
            Expect(
                instructions[0]["instruction"]["operands"][i]["value"]["tag"]
            ).toBe("NumericConstant");
            Expect(
                instructions[0]["instruction"]["operands"][i]["value"]["value"]
            ).toBe(parsedOperands[i]);
        }
    }

    @Test("Test address operands")
    @TestCase("push (%ax)", "push", null, null, "ax", null)
    @TestCase("push 10(%bx)", "push", 10, null, "bx", null)
    @TestCase("push 10(%bx, %ax)", "push", 10, null, "bx", "ax")
    @TestCase("push 10(%bx, %ax, 4)", "push", 10, 4, "bx", "ax")
    @TestCase("push (%bx, %ax, 2)", "push", null, 2, "bx", "ax")
    @TestCase("push (%bx, %ax)", "push", null, null, "bx", "ax")
    testAddressOperand(
        instruction: string,
        parsedOperator: string,
        parsedDisplacement: number | null = null,
        parsedScale: number | null = null,
        parsedBaseRegister: string | null = null,
        parsedIndexRegister: string | null = null
    ) {
        let instructions: object[] = parse(instruction);
        Expect(instructions.length).toBe(1);
        Expect(instructions[0]["tag"]).toBe("InstructionWithLabel");
        Expect(instructions[0]["instruction"]["operator"]).toBe(parsedOperator);
        Expect(instructions[0]["instruction"]["operands"].length).toBe(1);
        Expect(instructions[0]["label"]).toBeNull();
        let addressOperand: object =
            instructions[0]["instruction"]["operands"][0]["value"];
        Expect(addressOperand["tag"]).toBe("IndirectAddess");

        // Check displacement
        if (parsedDisplacement == null) {
            Expect(addressOperand["offset"]).toBeNull();
        } else {
            Expect(addressOperand["offset"]["tag"]).toBe("Number");
            Expect(addressOperand["offset"]["value"]).toBe(parsedDisplacement);
        }

        // Check scale
        if (parsedScale == null) {
            Expect(addressOperand["scale"]).toBeNull();
        } else {
            Expect(addressOperand["scale"]["tag"]).toBe("Number");
            Expect(addressOperand["scale"]["value"]).toBe(parsedScale);
        }

        // Check Base Register
        if (parsedBaseRegister == null) {
            Expect(addressOperand["baseReg"]).toBeNull();
        } else {
            Expect(addressOperand["baseReg"]["tag"]).toBe("Register");
            Expect(addressOperand["baseReg"]["value"]).toBe(parsedBaseRegister);
        }

        // Check Index Register
        if (parsedIndexRegister == null) {
            Expect(addressOperand["indexReg"]).toBeNull();
        } else {
            Expect(addressOperand["indexReg"]["tag"]).toBe("Register");
            Expect(addressOperand["indexReg"]["value"]).toBe(
                parsedIndexRegister
            );
        }
    }

    @Test("Check assembly comments")
    @TestCase("ret   ", null)
    @TestCase("ret ; hello world", "hello world")
    @TestCase("ret # hello world", "hello world")
    @TestCase("ret ;", "")
    @TestCase("ret #", "")
    testAssemblyComments(instruction: string, comment: string | null) {
        let instructions: object[] = parse(instruction);
        Expect(instructions.length).toBe(1);
        Expect(instructions[0]["tag"]).toBe("InstructionWithLabel");
        if (comment == null) {
            Expect(instructions[0]["comment"]).toBeNull();
        } else {
            Expect(instructions[0]["comment"]['tag']).toBe("Comment");
            Expect(instructions[0]["comment"]['value']).toBe(comment);
        }
        
    }    
}

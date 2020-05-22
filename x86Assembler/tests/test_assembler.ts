import { Expect, Test, TestFixture, TestCase, SetupFixture } from "alsatian";
import { Assembler, AssembledProgram } from "../src/assembler";

@TestFixture("Test fixture to test assembler machine code generation")
export class AssemblerTestFixture {
    assembler: Assembler;

    @SetupFixture
    setupFixture() {
        this.assembler = new Assembler();
    }

    @Test("Test the machine code for each instruction")
    // Test Move instructions
    @TestCase("mov $0x12,%al", [0xB0, 0x12])
    @TestCase("mov $0x34,%ah", [0xB4, 0x34])
    @TestCase("mov $0x5678,%ax", [0x66, 0xB8, 0x78, 0x56])
    @TestCase("mov $0xab,%ah", [0xB4, 0xAB])
    @TestCase("mov $0xdeadbeef,%ebx", [0xBB, 0xEF, 0xBE, 0xAD, 0xDE])
    @TestCase("mov %bx,%ax", [0x66, 0x89, 0xD8])
    @TestCase("mov %ah,%bl", [0x88, 0xE3])
    
    // Test Arithmetic Instructions
    @TestCase("add %bx,%ax", [0x66, 0x01, 0xD8])
    @TestCase("add %al,%cl", [0x00, 0xC1])
    @TestCase("add %eax,%ecx", [0x01, 0xC1])
    @TestCase("inc %ecx", [0x41])
    @TestCase("inc %bx", [0x66, 0x43])
    
    // Test Binary Instructions
    @TestCase("or $0x3400,%ax", [0x66, 0x0D, 0x00, 0x34])
    @TestCase("and $0xff00,%ax", [0x66, 0x25, 0x00, 0xFF])
    @TestCase("xor %bx,%bx", [0x66, 0x31, 0xDB])
    
    // Test Stack Instructions
    @TestCase("push %eax", [0x50])
    @TestCase("push %ax", [0x66, 0x50])
    @TestCase("push %bx", [0x66, 0x53])
    @TestCase("pop %ax", [0x66, 0x58])

    // Test .byte directive
    @TestCase(".byte 23", [23])
    @TestCase(".byte 0x23", [0x23])
    @TestCase(".byte 0x23, 23", [0x23, 23])

    // Test .value directive
    @TestCase(".value 23", [23, 0])
    @TestCase(".value 0x50", [0x50, 0])
    @TestCase(".value 0x50, 23", [0x50, 0, 23, 0])
    @TestCase(".value 0x50, 0xdead", [0x50, 0, 0xad, 0xde])
    @TestCase(".value 0xbeef, 0xdead", [0xef, 0xbe, 0xad, 0xde])
    @TestCase(".value 12345", [0x39, 0x30])

    // Test .long directive
    @TestCase(".long 23", [23, 0, 0, 0])
    @TestCase(".long 0x50", [0x50, 0, 0, 0])
    @TestCase(".long 0x50, 23", [0x50, 0, 0, 0, 23, 0, 0, 0])
    @TestCase(".long 0x50, 0xdead", [0x50, 0, 0, 0, 0xad, 0xde, 0, 0])
    @TestCase(".long 0xbeef, 0xdead", [0xef, 0xbe, 0, 0, 0xad, 0xde, 0, 0])
    @TestCase(".long 12345", [0x39, 0x30, 0, 0])
    @TestCase(".long 0xdeadbeef", [0xef, 0xbe, 0xad, 0xde])
    testSingleInstructions(
        instruction: string,
        expectedMachineCode: Uint8Array
    ) {
        let assembledProgram:AssembledProgram = this.assembler.assembleProgram(instruction);
        Expect(assembledProgram.instructions.length).toBe(1);
        let generatedMachineCode: Uint8Array = assembledProgram.getMachineCode();
        Expect(generatedMachineCode.length).toBe(expectedMachineCode.length);
        for (let i=0; i<generatedMachineCode.length; i++) {
            Expect(generatedMachineCode[i]).toBe(expectedMachineCode[i]);
        }
    }
}

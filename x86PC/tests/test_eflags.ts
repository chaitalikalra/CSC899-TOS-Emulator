import { Expect, Test, TestFixture, TestCase, SetupFixture } from "alsatian";
import { EFlags } from "../src/eflags";

@TestFixture("Test fixture to test EFlags")
export class EFlagsTestFixture {
    eFlags: EFlags;

    @SetupFixture
    setupFixture() {
        this.eFlags = new EFlags();
    }

    @Test("Test the carry flag")
    testCarryFlag() {
        Expect(this.eFlags.getCarryFlag()).toBe(false);
        this.eFlags.setCarryFlag(false);
        Expect(this.eFlags.getCarryFlag()).toBe(false);
        this.eFlags.setCarryFlag(true);
        Expect(this.eFlags.getCarryFlag()).toBe(true);
    }
    
    @Test("Test the zero flag")
    testZeroFlag() {
        Expect(this.eFlags.getZeroFlag()).toBe(false);
        this.eFlags.setZeroFlag(false);
        Expect(this.eFlags.getZeroFlag()).toBe(false);
        this.eFlags.setZeroFlag(true);
        Expect(this.eFlags.getZeroFlag()).toBe(true);
    }

    @Test("Test the overflow flag")
    testOverflowFlag() {
        Expect(this.eFlags.getOverflowFlag()).toBe(false);
        this.eFlags.setOverflowFlag(false);
        Expect(this.eFlags.getOverflowFlag()).toBe(false);
        this.eFlags.setOverflowFlag(true);
        Expect(this.eFlags.getOverflowFlag()).toBe(true);
    }

    @Test("Test the sign flag")
    testSignFlag() {
        Expect(this.eFlags.getSignFlag()).toBe(false);
        this.eFlags.setSignFlag(false);
        Expect(this.eFlags.getSignFlag()).toBe(false);
        this.eFlags.setSignFlag(true);
        Expect(this.eFlags.getSignFlag()).toBe(true);
    }

    @Test("Test the parity flag")
    testParityFlag() {
        Expect(this.eFlags.getParityFlag()).toBe(false);
        this.eFlags.setParityFlag(false);
        Expect(this.eFlags.getParityFlag()).toBe(false);
        this.eFlags.setParityFlag(true);
        Expect(this.eFlags.getParityFlag()).toBe(true);
    }
}
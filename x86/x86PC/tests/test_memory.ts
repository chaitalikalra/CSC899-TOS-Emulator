import { Expect, Test, TestFixture, SetupFixture } from "alsatian";
import { Memory } from "../src/memory";

@TestFixture("Test fixture to test Memory")
export class MemoryTest {
    memory: Memory;
    static readonly MEMORY_SIZE: number = 128;

    @SetupFixture
    setupFixture() {
        this.memory = new Memory(MemoryTest.MEMORY_SIZE);
    }

    private getRandomInt_(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    @Test("Test invalid memory ")
    testInvalidMemoryAccess(): void {
        Expect(() =>
            this.memory.pokeMemory(
                MemoryTest.MEMORY_SIZE + this.getRandomInt_(1, 100),
                10,
                1
            )
        ).toThrow();
        Expect(() =>
            this.memory.pokeMemory(
                MemoryTest.MEMORY_SIZE + this.getRandomInt_(1, 100),
                10,
                2
            )
        ).toThrow();
        Expect(() =>
            this.memory.pokeMemory(
                MemoryTest.MEMORY_SIZE + this.getRandomInt_(1, 100),
                10,
                4
            )
        ).toThrow();
        Expect(() =>
            this.memory.pokeMemory(MemoryTest.MEMORY_SIZE, 89, 1)
        ).toThrow();
        Expect(() =>
            this.memory.pokeMemory(MemoryTest.MEMORY_SIZE - 1, 89, 2)
        ).toThrow();
        Expect(() =>
            this.memory.pokeMemory(MemoryTest.MEMORY_SIZE - 2, 89, 2)
        ).not.toThrow();
        Expect(() =>
            this.memory.pokeMemory(MemoryTest.MEMORY_SIZE - 1, 89, 4)
        ).toThrow();
        Expect(() =>
            this.memory.pokeMemory(MemoryTest.MEMORY_SIZE - 2, 89, 4)
        ).toThrow();
        Expect(() =>
            this.memory.pokeMemory(MemoryTest.MEMORY_SIZE - 3, 89, 4)
        ).toThrow();
        Expect(() =>
            this.memory.pokeMemory(MemoryTest.MEMORY_SIZE - 4, 89, 4)
        ).not.toThrow();
    }

    @Test("Test byte operations ")
    testByteOperations(): void {
        const address = this.getRandomInt_(0, MemoryTest.MEMORY_SIZE);
        const data = this.getRandomInt_(0, 255);
        this.memory.pokeMemory(address, data, 1);
        Expect(this.memory.peekMemory(address, 1)).toBe(data);
    }

    @Test("Test word operations ")
    testWordOperations(): void {
        let address = this.getRandomInt_(0, MemoryTest.MEMORY_SIZE - 1);
        let data = [this.getRandomInt_(0, 255), this.getRandomInt_(0, 255)];
        let num = ((data[1] & 0xff) << 8) | ((data[0] & 0xff) << 0);
        this.memory.pokeMemory(address, num, 2);
        Expect(this.memory.peekMemory(address, 2)).toBe(num);
        Expect(this.memory.peekMemory(address, 1)).toBe(data[0]);
        Expect(this.memory.peekMemory(address + 1, 1)).toBe(data[1]);

        address = this.getRandomInt_(0, MemoryTest.MEMORY_SIZE - 1);
        data = [this.getRandomInt_(0, 255), this.getRandomInt_(0, 255)];
        num = ((data[1] & 0xff) << 8) | ((data[0] & 0xff) << 0);
        this.memory.pokeMemory(address, data[0], 1);
        this.memory.pokeMemory(address + 1, data[1], 1);
        Expect(this.memory.peekMemory(address, 2)).toBe(num);
    }

    @Test("Test long operations ")
    testLongOperations(): void {
        let address = this.getRandomInt_(0, MemoryTest.MEMORY_SIZE - 3);
        let data = [
            this.getRandomInt_(0, 255),
            this.getRandomInt_(0, 255),
            this.getRandomInt_(0, 255),
            this.getRandomInt_(0, 255),
        ];
        let num =(
            ((data[3] & 0xff) << 24) |
            ((data[2] & 0xff) << 16) |
            ((data[1] & 0xff) << 8) |
            ((data[0] & 0xff) << 0)
        ) >>> 0;
            
        this.memory.pokeMemory(address, num, 4);
        Expect(this.memory.peekMemory(address, 4)).toBe(num);
        Expect(this.memory.peekMemory(address, 1)).toBe(data[0]);
        Expect(this.memory.peekMemory(address + 1, 1)).toBe(data[1]);
        Expect(this.memory.peekMemory(address + 2, 1)).toBe(data[2]);
        Expect(this.memory.peekMemory(address + 3, 1)).toBe(data[3]);

        address = this.getRandomInt_(0, MemoryTest.MEMORY_SIZE - 3);
        data = [
            this.getRandomInt_(0, 255),
            this.getRandomInt_(0, 255),
            this.getRandomInt_(0, 255),
            this.getRandomInt_(0, 255),
        ];
        num =(
            ((data[3] & 0xff) << 24) |
            ((data[2] & 0xff) << 16) |
            ((data[1] & 0xff) << 8) |
            ((data[0] & 0xff) << 0)
        ) >>> 0;
        this.memory.pokeMemory(address, data[0], 1);
        this.memory.pokeMemory(address + 1, data[1], 1);
        this.memory.pokeMemory(address + 2, data[2], 1);
        this.memory.pokeMemory(address + 3, data[3], 1);
        Expect(this.memory.peekMemory(address, 4)).toBe(num);
    }
}

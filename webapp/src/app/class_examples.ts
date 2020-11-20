const CLASS_EXAMPLES = {
  move: `mov $0x12, %al
mov $0x34, %ah
mov $0x5678, %ax
mov $0xab, %ah
mov $0xdeadbeef, %ebx
mov %bx, %ax
mov %ah, %bl`,

  logical_arithmetic: `mov $0x20, %ax
mov $0xa, %bx
add %bx, %ax
or $0x3400, %ax
and $0xff00, %ax
xor %bx, %bx
inc %bx`,

  eflags: `xor %cx, %cx
mov $0x3, %ax
L1: add %ax, %cx
dec %ax
jnz L1
mov %cx, %ax`,

  indirect_addressing: `mov $0x20, %eax
mov $0x41,  %bl
mov %bl, (%eax)`,

  stack: `mov $0x100, %esp
mov $0x1234, %ax
mov $0x5678, %bx
push %ax
push %bx
pop %ax
pop %bx`,

  subroutines1: `mov $0x100, %esp
mov $0x1234, %ax
call L2
L1: jmp L1
L2: inc %ax
ret`,

  subroutines2: `mov $0x100, %esp
call L2
mov $0x1234, %ax
L1: jmp L1
L2: pop %eax
add $0x4, %eax
push %eax
ret
`,
};

function getClassExample(example: string): string {
  return CLASS_EXAMPLES[example] || '';
}

export { getClassExample };

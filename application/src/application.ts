import { Assembler } from '../../x86Assembler/src/assembler'

let assembler = new Assembler();

let code = `
mov %bl,(%eax)
`;

let o = assembler.assembleProgram(code);
console.log(o.toString());

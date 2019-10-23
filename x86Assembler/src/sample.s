myFunc:

  push %ebp
  mov %esp, %ebp
  sub $4, %esp
  push %edi
  push %esi


  mov 8(%ebp), %eax
  mov 12(%ebp), %esi
  mov 16(%ebp), %edi

  mov %edi, -4(%ebp)
  add %esi, -4(%ebp)
  add -4(%ebp), %eax



  pop %esi
  pop %edi
  mov %ebp, %esp
  pop %ebp
  ret

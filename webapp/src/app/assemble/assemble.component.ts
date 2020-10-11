import { Component, OnInit } from '@angular/core';
import { X86Service } from '../x86.service';
import { Router } from '@angular/router';
import 'brace';
import 'brace/mode/assembly_x86';
import 'brace/theme/dracula';

@Component({
  selector: 'app-assemble',
  templateUrl: './assemble.component.html',
  styleUrls: ['./assemble.component.css'],
})
export class AssembleComponent implements OnInit {
  code = 'Type some code here';
  assembledCode = '';
  constructor(private x86Service: X86Service, private router: Router) {
    console.log('Assemble constructor');
  }

  ngOnInit(): void {
    console.log('Assemble on init');
    this.x86Service.onAssemblerReady();
  }

  onAssemble(): void {
    let s = this.x86Service.assembleProgram(this.code);
    this.assembledCode = s.toString();
  }

  onClear(): void {
    // this.router.navigateByUrl('/test', { skipLocationChange: true });
    this.code = '';
  }

  onFileSelect(files): void {
    const file: File = files[0];
    const reader: FileReader = new FileReader();

    reader.readAsText(file);

    reader.onload = () => {
      console.log(reader.result);
      this.code = reader.result as string;
    };
    reader.onerror = () => {
      console.log(reader.error);
    };
  }
}

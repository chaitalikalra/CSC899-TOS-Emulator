import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { X86Service } from '../x86.service';
import { Router } from '@angular/router';
import 'brace';
import 'brace/mode/assembly_x86';
import 'brace/theme/dracula';
import {
  DropzoneConfigInterface,
  DropzoneDirective,
} from 'ngx-dropzone-wrapper';
import { CodeEditorComponent } from '../code-editor/code-editor.component';

@Component({
  selector: 'app-assemble',
  templateUrl: './assemble.component.html',
  styleUrls: ['./assemble.component.css'],
})
export class AssembleComponent implements OnInit {
  code = 'Type some code here';
  error = '';

  @ViewChild('fileinput') fileInput: ElementRef;
  @ViewChild(DropzoneDirective, { static: false }) dropzone: DropzoneDirective;
  @ViewChild('codeEditor') codeEditor: CodeEditorComponent;

  // Dropzone config
  readonly dropzoneConfig: DropzoneConfigInterface = {
    clickable: false,
    url: 'https://httpbin.org/post',
    autoProcessQueue: false,
    acceptedFiles: '.txt,.s',
    previewsContainer: '.hidden-drop-preview',
  };

  constructor(private x86Service: X86Service, private router: Router) {
    console.log('Assemble constructor');
  }

  ngOnInit(): void {
    console.log('Assemble on init');
    if (this.x86Service.originalCode.length !== 0) {
      this.code = this.x86Service.originalCode;
      this.x86Service.originalCode = '';
    }
    this.x86Service.onAssemblerReady();
  }

  onAssemble(): void {
    if (this.code.trim().length === 0) {
      return;
    }
    try {
      this.x86Service.assembleProgram(this.code);
      this.router.navigateByUrl('/test', { skipLocationChange: true });
    } catch (e) {
      console.log(e);
      const errorObject = e.getErrorObject();
      this.error = errorObject.message;
      if (errorObject.line) {
        this.codeEditor.setCursorLine(errorObject.line);
      }
    }
  }

  onClear(): void {
    this.code = '';
    this.error = '';
    this.x86Service.clear();
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
    // Clear File and Dropzone
    this._clearFileInputs();
  }

  onDropFileAdded(selectedFile: any): void {
    this.onFileSelect([selectedFile]);
  }

  private _clearFileInputs(): void {
    // Clear file input
    this.fileInput.nativeElement.value = '';
    this.dropzone.reset();
  }
}

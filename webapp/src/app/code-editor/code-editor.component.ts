import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import 'brace';
import 'brace/mode/assembly_x86';
import 'brace/theme/dracula';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.css'],
})
export class CodeEditorComponent implements OnInit {
  @Input() code = '';
  @Output() codeChange = new EventEmitter<string>();
  @Input() readOnly = false;

  mode = 'assembly_x86';
  theme = 'dracula';

  constructor() {}

  ngOnInit(): void {}

  onChange(code: string): void {
    this.codeChange.emit(code);
  }
}

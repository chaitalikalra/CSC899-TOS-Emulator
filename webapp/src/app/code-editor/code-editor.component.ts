import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import 'brace';
import 'brace/mode/assembly_x86';
import 'brace/theme/dracula';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.css'],
})
export class CodeEditorComponent {
  @ViewChild('editor') editor;

  @Input() code = '';
  @Input() readOnly = false;
  @Input() cursorLine = 1;

  @Output() codeChange = new EventEmitter<string>();

  mode = 'assembly_x86';
  theme = 'dracula';
  options = {
    fontSize: 14,
    showPrintMargin: false,
  };

  constructor() {}

  onChange(code: string): void {
    this.codeChange.emit(code);
  }

  public setCursorLine(val: number): void {
    if (this.editor) {
      this.editor.getEditor().gotoLine(val);
    } else {
      console.log('setCursorLine: editor not initialized');
    }
  }
}

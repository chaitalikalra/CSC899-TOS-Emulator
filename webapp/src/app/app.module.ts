import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- NgModel lives here

import { AppComponent } from './app.component';
import { AssembleComponent } from './assemble/assemble.component';
import { EmulatorComponent } from './emulator/emulator.component';
import { AppRoutingModule } from './app-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AceEditorModule } from 'ng2-ace-editor';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { DropzoneModule } from 'ngx-dropzone-wrapper';

@NgModule({
  declarations: [
    AppComponent,
    AssembleComponent,
    EmulatorComponent,
    CodeEditorComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    NgbModule,
    AceEditorModule,
    DropzoneModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

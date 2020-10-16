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
import { PropertyDisplayComponent } from './property-display/property-display.component';
import { RegistersViewComponent } from './registers-view/registers-view.component';

@NgModule({
  declarations: [
    AppComponent,
    AssembleComponent,
    EmulatorComponent,
    CodeEditorComponent,
    PropertyDisplayComponent,
    RegistersViewComponent,
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

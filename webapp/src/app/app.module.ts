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
import { FlagsViewComponent } from './flags-view/flags-view.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import { MemorySliderComponent } from './memory-slider/memory-slider.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MemoryGridComponent } from './memory-grid/memory-grid.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AssembledViewComponent } from './assembled-view/assembled-view.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    AppComponent,
    AssembleComponent,
    EmulatorComponent,
    CodeEditorComponent,
    PropertyDisplayComponent,
    RegistersViewComponent,
    FlagsViewComponent,
    MemorySliderComponent,
    MemoryGridComponent,
    AssembledViewComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    NgbModule,
    AceEditorModule,
    DropzoneModule,
    NoopAnimationsModule,
    MatSliderModule,
    MatGridListModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

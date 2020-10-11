import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- NgModel lives here
// import { UIRouterModule } from '@uirouter/angular';

import { AppComponent } from './app.component';
import { AssembleComponent } from './assemble/assemble.component';
import { EmulatorComponent } from './emulator/emulator.component';
import { AppRoutingModule } from './app-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [AppComponent, AssembleComponent, EmulatorComponent],
  imports: [BrowserModule, FormsModule, AppRoutingModule, NgbModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

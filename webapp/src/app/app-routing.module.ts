import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssembleComponent } from './assemble/assemble.component';
import { EmulatorComponent } from './emulator/emulator.component';

const routes: Routes = [
  { path: '', component: AssembleComponent },
  { path: 'test', component: EmulatorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdminPlumbersComponent } from './admin-plumbers.component';

const routes: Routes = [
  { path: '', component: AdminPlumbersComponent }
];

@NgModule({
  declarations: [AdminPlumbersComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class AdminPlumbersModule { }

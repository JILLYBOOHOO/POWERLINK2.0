import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlumberRegisterComponent } from './plumber-register.component';

const routes: Routes = [
  { path: '', component: PlumberRegisterComponent }
];

@NgModule({
  declarations: [PlumberRegisterComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class PlumberRegisterModule { }

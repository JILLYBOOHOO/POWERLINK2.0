import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MechanicComponent } from './mechanic.component';

const routes: Routes = [
  { path: '', component: MechanicComponent }
];

@NgModule({
  declarations: [MechanicComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class MechanicModule { }

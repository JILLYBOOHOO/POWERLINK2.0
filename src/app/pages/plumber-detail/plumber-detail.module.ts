import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PlumberDetailComponent } from './plumber-detail.component';

const routes: Routes = [
  { path: '', component: PlumberDetailComponent }
];

@NgModule({
  declarations: [PlumberDetailComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class PlumberDetailModule { }

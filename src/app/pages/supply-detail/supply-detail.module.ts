import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SupplyDetailComponent } from './supply-detail.component';

const routes: Routes = [
  { path: '', component: SupplyDetailComponent }
];

@NgModule({
  declarations: [SupplyDetailComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class SupplyDetailModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdminOrdersComponent } from './admin-orders.component';

const routes: Routes = [
  { path: '', component: AdminOrdersComponent }
];

@NgModule({
  declarations: [AdminOrdersComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class AdminOrdersModule { }

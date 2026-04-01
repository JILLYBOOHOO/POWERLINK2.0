import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { InsuranceComponent } from './insurance.component';

const routes: Routes = [
  { path: '', component: InsuranceComponent }
];

@NgModule({
  declarations: [InsuranceComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class InsuranceModule { }

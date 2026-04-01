import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminGuard } from './guards/admin.guard';
import { CustomerGuard } from './guards/customer.guard';

const routes: Routes = [
  { 
    path: '', 
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule) 
  },
  { 
    path: 'insurance', 
    loadChildren: () => import('./pages/insurance/insurance.module').then(m => m.InsuranceModule) 
  },
  { 
    path: 'supplies', 
    loadChildren: () => import('./pages/insurance/insurance.module').then(m => m.InsuranceModule) 
  },
  { 
    path: 'mechanic', 
    loadChildren: () => import('./pages/mechanic/mechanic.module').then(m => m.MechanicModule) 
  },
  { 
    path: 'plumbers', 
    loadChildren: () => import('./pages/mechanic/mechanic.module').then(m => m.MechanicModule) 
  },
  { 
    path: 'supplies/:slug', 
    loadChildren: () => import('./pages/supply-detail/supply-detail.module').then(m => m.SupplyDetailModule) 
  },
  { 
    path: 'plumbers/:slug', 
    loadChildren: () => import('./pages/plumber-detail/plumber-detail.module').then(m => m.PlumberDetailModule) 
  },
  { 
    path: 'plumber-register', 
    loadChildren: () => import('./pages/plumber-register/plumber-register.module').then(m => m.PlumberRegisterModule) 
  },
  { path: 'mechanics', redirectTo: 'mechanic', pathMatch: 'full' },
  { 
    path: 'login', 
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule) 
  },
  { 
    path: 'admin/login', 
    loadChildren: () => import('./pages/admin-login/admin-login.module').then(m => m.AdminLoginModule) 
  },
  { 
    path: 'account', 
    loadChildren: () => import('./pages/account/account.module').then(m => m.AccountModule), 
    canActivate: [CustomerGuard] 
  },
  { 
    path: 'signup', 
    loadChildren: () => import('./pages/signup/signup.module').then(m => m.SignupModule) 
  },
  { 
    path: 'cart', 
    loadChildren: () => import('./pages/cart/cart.module').then(m => m.CartModule), 
    canActivate: [CustomerGuard] 
  },
  { 
    path: 'payment', 
    loadChildren: () => import('./pages/payment/payment.module').then(m => m.PaymentModule), 
    canActivate: [CustomerGuard] 
  },
  { 
    path: 'confirmation', 
    loadChildren: () => import('./pages/confirmation/confirmation.module').then(m => m.ConfirmationModule), 
    canActivate: [CustomerGuard] 
  },
  { 
    path: 'admin/orders', 
    loadChildren: () => import('./pages/admin-orders/admin-orders.module').then(m => m.AdminOrdersModule), 
    canActivate: [AdminGuard] 
  },
  { 
    path: 'admin/plumbers', 
    loadChildren: () => import('./pages/admin-plumbers/admin-plumbers.module').then(m => m.AdminPlumbersModule), 
    canActivate: [AdminGuard] 
  },
  { 
    path: 'contact', 
    loadChildren: () => import('./pages/contact/contact.module').then(m => m.ContactModule) 
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

import { Routes } from '@angular/router';

// Public components
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { MatrimonialRegisterComponent } from './pages/matrimonial/register/register';
import { MembershipRegisterComponent } from './pages/membership/register/register';


import { StatusComponent } from './shared/status/status';
import { PaymentComponent } from './pages/payment/payment';
import { SubmitStoryComponent } from './pages/matrimonial/submit-story/submit-story';
import { PremiumPlansComponent } from './pages/matrimonial/premium-plans/premium-plans';
import { HappyStoryComponent } from './pages/matrimonial/happy-stories/happy-stories';
import { SupportComponent } from './pages/admin/support/support';
import { userSupportComponent } from './pages/user/support/support';
import { MembershipHomeComponent } from './pages/membership-home/membership-home';
import { MatrimonialWelcomeComponent } from './pages/matrimonial/welcome/welcome';
import { AboutComponent } from './pages/matrimonial/about/about';
import { HelpComponent } from './pages/matrimonial/help/help';
import { MatrimonialLoginComponent } from './pages/login/matrimonial-login/matrimonial-login';
import { MembershipLoginComponent } from './pages/login/membership-login/membership-login';
import { Terms } from './pages/terms/terms';
import { Refund } from './pages/refund/refund';
import { Privacy } from './pages/privacy/privacy';
import { MatrimonialHomeComponent } from './pages/matrimonial-home/matrimonial-home';
import { AdminLoginComponent } from './pages/admin/admin-login/admin-login';







export const routes: Routes = [
  // 🌐 Public Routes
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'matrimonial-login', component: MatrimonialLoginComponent },
{ path: 'membership-login', component: MembershipLoginComponent},
{ path: 'admin-login', component: AdminLoginComponent},


  { path: 'matrimonial-register', component: MatrimonialRegisterComponent },
  { path: 'membership-register', component: MembershipRegisterComponent },
  { path: 'status', component: StatusComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'matrimonial-home', component: MatrimonialHomeComponent },
  { path: 'membership-home', component: MembershipHomeComponent },
  { path: 'submit-story', component: SubmitStoryComponent },
  { path: 'premium', component: PremiumPlansComponent },
  { path: 'about', component: AboutComponent },
  { path: 'help', component: HelpComponent },
  { path: 'stories', component: HappyStoryComponent },
  { path: 'user-support', component: userSupportComponent },
   { path: 'matrimonial-welcome', component: MatrimonialWelcomeComponent },
    { path: 'terms', component: Terms },
  { path: 'refund', component: Refund },
  { path: 'privacy', component: Privacy },
  { path: 'payment/:userId', component: PaymentComponent },


  // 🧭 Admin Routes (inside layout)
 {
    path: 'admin',
    loadChildren: () =>
      import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  { path: '', redirectTo: 'admin/dashboard', pathMatch: 'full' },

  // 🚫 Wildcard Fallback
  { path: '**', redirectTo: '' },
];

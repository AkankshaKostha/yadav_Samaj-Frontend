import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import Swal from 'sweetalert2';

import { MatrimonialUserService } from '../../core/matrimonial-user';
import { MembershipUserService } from '../../core/membership-user';
import { AuthService } from '../../core/auth';

export type UserType = 'membership' | 'matrimonial';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive, TitleCasePipe],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  phoneForm: FormGroup;
  otpForm: FormGroup;
  step: 1 | 2 = 1;
  userType: UserType = 'matrimonial';
  adminForm: FormGroup;
   loginType: 'user' | 'admin' = 'user'; // default = user login

  constructor(
    private fb: FormBuilder,
    private membershipService: MembershipUserService,
    private matrimonialService: MatrimonialUserService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.phoneForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{4,6}$/)]]
    });
  // ---------------- Admin Form ----------------
    this.adminForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.route.queryParams.subscribe(params => {
      this.userType = params['redirect'] === 'membership' ? 'membership' : 'matrimonial';
    });
  }

  // ---------------- Send OTP ----------------
  async sendOtp() {
    if (this.phoneForm.invalid) {
      Swal.fire('Invalid Phone', 'Enter a valid 10-digit phone number', 'warning');
      return;
    }

    const phone = this.phoneForm.get('phone')!.value;

    try {
      let response: any;

      if (this.userType === 'membership') {
        response = await this.membershipService.sendOtp(phone);
      } else {
        response = await this.matrimonialService.sendOtp(phone);
      }

      console.log(`OTP for ${phone}:`, response.otp);

      Swal.fire({
        title: 'OTP Sent',
        html: `OTP for testing: <b>${response.otp}</b><br>${response.message}`,
        icon: 'info'
      });

      this.step = 2;

    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to send OTP', 'error');
    }
  }

  // ---------------- Verify OTP ----------------
  async verifyOtp(): Promise<void> {
    const phone = this.phoneForm.get('phone')!.value;
    const otp = this.otpForm.get('otp')!.value;

    if (!otp) {
      await Swal.fire('Enter OTP', 'Please enter the OTP sent to your phone', 'warning');
      return;
    }

    try {
      let response: any;

      if (this.userType === 'membership') {
        response = await this.membershipService.verifyOtp(phone, otp);
      } else {
        response = await this.matrimonialService.verifyOtp(phone, otp);
      }

      if (!response.verified) {
        await Swal.fire('Invalid OTP', response.message || 'OTP verification failed', 'error');
        return;
      }

      if (!response.status || response.status === 'PENDING') {
        await Swal.fire('Pending Approval', 'Admin has not approved your account yet.', 'info');
        return;
      }

      // Payment check
      if (!response.paymentDone) {
        await Swal.fire('Payment Pending', 'Redirecting to payment page...', 'info');
        this.router.navigate(['/payment'], { queryParams: { phone, type: this.userType } });
        return;
      }

      // ✅ Store logged-in phone for both user types
      localStorage.setItem('loggedInPhone', phone);
      localStorage.setItem('userType', this.userType);

      await Swal.fire('Login Success', 'You are logged in successfully', 'success');

      this.authService.saveUser({
        name: response.fullName || phone,
        role: response.role || 'USER'
      });

      // Redirect
      if (response.role === 'ADMIN') {
        this.router.navigate(['/admin-login']);
      } else if (this.userType === 'membership') {
        this.router.navigate(['/membership-home']);
      } else {
        this.router.navigate(['/matrimonial-home']);
      }

    } catch (err: any) {
      console.error(err);
      await Swal.fire('Error', err?.message || 'Something went wrong during OTP verification', 'error');
    }
  }

    // ---------------- Admin Login ----------------
  loginAdmin() {
    const { email, password } = this.adminForm.value;

    // ✅ Replace these with real admin validation logic or API
    const ADMIN_EMAIL = 'admin@yadavsamaj.com';
    const ADMIN_PASSWORD = 'Admin123';

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      this.authService.saveUser({ name: 'Admin', role: 'ADMIN' });
      Swal.fire('Success', 'Admin Logged In', 'success');
    this.router.navigate(['/admin/dashboard']);
    } else {
      Swal.fire('Error', 'Invalid email or password', 'error');
    }
  }
}

import { Component, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email!: string;
  password!: string;
  isPasswordVisible: boolean = false;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  loginFailed: boolean = false;
  @ViewChild('successToast', { static: false })
  successToast!: ElementRef;
  @ViewChild('dangerToast', { static: false })
  dangerToast!: ElementRef;

  constructor(
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private router: Router,
    private renderer: Renderer2
  ) {}

  onLogin(): void {
    this.authService
      .login(this.email, this.password)
      .then(() => {
        console.log('Login Successful');
        this.router.navigate(['/main']);
      })
      .catch((error) => {
        // Handle login error
        console.log('Login failed:', error);
        this.loginFailed = true;
        this.isPasswordVisible = !this.isPasswordVisible;
      });
  }

  signInWithGoogle(): void {
    const provider = new GoogleAuthProvider();
    this.afAuth
      .signInWithPopup(provider)
      .then((result: firebase.auth.UserCredential) => {
        console.log('Google Sign-In successful:', result);
        this.router.navigate(['/main']);
      })
      .catch((error: firebase.auth.Error) => {
        console.log('Google Sign-In failed:', error);
      });
  }

  // Method to show the success toast
  showSuccessToast() {
    this.renderer.removeClass(this.successToast.nativeElement, 'hidden');
    setTimeout(() => {
      this.renderer.addClass(this.successToast.nativeElement, 'hidden');
    }, 5000); // Hide the toast after 3 seconds
  }

  // Method to show the danger toast
  showDangerToast() {
    this.renderer.removeClass(this.dangerToast.nativeElement, 'hidden');
    setTimeout(() => {
      this.renderer.addClass(this.dangerToast.nativeElement, 'hidden');
    }, 5000); // Hide the toast after 3 seconds
  }

  resetPassword(): void {
    this.afAuth
      .sendPasswordResetEmail(this.email)
      .then(() => {
        console.log('Password reset email sent');
        this.showSuccessToast();
      })
      .catch((error) => {
        console.log('Password reset failed:', error);
        this.showDangerToast();
      });
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}

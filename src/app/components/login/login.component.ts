import { Component } from '@angular/core';
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

  constructor(
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private router: Router
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

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}

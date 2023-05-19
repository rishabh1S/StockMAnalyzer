import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email!: string;
  password!: string;

  constructor(private authService: AuthService, private router: Router) {}

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
}

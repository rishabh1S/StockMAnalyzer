import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    this.authService
      .register(this.email, this.password)
      .then(() => {
        // Registration successful, perform any additional actions
        console.log('Registration successful');
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        // Handle registration error
        console.log('Registration failed:', error);
      });
  }
}

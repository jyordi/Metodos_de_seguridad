import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  credentials = {
    email: '',
    password: ''
  };

  errorMessage = '';
  token: string | null = null; // Variable para almacenar el token
  loginAttempts: number = 0; // Variable para almacenar los intentos de inicio de sesión
  lockoutTime: number = 0; // Variable para almacenar el tiempo de bloqueo

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.updateLockoutTime();
  }

  onSubmit(): void {
    this.auth.login(this.credentials).subscribe(success => {
      if (success) {
        // Guardamos el token en la variable para mostrarlo en la vista
        this.token = localStorage.getItem('auth_token');
        // Redirigimos al dashboard
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Credenciales incorrectas. Intenta nuevamente.';
        this.token = null; // Si las credenciales son incorrectas, eliminamos el token
        this.loginAttempts = this.auth.getLoginAttempts(this.credentials.email);
        this.lockoutTime = this.auth.getLockoutTime(this.credentials.email);
        this.updateLockoutTime();
      }
    });
  }

  private updateLockoutTime(): void {
    if (this.lockoutTime > 0) {
      setTimeout(() => {
        this.lockoutTime = this.auth.getLockoutTime(this.credentials.email);
        if (this.lockoutTime > 0) {
          this.updateLockoutTime();
        }
      }, 1000);
    }
  }
}

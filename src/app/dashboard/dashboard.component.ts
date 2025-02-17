import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  token: string | null = null;
  passwordHash: string | null = null;
  loginAttempts: number | null = null;
  sanitizedInput: string | null = null;
  protectedInput: string | null = null;

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    // Verificamos si el usuario está autenticado
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      this.token = storedToken;  // Recuperamos el token del localStorage
      console.log('Token recuperado:', this.token);
    } else {
      this.router.navigate(['/login']);  // Si no hay token, redirigimos al login
    }

    // Mostrar el hash de la contraseña para demostración
    this.passwordHash = this.auth['user'].passwordHash;
    console.log('Hash de la contraseña:', this.passwordHash);

    // Mostrar los intentos de inicio de sesión
    this.loginAttempts = this.auth.getLoginAttempts(this.auth['user'].email);
    console.log('Intentos de inicio de sesión:', this.loginAttempts);

    // Sanitizar y proteger la entrada del usuario
    const userInput = "example' OR '1'='1";
    this.sanitizedInput = this.auth.sanitizeInput(userInput);
    this.protectedInput = this.auth.protectAgainstSQLInjection(userInput);
    console.log('Entrada sanitizada:', this.sanitizedInput);
    console.log('Entrada protegida contra inyecciones SQL:', this.protectedInput);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

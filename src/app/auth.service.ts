import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import * as bcrypt from 'bcryptjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'auth_token';
  private loginAttemptsKey = 'login_attempts'; // Clave para almacenar los intentos de inicio de sesión
  private lockoutTime = new Map<string, number>(); // Para rastrear el tiempo de bloqueo

  // Estado de autenticación observable
  private loggedIn = new BehaviorSubject<boolean>(this.isAuthenticated());
  public isLoggedIn$ = this.loggedIn.asObservable();

  // Usuario "hard-codeado" para la demostración
  private readonly user = {
    email: 'admin@admin.com',
    passwordHash: this.hashPassword('12345') // Almacenar el hash de la contraseña
  };

  constructor() { }

  /**
   * Simula el login comprobando las credenciales.
   */
  login(credentials: { email: string; password: string }): Observable<boolean> {
    console.log('Intentando iniciar sesión con:', credentials);

    // Verificar si el usuario está bloqueado
    const lockoutEndTime = this.lockoutTime.get(credentials.email);
    if (lockoutEndTime && lockoutEndTime > Date.now()) {
      console.log('Usuario bloqueado. Intenta nuevamente más tarde.');
      return of(false);
    }

    // Protección contra ataques de fuerza bruta
    const attempts = this.getLoginAttempts(credentials.email);
    if (attempts >= 5) {
      console.log('Demasiados intentos fallidos. Usuario bloqueado por 20 segundos.');
      this.lockoutTime.set(credentials.email, Date.now() + 20000); // Bloquear por 20 segundos
      this.setLoginAttempts(credentials.email, 0); // Restablecer el contador de intentos
      return of(false);
    }

    if (credentials.email === this.user.email && this.verifyPassword(credentials.password, this.user.passwordHash)) {
      // Si las credenciales son correctas, generamos un token aleatorio
      const token = this.generateRandomToken();
      localStorage.setItem(this.tokenKey, token);
      this.loggedIn.next(true);
      console.log('Inicio de sesión exitoso. Token generado:', token);
      this.setLoginAttempts(credentials.email, 0); // Restablecer el contador de intentos
      return of(true);
    } else {
      console.log('Credenciales incorrectas.');
      this.setLoginAttempts(credentials.email, attempts + 1); // Incrementar el contador de intentos
      return of(false);
    }
  }

  /**
   * Cierra la sesión removiendo el token y restableciendo los intentos de inicio de sesión.
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.setLoginAttempts(this.user.email, 0); // Restablecer los intentos de inicio de sesión
    this.loggedIn.next(false);
    console.log('Sesión cerrada. Token eliminado.');
  }

  /**
   * Verifica si existe un token almacenado.
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    const isAuthenticated = token !== null;
    console.log('Verificación de autenticación:', isAuthenticated);
    return isAuthenticated;
  }

  /**
   * Genera un token aleatorio.
   */
  private generateRandomToken(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 16; i++) {
      token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
  }

  /**
   * Genera un hash de la contraseña usando bcryptjs.
   */
  private hashPassword(password: string): string {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    console.log('Hash de la contraseña generado:', hash);
    return hash;
  }

  /**
   * Verifica si la contraseña coincide con el hash almacenado usando bcryptjs.
   */
  private verifyPassword(password: string, hash: string): boolean {
    const isMatch = bcrypt.compareSync(password, hash);
    console.log('Verificación de contraseña:', isMatch);
    return isMatch;
  }

  /**
   * Obtiene los intentos de inicio de sesión para un correo electrónico.
   */
  getLoginAttempts(email: string): number {
    const attempts = localStorage.getItem(`${this.loginAttemptsKey}_${email}`);
    return attempts ? parseInt(attempts, 10) : 0;
  }

  /**
   * Establece los intentos de inicio de sesión para un correo electrónico.
   */
  private setLoginAttempts(email: string, attempts: number): void {
    localStorage.setItem(`${this.loginAttemptsKey}_${email}`, attempts.toString());
  }

  /**
   * Obtiene el tiempo restante de bloqueo para un correo electrónico.
   */
  getLockoutTime(email: string): number {
    const lockoutEndTime = this.lockoutTime.get(email);
    return lockoutEndTime ? Math.max(0, lockoutEndTime - Date.now()) : 0;
  }

  /**
   * Sanitiza la entrada del usuario para prevenir ataques XSS.
   */
  sanitizeInput(input: string): string {
    const sanitized = input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    console.log('Entrada sanitizada:', sanitized);
    return sanitized;
  }

  /**
   * Protege contra inyecciones SQL.
   */
  protectAgainstSQLInjection(input: string): string {
    const sanitized = input.replace(/'/g, "''");
    console.log('Entrada protegida contra inyecciones SQL:', sanitized);
    return sanitized;
  }
}


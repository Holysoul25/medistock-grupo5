import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'ms_token';
  private readonly USER_KEY  = 'ms_user';
  private api = environment.apiUrl;

  private userSubject = new BehaviorSubject<Usuario | null>(this.storedUser());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get token(): string | null { return localStorage.getItem(this.TOKEN_KEY); }
  get user(): Usuario | null { return this.userSubject.value; }
  get isAuthenticated(): boolean { return !!this.token; }

  hasRole(...roles: string[]): boolean {
    return !!this.user && roles.includes(this.user.rol);
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/usuarios/login`, req).pipe(
      tap(res => this.storeSession(res))
    );
  }

  register(req: RegisterRequest): Observable<any> {
    return this.http.post(`${this.api}/usuarios/register`, req);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.api}/usuarios/me`);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  private storeSession(res: AuthResponse): void {
    const token = (res as any).token ?? (res as any).data?.token;
    // backend puede devolver 'usuario' o 'user'
    const user  = (res as any).user ?? (res as any).usuario
                ?? (res as any).data?.user ?? (res as any).data?.usuario;
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.userSubject.next(user);
  }

  private storedUser(): Usuario | null {
    try { return JSON.parse(localStorage.getItem(this.USER_KEY) || 'null'); }
    catch { return null; }
  }
}

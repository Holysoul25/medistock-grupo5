import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({ selector: 'app-login', templateUrl: './login.component.html', styleUrls: ['./login.component.scss'] })
export class LoginComponent implements OnInit {
  form!: FormGroup;
  isLogin = true;
  loading = false;
  error = '';
  returnUrl = '/productos';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Captura la returnUrl para volver al carrito tras el login
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/productos';

    if (this.auth.isAuthenticated) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }
    this.buildForm();
  }

  buildForm() {
    this.form = this.fb.group({
      nombre:   [''],
      apellido: [''],
      rut:      [''],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  toggle() {
    this.isLogin = !this.isLogin;
    this.error = '';
    if (!this.isLogin) {
      this.form.get('nombre')?.setValidators(Validators.required);
      this.form.get('rut')?.setValidators(Validators.required);
    } else {
      this.form.get('nombre')?.clearValidators();
      this.form.get('rut')?.clearValidators();
    }
    this.form.get('nombre')?.updateValueAndValidity();
    this.form.get('rut')?.updateValueAndValidity();
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';

    const { email, password, nombre, apellido, rut } = this.form.value;

    if (this.isLogin) {
      this.auth.login({ email, password }).subscribe({
        next: () => this.router.navigateByUrl(this.returnUrl),
        error: (e: any) => { this.error = e.error?.message || 'Credenciales inválidas'; this.loading = false; }
      });
    } else {
      this.auth.register({ nombre, apellido, rut, email, password, rol: 'cliente' }).subscribe({
        next: () => {
          // Tras registrar, hace login automático y redirige
          this.auth.login({ email, password }).subscribe({
            next: () => this.router.navigateByUrl(this.returnUrl),
            error: (e: any) => { this.error = e.error?.message || 'Error al iniciar sesión'; this.loading = false; }
          });
        },
        error: (e: any) => { this.error = e.error?.message || 'Error al registrarse'; this.loading = false; }
      });
    }
  }

  field(n: string) { return this.form.get(n); }
  invalid(n: string) { const f = this.field(n); return f?.invalid && f?.touched; }
}
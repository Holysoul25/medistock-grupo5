import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({ selector: 'app-login', templateUrl: './login.component.html', styleUrls: ['./login.component.scss'] })
export class LoginComponent implements OnInit {
  form!: FormGroup;
  isLogin = true;
  tipoCliente: 'B2C' | 'B2B' = 'B2C';
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    if (this.auth.isAuthenticated) { this.router.navigate(['/productos']); return; }
    this.buildForm();
  }

  buildForm() {
    this.form = this.fb.group({
      nombre:       [''],
      apellido:     [''],
      rut:          [''],
      razon_social: [''],
      email:        ['', [Validators.required, Validators.email]],
      password:     ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  toggle() {
    this.isLogin = !this.isLogin;
    this.error = '';
    this.tipoCliente = 'B2C';
    this.actualizarValidadores();
  }

  setTipo(tipo: 'B2C' | 'B2B') {
    this.tipoCliente = tipo;
    this.actualizarValidadores();
  }

  private actualizarValidadores() {
    const nombre       = this.form.get('nombre');
    const rut          = this.form.get('rut');
    const razonSocial  = this.form.get('razon_social');

    if (!this.isLogin) {
      nombre?.setValidators(Validators.required);
      rut?.setValidators(Validators.required);
      // razon_social obligatorio solo para B2B
      if (this.tipoCliente === 'B2B') {
        razonSocial?.setValidators(Validators.required);
      } else {
        razonSocial?.clearValidators();
        razonSocial?.setValue('');
      }
    } else {
      nombre?.clearValidators();
      rut?.clearValidators();
      razonSocial?.clearValidators();
    }

    nombre?.updateValueAndValidity();
    rut?.updateValueAndValidity();
    razonSocial?.updateValueAndValidity();
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';

    const { email, password, nombre, apellido, rut, razon_social } = this.form.value;

    const action$ = this.isLogin
      ? this.auth.login({ email, password })
      : this.auth.register({
          nombre, apellido, rut,
          razon_social: this.tipoCliente === 'B2B' ? razon_social : null,
          tipo_cliente: this.tipoCliente,
          email, password, rol: 'cliente'
        });

    action$.subscribe({
      next: () => {
        if (!this.isLogin) {
          this.auth.login({ email, password }).subscribe({
            next: () => this.router.navigate(['/productos']),
            error: (e) => { this.error = e.error?.message || 'Error'; this.loading = false; }
          });
        } else {
          this.router.navigate(['/productos']);
        }
      },
      error: (e) => { this.error = e.error?.message || 'Credenciales inválidas'; this.loading = false; }
    });
  }

  field(n: string) { return this.form.get(n); }
  invalid(n: string) { const f = this.field(n); return f?.invalid && f?.touched; }
}
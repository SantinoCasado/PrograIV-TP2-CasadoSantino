import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guards';
import { GuestGuard } from './core/guards/invitado.guard';

export const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "cargando"  // redirige a cargando al iniciar
  },
  {
    path: "cargando",
    loadComponent: () => import('./features/cargando/cargando').then((m) => m.Cargando)
  },
  {
    path: "log-in",
    canActivate: [GuestGuard], // si ya está logueado, va a publicaciones
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login)
  },
  {
    path: "registro",
    canActivate: [GuestGuard],
    loadComponent: () => import('./features/auth/pages/registro/registro').then((m) => m.Registro)
  },
  {
    path: "publicaciones",
    canActivate: [AuthGuard], // requiere token
    loadComponent: () => import('./features/publicaciones/publicaciones').then((m) => m.Publicaciones)
  },
  {
    path: "mi-perfil",
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/mi-perfil/mi-perfil').then((m) => m.MiPerfil)
  },
  {
    path: "**",
    loadComponent: () => import('./features/error/error').then((m) => m.Error)
  }
];
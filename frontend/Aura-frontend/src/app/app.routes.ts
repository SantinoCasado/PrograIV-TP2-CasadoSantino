import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guards';
import { GuestGuard } from './core/guards/invitado.guard';
import { AdminGuard } from './core/guards/admin.guard';

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
    path: 'publicaciones/:id',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/publicacion/publicacion').then(m => m.Publicacion)
  },
  {
    path: "mi-perfil",
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/mi-perfil/mi-perfil').then((m) => m.MiPerfil)
  },
  {
    path: "dashboard/dashboard-usuarios",
    canActivate: [AdminGuard],
    loadComponent: () => import('./features/dashboard/dashboard-usuarios/dashboard-usuarios').then((m) => m.DashboardUsuarios)
  },
  {
    path: "dashboard/dashboard-estadisticas",
    canActivate: [AdminGuard],
    loadComponent: () => import('./features/dashboard/dashboard-estadisticas/dashboard-estadisticas').then((m) => m.DashboardEstadisticas)
  },
  {
    path: "**",
    loadComponent: () => import('./features/error/error').then((m) => m.Error)
  }
];
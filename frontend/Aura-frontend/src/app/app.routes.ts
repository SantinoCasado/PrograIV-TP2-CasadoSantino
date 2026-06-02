import { Routes } from '@angular/router';

export const routes: Routes = [
	{
        path: "",
        pathMatch: "full",
        redirectTo: "log-in"
    },
	{
        path: "log-in",
		loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login)
	},
	{
		path: "registro",
		loadComponent: () => import('./features/auth/pages/registro/registro').then((m) => m.Registro)
	},
	{
		path: "publicaciones",
		loadComponent: () => import('./features/publicaciones/publicaciones').then((m) => m.Publicaciones)
	},
	{
		path: "mi-perfil",
		loadComponent: () => import('./features/mi-perfil/mi-perfil').then((m) => m.MiPerfil)
	},
	{
		path: "**",
		loadComponent: () => import('./features/error/error').then((m) => m.Error)
	}
];

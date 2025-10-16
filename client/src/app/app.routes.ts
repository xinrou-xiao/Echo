import { Routes } from '@angular/router';
import { HomePlaceholder } from './pages/home-placeholder/home-placeholder';
import { AuthPage } from './pages/auth/auth';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomePlaceholder,
    title: 'Echo · Find Your Match Today'
  },
  {
    path: 'auth',
    component: AuthPage,
    title: 'Echo · Login or Register'
  }
];

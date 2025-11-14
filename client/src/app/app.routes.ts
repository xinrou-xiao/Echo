import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { AuthPage } from './pages/auth/auth';
import { HomePlaceholder } from './pages/home-placeholder/home-placeholder';
import { MatchPage } from './pages/match/match';
import { ProfilePage } from './pages/profile/profile';
import { ChatPage } from './pages/chat/chat';
import { ViewProfilePage } from './pages/view_profile/view_profile';

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
  },
  {
    path: 'profile',
    component: ProfilePage,
    title: 'Echo · Complete Your Profile'
  },
  {
     path: 'view_profile/:id', 
     component: ViewProfilePage, 
     title: 'Echo · Profile' 
  },
  {
    path: 'match',
    component: MatchPage,
    title: 'Echo · Your Match Today',
    canActivate: [authGuard]
  },
  {
    path: 'chat',
    component: ChatPage,
    title: 'Echo · Messages',
    canActivate: [authGuard]
  }
];

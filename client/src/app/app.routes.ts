import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { AuthPage } from './pages/auth/auth';
import { HomePlaceholder } from './pages/home-placeholder/home-placeholder';
import { MatchPage } from './pages/match/match';
import { ProfilePage } from './pages/profile/profile';
import { ChatPage } from './pages/chat/chat';
/**For routing, we define our top-level page URLs in app.routes.ts.We have five routes:
the empty path '' for our Home page,/auth for the login and registration page,/profile for the profile page,
/match for the daily match page, and/chat for the messaging page.

The match and chat routes are protected with canActivate: [authGuard], 
so only authenticated users can access those pages.*/
/**We also support a parameterized route, /profile/:uid. The :uid lets us link directly to a specific user’s profile, 
 * and the component can read it through ActivatedRoute. */
//this routing setup keeps navigation clear and secure,
//letting users move smoothly between all the main pages of our app. 
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
    path: 'match',
    component: MatchPage,
    title: 'Echo · Your Match Today',
    canActivate: [authGuard]
  },
  {
    path: 'chat',
    component: ChatPage, //messageing page
    title: 'Echo · Messages',
    canActivate: [authGuard]
  }
];

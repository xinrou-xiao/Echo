import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { USER_STORAGE_KEY } from '../shared/constants/auth.constants';
import { AuthService } from '../shared/services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  const isLoggedIn =
    typeof window !== 'undefined' &&
    !!window.localStorage.getItem(USER_STORAGE_KEY);

  if (isLoggedIn) {
    return true;
  }

  auth.setPostLoginRedirect(state.url || '/');
  return router.createUrlTree(['/auth']);
};

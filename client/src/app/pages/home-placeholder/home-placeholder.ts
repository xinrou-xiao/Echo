import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-home-placeholder',
  standalone: true,
  templateUrl: './home-placeholder.html',
  styleUrl: './home-placeholder.css'
})
export class HomePlaceholder {
  constructor(
    private readonly router: Router,
    private readonly auth: AuthService
  ) {}

  protected async onMatchClick(): Promise<void> {
    if (this.auth.isLoggedIn()) {
      await this.router.navigate(['/match']);
      return;
    }

    this.auth.setPostLoginRedirect('/match');
    try {
      await this.auth.loginWithGoogle();
    } catch {
      await this.router.navigate(['/auth']);
    }
  }

  protected navigateToChat(): void {
    if (this.auth.isLoggedIn()) {
      void this.router.navigate(['/chat']);
      return;
    }

    this.auth.setPostLoginRedirect('/chat');

    if (typeof document !== 'undefined') {
      const loginButton = document.querySelector<HTMLElement>('[data-login-button]');
      if (loginButton) {
        loginButton.click();
        return;
      }
    }

    void this.router.navigate(['/auth']);
  }
}

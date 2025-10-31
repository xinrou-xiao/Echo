import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-home-placeholder',
  standalone: true,
  templateUrl: './home-placeholder.html',
  styleUrls: ['./home-placeholder.css'],
})
export class HomePlaceholder {
  constructor(
    private readonly router: Router,
    private readonly auth: AuthService
  ) {}

  async onMatchClick(): Promise<void> {
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
}

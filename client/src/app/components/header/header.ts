import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  constructor(
    protected readonly auth: AuthService,
    private readonly router: Router
  ) {}

  protected goToProfile(): void {
    void this.router.navigate(['/profile']);
  }

  protected async login(): Promise<void> {
    try {
      await this.auth.loginWithGoogle();
    } catch (error) {
      console.error(error);
    }
  }

  protected async logout(): Promise<void> {
    try {
      await this.auth.logout();
    } catch (error) {
      console.error(error);
    }
  }
}

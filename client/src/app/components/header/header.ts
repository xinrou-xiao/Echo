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
    const me = this.auth.profile();

    // if no user or no _id yet send them to the profile form
    if (!me || !me._id) {
      void this.router.navigate(['/profile']);
      return;
    }

    // otherwise send them to view_profile/:id to display profile data
    void this.router.navigate(['/view_profile', me._id]);
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

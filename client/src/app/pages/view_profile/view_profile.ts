import { CommonModule } from '@angular/common';
import { Component, inject, signal, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../shared/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-view-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view_profile.html',
  styleUrl: './view_profile.css'
})
export class ViewProfilePage {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);

  data = signal<any>(null);
  isOwner = signal(false);
  loading = signal(true);
  error = signal<string | null>(null);

  menuOpen = false;

  ngOnInit() {
    this.loadProfileData();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id') || '';
      this.loadProfileData(id);
    });
  }

  async loadProfileData(id?: string) {
    const profileId = id || this.route.snapshot.paramMap.get('id') || '';
    const me = this.auth.profile();

    this.isOwner.set(me?._id === profileId);
    this.loading.set(true);
    this.error.set(null);

    try {
      const res = await this.http
        .get<{ success: boolean; data?: any; message?: string }>(
          `${environment.apiUrl}/user/${profileId}`
        )
        .toPromise();

      if (!res?.success || !res.data) {
        throw new Error(res?.message || 'profile not found');
      }

      this.data.set(res.data);
    } catch (e: any) {
      this.error.set(e?.message || 'failed to load');
    } finally {
      this.loading.set(false);
    }
  }

  formatBirthday(raw: any): string {
    if (!raw) return '—';

    if (typeof raw === 'string') {
      const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) {
        const year = Number(m[1]);
        const monthIndex = Number(m[2]) - 1;
        const day = Number(m[3]);

        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthLabel = monthNames[monthIndex] ?? m[2];

        return `${monthLabel} ${day}, ${year}`;
      }
    }
    const d = new Date(raw);
    if (isNaN(d.getTime())) return String(raw);

    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }


  onUpdateProfile(): void {
    this.menuOpen = false;
    this.goEdit();
  }

  @HostListener('document:click')
  closeMenuOnOutsideClick(): void {
    this.menuOpen = false;
  }

  goEdit(): void {
    this.router.navigate(['/profile']);
  }
}

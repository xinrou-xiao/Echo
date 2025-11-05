import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../shared/services/auth.service';
import { environment } from '../../../environments/environment';

type MatchProfile = {
  name: string;
  age: number;
  gender: string;
  height: string;
  weight: string;
  bio: string;
  picUrl: string;
  [key: string]: any;
};

@Component({
  selector: 'app-match-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match.html',
  styleUrl: './match.css'
})
export class MatchPage {
  protected todayMatch: MatchProfile | null = null;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.getUserData();
  }

  getUserData() {
    const user = this.authService.profile();
    if (user && user.uid) {
      this.http.get(`${environment.apiUrl}/match/${user._id}`, { observe: 'response' })
        .subscribe({
          next: (response) => {
            if (response.status == 200) {
              const body = response.body as any;
              let matchedUser = body.data?.matchedUser;

              this.todayMatch = {
                name: matchedUser.name,
                age: this.calculateAge(matchedUser.birthday),
                gender: matchedUser.gender,
                height: `${matchedUser.height} cm`,
                weight: `${matchedUser.weight} kg`,
                bio: matchedUser.bio,
                picUrl: matchedUser.picUrl,

                ...matchedUser
              };

              console.log(this.todayMatch)
            }
          },
          error: (error) => {
            console.error('error:', error);
          }
        });
    } else {
      console.log('User not logging in');
    }
  }

  private calculateAge(birthday: string): number {
    if (!birthday) return 0;

    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  getDynamicFields(): string[] {
    if (!this.todayMatch) return [];

    const excludedFields = [
      'name', 'age', 'gender', 'height', 'weight', 'bio', 'picUrl', '_id', 'birthday', 'createdAt', 'updatedAt', '__v'
    ];
    return Object.keys(this.todayMatch).filter(key => !excludedFields.includes(key));
  }

  getDynamicField(fieldName: string): any {
    return this.todayMatch?.[fieldName];
  }

  hasDynamicField(fieldName: string): boolean {
    const value = this.todayMatch?.[fieldName];
    return value !== undefined && value !== null && value !== '';
  }

  formatFieldName(fieldName: string): string {
    const nameMap: { [key: string]: string } = {
      'vibe': 'Vibe',
      'music': 'Favorite Music Type',
      'movie': 'Favorite Movie Type',
      'weather': 'Favorite Weather',
      'friendQuality': 'MostValued Qualities in Match',
      'food': 'Comfort Food',
      'commonInterests': 'Interests',
      'state': 'State',
      'city': 'City'
    };
    return nameMap[fieldName] || fieldName;
  }

  formatFieldValue(fieldName: string, value: any): string {
    if (fieldName === 'commonInterests' && Array.isArray(value)) {
      return value.join('、');
    }
    return String(value);
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    const gender = this.todayMatch?.gender?.toLowerCase();

    if (gender === 'male') {
      imgElement.src = '/assets/images/avatar/male_default.jpg';
    } else if (gender === 'female') {
      imgElement.src = '/assets/images/avatar/female_default.jpg';
    } else {
      imgElement.src = '/assets/images/avatar/other_default.jpg';
    }
    imgElement.alt = 'Default image';
    this.cdr.detectChanges();
  }

  protected decision: 'like' | 'pass' | null = null;

  protected onLike(): void {
    this.decision = 'like';
  }

  protected onPass(): void {
    this.decision = 'pass';
  }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type MatchProfile = {
  name: string;
  age: number;
  gender: string;
  height: string;
  weight: string;
  bio: string;
  avatar: string;
};

@Component({
  selector: 'app-match-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match.html',
  styleUrl: './match.css'
})
export class MatchPage {
  protected readonly todayMatch: MatchProfile = {
    name: 'Alex Johnson',
    age: 28,
    gender: 'Male',
    height: '183 cm',
    weight: '75 kg',
    bio: 'Outdoor enthusiast, coffee lover, and amateur guitarist looking to share weekend adventures.',
    avatar: 'https://i.pravatar.cc/320?img=12'
  };

  protected decision: 'like' | 'pass' | null = null;

  protected onLike(): void {
    this.decision = 'like';
  }

  protected onPass(): void {
    this.decision = 'pass';
  }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type MatchProfile = {
  name: string;
  age: number;
  gender: string;
  location: string;
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
    age: 29,
    gender: 'Male',
    location: 'San Francisco, CA',
    avatar: 'https://i.pravatar.cc/320?img=12'
  };

  protected onLike(): void {
    console.log('You liked the match:', this.todayMatch.name);
  }

  protected onPass(): void {
    console.log('You passed on the match:', this.todayMatch.name);
  }
}

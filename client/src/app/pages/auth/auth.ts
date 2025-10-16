import { Component, signal } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [NgClass, NgIf],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class AuthPage {
  protected activeTab = signal<'login' | 'register'>('login');

  protected switchTab(tab: 'login' | 'register'): void {
    this.activeTab.set(tab);
  }

  protected isActive(tab: 'login' | 'register'): boolean {
    return this.activeTab() === tab;
  }
}

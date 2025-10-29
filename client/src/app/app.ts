import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, HttpClientModule],
  template: `
    <app-header></app-header>
    <router-outlet />
  `,
  styles: [
    `
      :host {
        display: block;
      }

      router-outlet {
        display: block;
      }
    `
  ]
})
export class App {
  protected readonly title = signal('client');
}

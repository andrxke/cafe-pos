// c:\Coding\OpenCafe\cafe-pos\frontend\src\app\app.component.ts
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <header class="toolbar">
        <div>
          <div class="badge">OpenCafe POS</div>
          <h1>Simple cafe operations console</h1>
        </div>
        <nav>
          <a routerLink="/order" routerLinkActive="active">Customer</a>
          <a routerLink="/barista" routerLinkActive="active">Barista</a>
          <a routerLink="/queue" routerLinkActive="active">Queue</a>
          <a routerLink="/admin" routerLinkActive="active">Admin</a>
        </nav>
      </header>

      <router-outlet></router-outlet>
    </div>
  `,
})
export class AppComponent {}


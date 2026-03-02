// c:\Coding\OpenCafe\cafe-pos\frontend\src\app\app.routes.ts
import { Routes } from '@angular/router';
import { AdminComponent } from './pages/admin/admin.component';
import { BaristaComponent } from './pages/barista/barista.component';
import { CustomerOrderComponent } from './pages/customer-order/customer-order.component';
import { QueueDisplayComponent } from './pages/queue-display/queue-display.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'order' },
  { path: 'order', component: CustomerOrderComponent },
  { path: 'barista', component: BaristaComponent },
  { path: 'queue', component: QueueDisplayComponent },
  { path: 'admin', component: AdminComponent },
];


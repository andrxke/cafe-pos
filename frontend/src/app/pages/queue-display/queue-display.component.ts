// c:\Coding\OpenCafe\cafe-pos\frontend\src\app\pages\queue-display\queue-display.component.ts
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { interval, map, startWith, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrderService } from '../../services/order.service';
import type { Order } from '../../core/types/api.types';

@Component({
  selector: 'app-queue-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="panel hero page-header">
      <h2>Queue Display</h2>
      <p class="muted">Read-only in-progress board refreshing every 10 seconds.</p>
    </section>

    <div class="grid three">
      <article class="panel card" *ngFor="let order of orders()">
        <div class="badge">Order #{{ order.id }}</div>
        <h3>{{ order.customer_name }}</h3>
        <p class="muted">Started {{ elapsedLabel(order) }}</p>
        <div class="stack">
          <div *ngFor="let item of order.items">{{ item.menu_item_name }} x {{ item.quantity }}</div>
        </div>
      </article>
    </div>
  `,
})
export class QueueDisplayComponent {
  private readonly orderService = inject(OrderService);
  private readonly destroyRef = inject(DestroyRef);

  readonly orders = signal<Order[]>([]);

  constructor() {
    interval(10000)
      .pipe(
        startWith(0),
        switchMap(() => this.orderService.getQueue()),
        map((orders) => orders.filter((order) => order.status === 'in_progress')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((orders) => this.orders.set(orders));
  }

  elapsedLabel(order: Order) {
    const minutes = order.elapsed_minutes ?? 0;
    return minutes <= 0 ? 'just now' : `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
}


// c:\Coding\OpenCafe\cafe-pos\frontend\src\app\pages\barista\barista.component.ts
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { interval, startWith, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrderService } from '../../services/order.service';
import type { Order, OrderStatus } from '../../core/types/api.types';

@Component({
  selector: 'app-barista',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  template: `
    <section class="panel hero page-header">
      <h2>Barista View</h2>
      <p class="muted">The queue refreshes every 5 seconds so staff can move drinks through the line.</p>
    </section>

    <div class="grid">
      <article class="panel card stack" *ngFor="let order of orders()">
        <div class="row" style="justify-content: space-between">
          <div>
            <h3>{{ order.customer_name }}</h3>
            <div class="muted">Placed {{ elapsedLabel(order) }}</div>
          </div>
          <div class="status" [class]="order.status">{{ order.status.replace('_', ' ') }}</div>
        </div>

        <div class="grid two">
          <div class="card">
            <strong>Items</strong>
            <div class="stack" style="margin-top: 0.5rem">
              <div class="row" style="justify-content: space-between" *ngFor="let item of order.items">
                <span>{{ item.menu_item_name }} x {{ item.quantity }}</span>
                <span>{{ item.subtotal | currency }}</span>
              </div>
            </div>
          </div>

          <div class="card stack">
            <strong>Comments</strong>
            <div class="muted" *ngIf="!order.comments.length">No comments yet.</div>
            <div *ngFor="let comment of order.comments">{{ comment.comment }}</div>
          </div>
        </div>

        <div class="row">
          <button
            class="btn secondary"
            (click)="advanceStatus(order)"
            [disabled]="order.status === 'completed' || order.status === 'cancelled'"
          >
            Advance Status
          </button>
          <span class="muted">Total {{ order.total_amount | currency }}</span>
        </div>

        <div class="field">
          <label>Add Comment</label>
          <input [(ngModel)]="commentDrafts[order.id]" placeholder="Extra hot, oat milk, call customer" />
        </div>
        <button class="btn" (click)="saveComment(order)">Save Comment</button>
      </article>
    </div>
  `,
})
export class BaristaComponent {
  private readonly orderService = inject(OrderService);
  private readonly destroyRef = inject(DestroyRef);

  readonly orders = signal<Order[]>([]);
  commentDrafts: Record<number, string> = {};

  constructor() {
    interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.orderService.getQueue()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((orders) => this.orders.set(orders));
  }

  elapsedLabel(order: Order) {
    const minutes = order.elapsed_minutes ?? 0;
    return minutes <= 0 ? 'just now' : `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  advanceStatus(order: Order) {
    const nextStatus: Record<OrderStatus, OrderStatus> = {
      pending: 'in_progress',
      in_progress: 'completed',
      completed: 'completed',
      cancelled: 'cancelled',
    };

    this.orderService.updateStatus(order.id, nextStatus[order.status]).subscribe(() => {
      this.refresh();
    });
  }

  saveComment(order: Order) {
    const comment = this.commentDrafts[order.id]?.trim();
    if (!comment) {
      return;
    }

    this.orderService.addComment(order.id, comment).subscribe(() => {
      this.commentDrafts[order.id] = '';
      this.refresh();
    });
  }

  private refresh() {
    this.orderService.getQueue().subscribe((orders) => this.orders.set(orders));
  }
}


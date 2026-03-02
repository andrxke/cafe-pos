// c:\Coding\OpenCafe\cafe-pos\frontend\src\app\pages\customer-order\customer-order.component.ts
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../services/menu.service';
import { OrderService } from '../../services/order.service';
import type { MenuItem } from '../../core/types/api.types';

@Component({
  selector: 'app-customer-order',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  template: `
    <section class="panel hero page-header">
      <h2>Customer View</h2>
      <p class="muted">Choose drinks and snacks, adjust quantities, then submit the order by customer name.</p>
    </section>

    <div class="grid two">
      <section class="panel" style="padding: 1.25rem">
        <div class="row" style="justify-content: space-between">
          <h3>Menu</h3>
          <span class="badge">{{ menuItems().length }} items</span>
        </div>
        <div class="grid three">
          <article class="card stack" *ngFor="let item of menuItems()">
            <div>
              <div class="row" style="justify-content: space-between">
                <strong>{{ item.name }}</strong>
                <span>{{ item.price | currency }}</span>
              </div>
              <div class="muted">{{ item.category }}</div>
              <p class="muted">{{ item.description || 'No description' }}</p>
            </div>
            <button class="btn" (click)="addToCart(item)" [disabled]="!item.is_available">
              {{ item.is_available ? 'Add to cart' : 'Unavailable' }}
            </button>
          </article>
        </div>
      </section>

      <section class="panel" style="padding: 1.25rem">
        <h3>Current Order</h3>
        <div class="field">
          <label for="customer-name">Customer Name</label>
          <input id="customer-name" [(ngModel)]="customerName" placeholder="Jamie" />
        </div>

        <div class="stack" style="margin-top: 1rem" *ngIf="cartItems().length; else emptyCart">
          <div class="card" *ngFor="let cartItem of cartItems()">
            <div class="row" style="justify-content: space-between">
              <strong>{{ cartItem.name }}</strong>
              <span>{{ cartItem.price * cartItem.quantity | currency }}</span>
            </div>
            <div class="row">
              <button class="btn secondary" (click)="changeQuantity(cartItem.id, -1)">-</button>
              <span>{{ cartItem.quantity }}</span>
              <button class="btn secondary" (click)="changeQuantity(cartItem.id, 1)">+</button>
            </div>
          </div>
        </div>

        <ng-template #emptyCart>
          <p class="muted">No items added yet.</p>
        </ng-template>

        <div class="row" style="justify-content: space-between; margin-top: 1rem">
          <strong>Total</strong>
          <strong>{{ orderTotal() | currency }}</strong>
        </div>

        <button class="btn" style="margin-top: 1rem; width: 100%" (click)="submitOrder()">
          Submit Order
        </button>

        <p class="muted" *ngIf="message()">{{ message() }}</p>
      </section>
    </div>
  `,
})
export class CustomerOrderComponent {
  private readonly menuService = inject(MenuService);
  private readonly orderService = inject(OrderService);

  readonly menuItems = signal<MenuItem[]>([]);
  readonly cartItems = signal<Array<MenuItem & { quantity: number }>>([]);
  readonly message = signal('');
  customerName = '';

  constructor() {
    this.loadMenu();
  }

  loadMenu() {
    this.menuService.getMenu().subscribe((items) => this.menuItems.set(items.filter((item) => item.is_available)));
  }

  addToCart(item: MenuItem) {
    const existing = this.cartItems().find((entry) => entry.id === item.id);
    if (existing) {
      this.changeQuantity(item.id, 1);
      return;
    }

    this.cartItems.update((items) => [...items, { ...item, quantity: 1 }]);
  }

  changeQuantity(id: number, delta: number) {
    this.cartItems.update((items) =>
      items
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0),
    );
  }

  orderTotal() {
    return this.cartItems().reduce((total, item) => total + item.price * item.quantity, 0);
  }

  submitOrder() {
    if (!this.customerName.trim() || this.cartItems().length === 0) {
      this.message.set('Add a customer name and at least one item.');
      return;
    }

    this.orderService
      .submitOrder({
        customer_name: this.customerName.trim(),
        items: this.cartItems().map((item) => ({ menu_item_id: item.id, quantity: item.quantity })),
      })
      .subscribe({
        next: () => {
          this.message.set('Order submitted successfully.');
          this.customerName = '';
          this.cartItems.set([]);
        },
        error: (error) => {
          this.message.set(error.error?.error ?? 'Unable to submit order.');
        },
      });
  }
}


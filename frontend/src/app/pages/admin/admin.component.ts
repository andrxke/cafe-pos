// c:\Coding\OpenCafe\cafe-pos\frontend\src\app\pages\admin\admin.component.ts
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AnalyticsService } from '../../services/analytics.service';
import { InventoryService } from '../../services/inventory.service';
import { MenuService } from '../../services/menu.service';
import { TransactionService } from '../../services/transaction.service';
import type {
  AnalyticsSummary,
  InventoryItem,
  MenuItem,
  TransactionRecord,
} from '../../core/types/api.types';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <section class="panel hero page-header">
      <h2>Admin View</h2>
      <p class="muted">Manage menu data, keep inventory up to date, and monitor daily performance.</p>
    </section>

    <section class="metrics" *ngIf="summary() as s">
      <article class="panel card">
        <div class="muted">Revenue Today</div>
        <div class="metric-value">{{ s.totalRevenue | currency }}</div>
      </article>
      <article class="panel card">
        <div class="muted">Orders Today</div>
        <div class="metric-value">{{ s.ordersToday }}</div>
      </article>
      <article class="panel card">
        <div class="muted">Low Stock Alerts</div>
        <div class="metric-value">{{ lowStockItems().length }}</div>
      </article>
    </section>

    <div class="grid" style="margin-top: 1.25rem">
      <section class="panel" style="padding: 1.25rem">
        <div class="row" style="justify-content: space-between">
          <h3>Menu Management</h3>
          <button class="btn secondary" (click)="addMenuItem()">Add Item</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Available</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of menuItems()">
                <td><input [(ngModel)]="item.name" /></td>
                <td>{{ item.category }}</td>
                <td><input type="number" step="0.01" [(ngModel)]="item.price" /></td>
                <td><input type="checkbox" [(ngModel)]="item.is_available" /></td>
                <td><button class="btn" (click)="saveMenuItem(item)">Save</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel" style="padding: 1.25rem">
        <h3>Inventory</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Stock</th>
                <th>Unit</th>
                <th>Threshold</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of inventory()" [class.low-stock]="item.is_low_stock">
                <td>{{ item.item_name }}</td>
                <td><input type="number" step="0.01" [(ngModel)]="item.quantity_in_stock" /></td>
                <td>{{ item.unit }}</td>
                <td>{{ item.low_stock_threshold }}</td>
                <td><button class="btn" (click)="saveInventory(item)">Update</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel" style="padding: 1.25rem">
        <h3>Top Selling Items</h3>
        <div class="card" *ngFor="let item of summary()?.topSellingItems ?? []">
          <div class="row" style="justify-content: space-between">
            <strong>{{ item.name }}</strong>
            <span>{{ item.quantity_sold }} sold</span>
          </div>
        </div>
      </section>

      <section class="panel" style="padding: 1.25rem">
        <h3>Low Stock Alerts</h3>
        <div class="card" *ngFor="let item of lowStockItems()">
          <div class="row" style="justify-content: space-between">
            <strong>{{ item.item_name }}</strong>
            <span>{{ item.quantity_in_stock }} {{ item.unit }}</span>
          </div>
        </div>
      </section>

      <section class="panel" style="padding: 1.25rem">
        <h3>Transaction Log</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let transaction of transactions()">
                <td>{{ transaction.order_id }}</td>
                <td>{{ transaction.customer_name }}</td>
                <td>{{ formatItems(transaction) }}</td>
                <td>{{ transaction.total_amount | currency }}</td>
                <td>{{ transaction.created_at | date: 'short' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
})
export class AdminComponent {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly inventoryService = inject(InventoryService);
  private readonly menuService = inject(MenuService);
  private readonly transactionService = inject(TransactionService);

  readonly summary = signal<AnalyticsSummary | null>(null);
  readonly menuItems = signal<MenuItem[]>([]);
  readonly inventory = signal<InventoryItem[]>([]);
  readonly transactions = signal<TransactionRecord[]>([]);
  readonly lowStockItems = signal<InventoryItem[]>([]);

  constructor() {
    this.loadAll();
  }

  loadAll() {
    forkJoin({
      summary: this.analyticsService.getSummary(),
      menu: this.menuService.getMenu(),
      inventory: this.inventoryService.getInventory(),
      transactions: this.transactionService.getTransactions(),
      lowStock: this.analyticsService.getLowStock(),
    }).subscribe(({ summary, menu, inventory, transactions, lowStock }) => {
      this.summary.set(summary);
      this.menuItems.set(menu);
      this.inventory.set(inventory);
      this.transactions.set(transactions);
      this.lowStockItems.set(lowStock);
    });
  }

  addMenuItem() {
    this.menuService
      .createMenuItem({
        name: 'New Item',
        description: '',
        price: 0,
        category: 'General',
        is_available: true,
      })
      .subscribe(() => this.loadAll());
  }

  saveMenuItem(item: MenuItem) {
    this.menuService
      .updateMenuItem(item.id, {
        name: item.name,
        price: Number(item.price),
        is_available: item.is_available,
      })
      .subscribe(() => this.loadAll());
  }

  saveInventory(item: InventoryItem) {
    this.inventoryService
      .updateInventory(item.id, Number(item.quantity_in_stock))
      .subscribe(() => this.loadAll());
  }

  formatItems(transaction: TransactionRecord) {
    return transaction.items.map((item) => `${item.menu_item_name} x ${item.quantity}`).join(', ');
  }
}


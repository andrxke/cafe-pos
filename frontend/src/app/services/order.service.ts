// c:\Coding\OpenCafe\cafe-pos\frontend\src\app\services\order.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../core/config/api.config';
import type { ApiResponse, Order, OrderStatus } from '../core/types/api.types';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);

  getOrders() {
    return this.http
      .get<ApiResponse<Order[]>>(`${API_BASE_URL}/orders`)
      .pipe(map((response) => response.data));
  }

  getQueue() {
    return this.http
      .get<ApiResponse<Order[]>>(`${API_BASE_URL}/orders/queue`)
      .pipe(map((response) => response.data));
  }

  submitOrder(payload: { customer_name: string; items: Array<{ menu_item_id: number; quantity: number }> }) {
    return this.http
      .post<ApiResponse<Order>>(`${API_BASE_URL}/orders`, payload)
      .pipe(map((response) => response.data));
  }

  updateStatus(id: number, status: OrderStatus) {
    return this.http
      .patch<ApiResponse<Order>>(`${API_BASE_URL}/orders/${id}/status`, { status })
      .pipe(map((response) => response.data));
  }

  addComment(id: number, comment: string) {
    return this.http
      .post<ApiResponse<unknown>>(`${API_BASE_URL}/orders/${id}/comments`, { comment })
      .pipe(map((response) => response.data));
  }
}


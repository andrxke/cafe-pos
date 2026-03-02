// c:\Coding\OpenCafe\cafe-pos\frontend\src\app\services\inventory.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../core/config/api.config';
import type { ApiResponse, InventoryItem } from '../core/types/api.types';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);

  getInventory() {
    return this.http
      .get<ApiResponse<InventoryItem[]>>(`${API_BASE_URL}/inventory`)
      .pipe(map((response) => response.data));
  }

  updateInventory(id: number, quantity_in_stock: number) {
    return this.http
      .patch<ApiResponse<InventoryItem>>(`${API_BASE_URL}/inventory/${id}`, { quantity_in_stock })
      .pipe(map((response) => response.data));
  }
}


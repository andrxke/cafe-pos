// c:\Coding\OpenCafe\cafe-pos\frontend\src\app\services\analytics.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../core/config/api.config';
import type { AnalyticsSummary, ApiResponse, InventoryItem } from '../core/types/api.types';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);

  getSummary() {
    return this.http
      .get<ApiResponse<AnalyticsSummary>>(`${API_BASE_URL}/analytics/summary`)
      .pipe(map((response) => response.data));
  }

  getLowStock() {
    return this.http
      .get<ApiResponse<InventoryItem[]>>(`${API_BASE_URL}/analytics/low-stock`)
      .pipe(map((response) => response.data));
  }
}


// c:\Coding\OpenCafe\cafe-pos\frontend\src\app\services\menu.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../core/config/api.config';
import type { ApiResponse, MenuItem } from '../core/types/api.types';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly http = inject(HttpClient);

  getMenu() {
    return this.http
      .get<ApiResponse<MenuItem[]>>(`${API_BASE_URL}/menu`)
      .pipe(map((response) => response.data));
  }

  createMenuItem(payload: Partial<MenuItem>) {
    return this.http
      .post<ApiResponse<MenuItem>>(`${API_BASE_URL}/menu`, payload)
      .pipe(map((response) => response.data));
  }

  updateMenuItem(id: number, payload: Partial<MenuItem>) {
    return this.http
      .patch<ApiResponse<MenuItem>>(`${API_BASE_URL}/menu/${id}`, payload)
      .pipe(map((response) => response.data));
  }
}


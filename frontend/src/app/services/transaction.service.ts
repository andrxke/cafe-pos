// c:\Coding\OpenCafe\cafe-pos\frontend\src\app\services\transaction.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { API_BASE_URL } from '../core/config/api.config';
import type { ApiResponse, TransactionRecord } from '../core/types/api.types';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly http = inject(HttpClient);

  getTransactions() {
    return this.http
      .get<ApiResponse<TransactionRecord[]>>(`${API_BASE_URL}/transactions`)
      .pipe(map((response) => response.data));
  }
}


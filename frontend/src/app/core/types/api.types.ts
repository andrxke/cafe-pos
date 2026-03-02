// c:\Coding\OpenCafe\cafe-pos\frontend\src\app\core\types\api.types.ts
export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: number;
  menu_item_id: number;
  quantity_in_stock: number;
  unit: string;
  low_stock_threshold: number;
  updated_at: string;
  item_name?: string;
  is_low_stock?: boolean;
}

export interface OrderItem {
  menu_item_id: number;
  menu_item_name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OrderComment {
  id: number;
  order_id: number;
  comment: string;
  created_at: string;
}

export interface Order {
  id: number;
  customer_name: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  updated_at: string;
  elapsed_minutes?: number;
  items: OrderItem[];
  comments: OrderComment[];
}

export interface TransactionRecord {
  id: number;
  order_id: number;
  total_amount: number;
  created_at: string;
  customer_name: string;
  items: Array<{
    menu_item_id: number;
    menu_item_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  ordersToday: number;
  topSellingItems: Array<{
    menu_item_id: number;
    name: string;
    quantity_sold: number;
  }>;
}


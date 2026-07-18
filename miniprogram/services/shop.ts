import { get, post } from '../utils/request';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export function listProducts() {
  return get<{ ok: true; items: Product[]; count: number }>('/api/shop/products');
}

export function getProduct(id: number | string) {
  return get<{ ok: true; item: Product }>(`/api/shop/products/${id}`);
}

export function exchangeProduct(itemId: number | string, quantity = 1) {
  return post<{
    ok: true;
    exchange: WechatMiniprogram.IAnyObject;
    points_spent: number;
    remaining_points: number;
  }>('/api/shop/exchange', { item_id: Number(itemId), quantity });
}

export function getExchangeHistory(limit = 50, offset = 0) {
  return get<{
    ok: true;
    exchanges: WechatMiniprogram.IAnyObject[];
    count: number;
    total: number;
  }>('/api/shop/exchange-history', { limit, offset });
}

export interface ProductType {
  id: string;
  name: string;
  displayName: string;
  image: string;
  description: string;
}

export interface Shape {
  id: string;
  name: string;
  displayName: string;
  image: string;
  description: string;
}

export interface Material {
  id: string;
  name: string;
  displayName: string;
  image: string;
  description: string;
  price: number;
}

export interface Size {
  id: string;
  name: string;
  displayName: string;
  width: number;
  height: number;
  price: number;
}

export interface Color {
  id: string;
  name: string;
  hex: string;
  displayName: string;
}

export interface OrderForm {
  productType: ProductType | null;
  shape: Shape | null;
  material: Material | null;
  size: Size | null;
  color: Color | null;
  quantity: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  additionalNotes: string;
}

export interface OrderStep {
  id: string;
  name: string;
  isCompleted: boolean;
  isActive: boolean;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
} 
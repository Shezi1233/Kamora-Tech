export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: string | number | null;
  delivery_estimate: string | null;
  features: string | null;
  technologies: string | null;
  image: string | null;
  is_active: number;
  is_featured: number;
  created_at?: string;
  updated_at?: string;
  category_name?: string;
}

export interface ServiceImage {
  id: number;
  service_id: number;
  image_path: string;
  sort_order: number;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: number;
  created_at?: string;
}

export interface Admin {
  id: number;
  full_name: string;
  email: string;
  is_active: number;
}

export interface CartLine extends Service {
  quantity: number;
  item_id: number;
}

export interface Order {
  id: number;
  user_id: number;
  tracking_id: string;
  status: string;
  payment_status: string;
  subtotal: string | number;
  discount: string | number;
  total: string | number;
  coupon_code: string | null;
  company: string | null;
  requirements: string | null;
  notes: string | null;
  internal_note?: string | null;
  expected_completion: string | null;
  created_at: string;
  updated_at?: string;
  full_name?: string;
  email?: string;
  phone?: string | null;
}

export interface OrderItem {
  id: number;
  order_id: number;
  service_id: number | null;
  service_title: string;
  unit_price: string | number | null;
  quantity: number;
  line_total: string | number;
  created_at?: string;
}

export interface StatusHistory {
  id: number;
  order_id: number;
  previous_status: string | null;
  new_status: string;
  customer_note: string | null;
  admin_id: number | null;
  created_at: string;
  admin_name?: string | null;
}

export interface Payment {
  id: number;
  order_id: number;
  method: string;
  amount: string | number;
  status: string;
  reference: string | null;
  created_at: string;
  tracking_id?: string;
  order_total?: string | number;
  customer?: string;
}

export interface PortfolioProject {
  id: number;
  title: string;
  category: string | null;
  description: string | null;
  image: string | null;
  project_url: string | null;
  is_featured: number;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

export interface Testimonial {
  id: number;
  client_name: string;
  client_role: string | null;
  quote: string;
  is_approved: number;
  created_at?: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: "new" | "read" | "archived";
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number | null;
  admin_id: number | null;
  type: string;
  message: string;
  is_read: number;
  created_at: string;
}

export interface OrderWithCustomer extends Order {
  full_name: string;
  email: string;
}

export type ActionResult = {
  ok?: boolean;
  error?: string;
  success?: string;
  resetLink?: string;
};

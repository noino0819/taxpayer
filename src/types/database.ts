export type UserRole = 'teacher' | 'student'
export type EconomyMode = 'auto' | 'semi' | 'manual'
export type TransactionType = 'income' | 'expense'
export type TransactionCategory =
  | 'salary'
  | 'investment'
  | 'interest'
  | 'business'
  | 'bonus'
  | 'other_income'
  | 'tax'
  | 'consumption'
  | 'fine'
  | 'rent'
  | 'insurance'
  | 'other_expense'
export type JobType = 'required' | 'optional' | 'custom'
export type CreditGrade = 1 | 2 | 3 | 4 | 5
export type RentType = 'jeonse' | 'wolse'
export type SavingsType = 'simple' | 'compound'
export type InsurancePaymentType = 'lump' | 'monthly'
export type ModuleStatus = 'on' | 'off'

export interface User {
  id: string
  email: string | null
  name: string
  role: UserRole
  pin: string | null
  avatar_preset_id: string | null
  created_at: string
}

export interface Classroom {
  id: string
  name: string
  school: string
  grade: number
  class_num: string
  semester: number
  teacher_id: string
  currency_name: string
  currency_unit: string
  currency_ratio: number
  initial_balance: number
  invite_code: string
  economy_mode: EconomyMode
  status: 'active' | 'archived'
  semester_start: string | null
  semester_end: string | null
  created_at: string
}

export interface Membership {
  id: string
  user_id: string
  classroom_id: string
  joined_at: string
  status: 'active' | 'inactive' | 'pending'
  user?: User
}

export interface Account {
  id: string
  user_id: string
  classroom_id: string
  balance: number
  credit_score: number
  credit_grade: CreditGrade
  created_at: string
}

export interface Transaction {
  id: string
  account_id: string
  type: TransactionType
  category: TransactionCategory
  amount: number
  description: string
  counterpart_id: string | null
  approved_by: string | null
  created_at: string
}

export interface Job {
  id: string
  classroom_id: string
  name: string
  type: JobType
  description: string
  salary: number
  max_count: number
  qualifications: string | null
  is_active: boolean
  created_at: string
}

export interface JobAssignment {
  id: string
  job_id: string
  user_id: string
  assigned_at: string
  status: 'active' | 'inactive'
  job?: Job
  user?: User
}

export interface Product {
  id: string
  classroom_id: string
  store_id: string
  name: string
  price: number
  stock: number
  image_url: string | null
  category: string
  created_at: string
}

export interface Store {
  id: string
  classroom_id: string
  owner_id: string
  name: string
  type: 'official' | 'student'
  status: 'open' | 'closed'
  created_at: string
}

export interface Seat {
  id: string
  classroom_id: string
  position_row: number
  position_col: number
  label: string
  owner_id: string | null
  resident_id: string | null
  price: number
  rent_price: number
  rent_type: RentType
  created_at: string
}

export interface Stock {
  id: string
  classroom_id: string
  name: string
  current_price: number
  previous_price: number
  description: string
  factor_type: string
  is_active: boolean
  created_at: string
}

export interface StockTransaction {
  id: string
  stock_id: string
  user_id: string
  type: 'buy' | 'sell'
  quantity: number
  price: number
  created_at: string
}

export interface Insurance {
  id: string
  classroom_id: string
  name: string
  description: string
  premium: number
  payout: number
  condition: string
  payment_type: InsurancePaymentType
  is_active: boolean
  created_at: string
}

export interface InsuranceContract {
  id: string
  insurance_id: string
  user_id: string
  status: 'active' | 'claimed' | 'cancelled'
  contracted_at: string
}

export interface SavingsProduct {
  id: string
  classroom_id: string
  name: string
  interest_rate: number
  type: SavingsType
  min_term_days: number
  conditions: string | null
  is_active: boolean
  created_at: string
}

export interface SavingsAccount {
  id: string
  product_id: string
  user_id: string
  principal: number
  started_at: string
  maturity_at: string
  status: 'active' | 'matured' | 'withdrawn'
}

export interface Fine {
  id: string
  classroom_id: string
  offender_id: string
  reporter_id: string
  reason: string
  amount: number
  approved_by: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface Notification {
  id: string
  classroom_id: string
  user_id: string | null
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export interface ModuleConfig {
  id: string
  classroom_id: string
  module_name: string
  is_enabled: boolean
  settings_json: Record<string, unknown>
  updated_at: string
}

export interface AvatarPreset {
  id: string
  category: 'animal' | 'character' | 'job' | 'color'
  name: string
  emoji: string
  sort_order: number
}

export type ModuleName =
  | 'job'
  | 'mart'
  | 'real_estate'
  | 'investment'
  | 'insurance'
  | 'bank'
  | 'credit'
  | 'tax'
  | 'fine'
  | 'notification'
  | 'achievement'
  | 'quiz'

/**
 * Payment Methods & Bank Presets
 * Modularized from Pocket Winnie Core
 */

// ── PAYMENT METHODS ───────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'mae_scan', name: 'Maybank (MAE / QR)', icon: '🐯', bank: 'Maybank' },
  { id: 'tng_qr', name: 'Touch \'n Go eWallet', icon: '💙', bank: 'TNG' },
  { id: 'shopeepay', name: 'ShopeePay', icon: '🛍️', bank: 'Shopee' },
  { id: 'cimb', name: 'CIMB Bank (Octo)', icon: '🔴', bank: 'CIMB' },
  { id: 'public_bank', name: 'Public Bank (PBe)', icon: '🏛️', bank: 'Public Bank' },
  { id: 'rhb', name: 'RHB Bank', icon: '🔵', bank: 'RHB' },
  { id: 'hlb', name: 'Hong Leong Bank', icon: '🏢', bank: 'Hong Leong' },
  { id: 'ambank', name: 'AmBank', icon: '🟡', bank: 'AmBank' },
  { id: 'bank_islam', name: 'Bank Islam', icon: '🕌', bank: 'Bank Islam' },
  { id: 'bank_rakyat', name: 'Bank Rakyat', icon: '🔷', bank: 'Bank Rakyat' },
  { id: 'bsn', name: 'BSN Bank', icon: '🟦', bank: 'BSN' },
  { id: 'gxbank', name: 'GXBank (Digital)', icon: '🟣', bank: 'GXBank' },
  { id: 'boost_bank', name: 'Boost Bank / eWallet', icon: '🚀', bank: 'Boost' },
  { id: 'aeon_bank', name: 'AEON Bank', icon: '🛍️', bank: 'AEON' },
  { id: 'affin', name: 'Affin Bank', icon: '🔴', bank: 'Affin' },
  { id: 'alliance', name: 'Alliance Bank', icon: '🔵', bank: 'Alliance' },
  { id: 'uob', name: 'UOB Malaysia', icon: '🌐', bank: 'UOB' },
  { id: 'ocbc', name: 'OCBC Malaysia', icon: '⛵', bank: 'OCBC' },
  { id: 'hsbc', name: 'HSBC Malaysia', icon: '🔺', bank: 'HSBC' },
  { id: 'scb', name: 'Standard Chartered', icon: '🌿', bank: 'Standard Chartered' },
  { id: 'bigpay', name: 'BigPay', icon: '💳', bank: 'BigPay' },
  { id: 'setel', name: 'Setel (Petronas)', icon: '⛽', bank: 'Setel' },
  { id: 'credit_card', name: 'Credit Card', icon: '💳', bank: 'Card' },
  { id: 'debit_card', name: 'Debit Card', icon: '💳', bank: 'Card' },
  { id: 'fpx', name: 'Online Banking (FPX / DuitNow)', icon: '🌐', bank: 'FPX' },
  { id: 'cash', name: 'Cash (现金)', icon: '💵', bank: 'Cash' },
  { id: 'bnpl', name: 'SPayLater / Atome / BNPL', icon: '⏱️', bank: 'BNPL' }
];

// ── MALAYSIAN PRESETS (COMMERCIAL BANKS & WALLETS) ────
const MY_BANKS = [
  { name: 'Maybank (MAE)', icon: '🐯', color: '#ffc800', type: 'bank' },
  { name: 'CIMB Bank', icon: '🔴', color: '#dc2626', type: 'bank' },
  { name: 'Public Bank', icon: '🏛️', color: '#b91c1c', type: 'bank' },
  { name: 'RHB Bank', icon: '🔵', color: '#0284c7', type: 'bank' },
  { name: 'Hong Leong Bank', icon: '🏢', color: '#be123c', type: 'bank' },
  { name: 'AmBank', icon: '🟡', color: '#e11d48', type: 'bank' },
  { name: 'Bank Rakyat', icon: '🔷', color: '#1d4ed8', type: 'bank' },
  { name: 'BSN Bank', icon: '🟦', color: '#0d9488', type: 'bank' },
  { name: 'GXBank (Digital)', icon: '🟣', color: '#7c3aed', type: 'bank' },
  { name: 'Boost Bank', icon: '🚀', color: '#f43f5e', type: 'bank' },
  { name: 'AEON Bank', icon: '🛍️', color: '#a21caf', type: 'bank' },
  { name: 'Affin Bank', icon: '🔴', color: '#1e3a8a', type: 'bank' },
  { name: 'Alliance Bank', icon: '🔵', color: '#2563eb', type: 'bank' },
  { name: 'UOB Malaysia', icon: '🌐', color: '#1e40af', type: 'bank' },
  { name: 'OCBC Malaysia', icon: '⛵', color: '#ef4444', type: 'bank' },
  { name: 'HSBC Malaysia', icon: '🔺', color: '#e11d48', type: 'bank' },
  { name: 'Standard Chartered', icon: '🌿', color: '#059669', type: 'bank' },
  { name: 'Agrobank', icon: '🌾', color: '#16a34a', type: 'bank' }
];

const MY_EWALLETS = [
  { name: "Touch 'n Go eWallet", icon: '💙', color: '#0284c7', type: 'ewallet' },
  { name: 'ShopeePay', icon: '🟠', color: '#ea580c', type: 'ewallet' },
  { name: 'Boost eWallet', icon: '🔴', color: '#e11d48', type: 'ewallet' },
  { name: 'MAE by Maybank', icon: '🟡', color: '#f59e0b', type: 'ewallet' },
  { name: 'BigPay', icon: '💳', color: '#06b6d4', type: 'ewallet' },
  { name: 'Setel (Petronas)', icon: '⛽', color: '#3b82f6', type: 'ewallet' },
  { name: 'FavePay', icon: '💖', color: '#ec4899', type: 'ewallet' },
  { name: 'Merchantrade Money', icon: '💱', color: '#8b5cf6', type: 'ewallet' },
  { name: 'Lazada Wallet', icon: '💜', color: '#6366f1', type: 'ewallet' }
];

const MY_CUSTOM = [
  { name: 'Cash Wallet', icon: '💵', color: '#10b981', type: 'cash' },
  { name: 'Credit Card', icon: '💳', color: '#6366f1', type: 'credit' },
  { name: 'Fixed Deposit / Savings', icon: '🏦', color: '#059669', type: 'savings' },
  { name: 'Emergency Fund', icon: '🛡️', color: '#f59e0b', type: 'savings' }
];

export function formatInr(amount: number, compact = false) {
  if (compact) {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`
  }
  return `₹${amount.toLocaleString('en-IN')}`
}

export const paymentMethods = ['UPI', 'Card', 'Netbanking', 'Wallet', 'EMI'] as const

export const mockPayments = [
  { id: 'TXN-4821', student: 'Aarav Kapoor', batch: 'JEE-2026 A', amount: 12400, method: 'UPI' as const, status: 'completed' as const, time: '2 min ago' },
  { id: 'TXN-4820', student: 'Priya Sharma', batch: 'NEET Crash', amount: 8200, method: 'Card' as const, status: 'completed' as const, time: '8 min ago' },
  { id: 'TXN-4819', student: 'Rohan Mehta', batch: 'CBSE XI', amount: 15600, method: 'UPI' as const, status: 'pending' as const, time: '15 min ago' },
  { id: 'TXN-4818', student: 'Sneha Reddy', batch: 'Foundation', amount: 6800, method: 'Netbanking' as const, status: 'completed' as const, time: '22 min ago' },
  { id: 'TXN-4817', student: 'Vikram Singh', batch: 'JEE-2026 A', amount: 9200, method: 'UPI' as const, status: 'failed' as const, time: '35 min ago' },
  { id: 'TXN-4816', student: 'Ananya Iyer', batch: 'NEET Crash', amount: 11000, method: 'Wallet' as const, status: 'completed' as const, time: '1 hr ago' },
]

export const mockBatches = [
  { id: 'BAT-001', name: 'JEE-2026 A', course: 'JEE Advanced', students: 142, capacity: 160, fee: 180000, status: 'active' as const },
  { id: 'BAT-002', name: 'NEET Crash', course: 'NEET Preparation', students: 98, capacity: 120, fee: 95000, status: 'active' as const },
  { id: 'BAT-003', name: 'CBSE XI', course: 'CBSE Science', students: 210, capacity: 240, fee: 72000, status: 'active' as const },
  { id: 'BAT-004', name: 'Foundation', course: 'Class IX-X', students: 86, capacity: 100, fee: 54000, status: 'active' as const },
  { id: 'BAT-005', name: 'JEE-2025 B', course: 'JEE Mains', students: 64, capacity: 80, fee: 120000, status: 'closed' as const },
]

export const mockInvoices = [
  { id: 'INV-2401', student: 'Aarav Kapoor', batch: 'JEE-2026 A', amount: 18000, due: '2026-05-25', status: 'overdue' as const },
  { id: 'INV-2402', student: 'Priya Sharma', batch: 'NEET Crash', amount: 9500, due: '2026-06-01', status: 'due' as const },
  { id: 'INV-2403', student: 'Rohan Mehta', batch: 'CBSE XI', amount: 7200, due: '2026-05-18', status: 'paid' as const },
  { id: 'INV-2404', student: 'Sneha Reddy', batch: 'Foundation', amount: 5400, due: '2026-06-10', status: 'due' as const },
  { id: 'INV-2405', student: 'Vikram Singh', batch: 'JEE-2026 A', amount: 18000, due: '2026-05-12', status: 'overdue' as const },
]

export const mockNotifications = [
  { id: '1', title: 'Fee reminder sent', message: '286 students received overdue fee reminders via SMS & email.', channel: 'SMS + Email', time: '10 min ago', status: 'sent' as const },
  { id: '2', title: 'Payment received', message: '₹12,400 collected from Aarav Kapoor (JEE-2026 A).', channel: 'In-app', time: '2 min ago', status: 'sent' as const },
  { id: '3', title: 'Batch capacity alert', message: 'JEE-2026 A is at 89% capacity. Consider opening a new section.', channel: 'In-app', time: '1 hr ago', status: 'sent' as const },
  { id: '4', title: 'Settlement processed', message: 'T+1 settlement of ₹4.2 L credited to your bank account.', channel: 'Email', time: 'Yesterday', status: 'sent' as const },
  { id: '5', title: 'Draft: Parent meet invite', message: 'Scheduled parent-teacher meeting for June batch students.', channel: 'WhatsApp', time: 'Draft', status: 'draft' as const },
]

export const mockBranches = [
  { id: 'BR-01', name: 'Main Campus', city: 'Mumbai', students: 420, staff: 28, status: 'active' as const },
  { id: 'BR-02', name: 'Andheri West', city: 'Mumbai', students: 186, staff: 12, status: 'active' as const },
  { id: 'BR-03', name: 'Pune Center', city: 'Pune', students: 142, staff: 9, status: 'active' as const },
  { id: 'BR-04', name: 'Thane Extension', city: 'Thane', students: 0, staff: 2, status: 'setup' as const },
]

export const reportChartData = [
  { month: 'Jan', collections: 820000, overdue: 120000 },
  { month: 'Feb', collections: 940000, overdue: 98000 },
  { month: 'Mar', collections: 1100000, overdue: 86000 },
  { month: 'Apr', collections: 980000, overdue: 142000 },
  { month: 'May', collections: 1240000, overdue: 78000 },
  { month: 'Jun', collections: 890000, overdue: 95000 },
]

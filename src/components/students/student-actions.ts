import {
  Bell,
  Copy,
  History,
  Link2,
  Mail,
  PanelRightOpen,
  Pencil,
  Phone,
  Trash2,
  UserCheck,
  UserMinus,
} from 'lucide-react'
import type { CollectionActionItem } from '@/components/courses/CollectionActionsMenu'
import type { StudentRow } from '@/components/dashboard/StudentDataTable'

export const studentActionIcons = {
  view: PanelRightOpen,
  edit: Pencil,
  paymentLink: Link2,
  paymentHistory: History,
  copyEmail: Mail,
  copyPhone: Phone,
  copyRoll: Copy,
  deactivate: UserMinus,
  reactivate: UserCheck,
  delete: Trash2,
}

export function buildStudentMenuItems(
  student: StudentRow,
  handlers: {
    onView: () => void
    onPaymentHistory?: () => void
    onEdit: () => void
    onSendPaymentLink: () => void
    onSendReminder?: () => void
    onCopyEmail?: () => void
    onCopyPhone?: () => void
    onCopyRoll?: () => void
    onDeactivate?: () => void
    onReactivate?: () => void
    onDelete?: () => void
  },
): CollectionActionItem[] {
  const inactive = student.accountStatus === 'inactive'
  const items: CollectionActionItem[] = [
    { id: 'view', label: 'View profile', icon: studentActionIcons.view, onClick: handlers.onView },
    {
      id: 'history',
      label: 'Payment history',
      icon: studentActionIcons.paymentHistory,
      onClick: handlers.onPaymentHistory ?? handlers.onView,
    },
    { id: 'edit', label: 'Edit student', icon: studentActionIcons.edit, onClick: handlers.onEdit },
    {
      id: 'pay',
      label: 'Send payment link',
      icon: studentActionIcons.paymentLink,
      onClick: handlers.onSendPaymentLink,
      disabled: inactive,
    },
  ]

  if (handlers.onSendReminder) {
    items.push({
      id: 'remind',
      label: 'Send fee reminder',
      icon: Bell,
      onClick: handlers.onSendReminder,
      disabled: inactive,
    })
  }

  if (student.email && handlers.onCopyEmail) {
    items.push({
      id: 'email',
      label: 'Copy email',
      icon: studentActionIcons.copyEmail,
      onClick: handlers.onCopyEmail,
    })
  }

  if (student.phone && handlers.onCopyPhone) {
    items.push({
      id: 'phone',
      label: 'Copy phone',
      icon: studentActionIcons.copyPhone,
      onClick: handlers.onCopyPhone,
    })
  }

  if (handlers.onCopyRoll) {
    items.push({
      id: 'roll',
      label: 'Copy roll no.',
      icon: studentActionIcons.copyRoll,
      onClick: handlers.onCopyRoll,
    })
  }

  if (inactive && handlers.onReactivate) {
    items.push({
      id: 'reactivate',
      label: 'Reactivate student',
      icon: studentActionIcons.reactivate,
      onClick: handlers.onReactivate,
    })
  } else if (handlers.onDeactivate) {
    items.push({
      id: 'deactivate',
      label: 'Deactivate',
      icon: studentActionIcons.deactivate,
      onClick: handlers.onDeactivate,
    })
  }

  if (handlers.onDelete) {
    const hasPayments = student.feesPaid > 0
    items.push({
      id: 'delete',
      label: hasPayments ? 'Delete student (has payments)' : 'Delete student',
      icon: studentActionIcons.delete,
      onClick: handlers.onDelete,
      destructive: true,
      disabled: hasPayments,
    })
  }

  return items
}

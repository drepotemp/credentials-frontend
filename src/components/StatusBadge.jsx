const LABELS = {
  pending: { text: '🟡 Pending', className: 'badge-pending' },
  approved: { text: '✅ Approved', className: 'badge-approved' },
  rejected: { text: '❌ Rejected', className: 'badge-rejected' },
};

export default function StatusBadge({ status }) {
  const info = LABELS[status] || LABELS.pending;
  return <span className={`badge ${info.className}`}>{info.text}</span>;
}

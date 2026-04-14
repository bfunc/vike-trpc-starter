type Props = {
  title: string;
  message: string;
  confirmLabel?: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', isLoading, onConfirm, onCancel }: Props) {
  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.message}>{message}</p>
        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
          <button style={styles.confirmBtn} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Loading…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  },
  modal: {
    background: '#fff', borderRadius: 8, padding: 32, minWidth: 360, maxWidth: 480,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#1a1a1a' },
  message: { fontSize: 14, color: '#555', marginBottom: 24, lineHeight: 1.6 },
  actions: { display: 'flex', gap: 12, justifyContent: 'flex-end' },
  cancelBtn: {
    padding: '8px 20px', borderRadius: 6, border: '1px solid #d1d5db',
    background: '#fff', cursor: 'pointer', fontSize: 14
  },
  confirmBtn: {
    padding: '8px 20px', borderRadius: 6, border: 'none',
    background: '#dc2626', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600
  }
};

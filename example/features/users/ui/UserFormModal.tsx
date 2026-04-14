import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { trpc } from '$src/trpc/client';
import type { User } from '$src/features/users/schema';

type Props = {
  mode: 'create' | 'edit';
  user?: User;
  onClose: () => void;
  onSuccess: () => void;
};

export default function UserFormModal({ mode, user, onClose, onSuccess }: Props) {
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [role, setRole] = useState<'admin' | 'editor' | 'viewer'>(user?.role ?? 'viewer');
  const [department, setDepartment] = useState(user?.department ?? '');
  const [isActive, setIsActive] = useState(user?.is_active ?? true);
  const [serverError, setServerError] = useState<string | null>(null);

  const createMutation = useMutation({
    ...trpc.users.create.mutationOptions(),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: err => setServerError(err.message)
  });

  const updateMutation = useMutation({
    ...trpc.users.update.mutationOptions(),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: err => setServerError(err.message)
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    if (mode === 'create') {
      createMutation.mutate({
        name,
        email,
        role,
        department: department.trim() || undefined,
        is_active: isActive
      });
    } else if (user) {
      updateMutation.mutate({
        id: user.id,
        name,
        email,
        role,
        department: department.trim() || null,
        is_active: isActive
      });
    }
  }

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>{mode === 'create' ? 'New User' : 'Edit User'}</h2>
          <button style={styles.closeBtn} onClick={onClose} disabled={isPending}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Name *
            <input
              style={styles.input}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              minLength={1}
              maxLength={200}
            />
          </label>

          <label style={styles.label}>
            Email *
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              maxLength={320}
            />
          </label>

          <label style={styles.label}>
            Role *
            <select style={styles.input} value={role} onChange={e => setRole(e.target.value as typeof role)}>
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <label style={styles.label}>
            Department
            <input
              style={styles.input}
              type="text"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              maxLength={200}
              placeholder="Optional"
            />
          </label>

          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
            />
            Active
          </label>

          {serverError && (
            <p style={styles.error}>{serverError}</p>
          )}

          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose} disabled={isPending}>
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn} disabled={isPending}>
              {isPending ? 'Saving…' : mode === 'create' ? 'Create User' : 'Save Changes'}
            </button>
          </div>
        </form>
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
    background: '#fff', borderRadius: 8, padding: 32, width: 480,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#888' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  label: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 500, color: '#374151' },
  input: {
    padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6,
    fontSize: 14, outline: 'none', marginTop: 2
  },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  error: { color: '#dc2626', fontSize: 13, background: '#fef2f2', padding: '8px 12px', borderRadius: 6 },
  actions: { display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 },
  cancelBtn: {
    padding: '8px 20px', borderRadius: 6, border: '1px solid #d1d5db',
    background: '#fff', cursor: 'pointer', fontSize: 14
  },
  submitBtn: {
    padding: '8px 20px', borderRadius: 6, border: 'none',
    background: '#1e293b', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600
  }
};

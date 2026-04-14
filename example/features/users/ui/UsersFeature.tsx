import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { trpc } from '$src/trpc/client';
import type { User } from '$src/features/users/schema';
import UsersGrid from './UsersGrid';
import UserFormModal from './UserFormModal';
import ConfirmModal from '$src/components/ui/ConfirmModal';

type ModalMode = 'create' | 'edit' | null;

export default function UsersFeature() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery(
    trpc.users.list.queryOptions({ limit: 500 })
  );

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  function refetchUsers() {
    queryClient.refetchQueries(trpc.users.list.queryFilter());
  }

  const deleteMutation = useMutation({
    ...trpc.users.delete.mutationOptions(queryClient),
    onSuccess: () => {
      refetchUsers();
      setDeleteTarget(null);
    }
  });

  function handleEdit(user: User) {
    setSelectedUser(user);
    setModalMode('edit');
  }

  function handleDelete(user: User) {
    setDeleteTarget(user);
  }

  function handleModalClose() {
    setModalMode(null);
    setSelectedUser(null);
  }

  return (
    <div>
      <div style={styles.toolbar}>
        <h1 style={styles.heading}>Users</h1>
        <button style={styles.newBtn} onClick={() => { setSelectedUser(null); setModalMode('create'); }}>
          + New User
        </button>
      </div>

      {isLoading && <p style={styles.status}>Loading users…</p>}

      {isError && (
        <p style={styles.errorMsg}>
          Failed to load users: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      )}

      {!isLoading && !isError && (
        <UsersGrid
          users={data ?? []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {modalMode !== null && (
        <UserFormModal
          mode={modalMode}
          user={modalMode === 'edit' && selectedUser ? selectedUser : undefined}
          onClose={handleModalClose}
          onSuccess={refetchUsers}
        />
      )}

      {deleteTarget !== null && (
        <ConfirmModal
          title="Delete User"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate({ id: deleteTarget.id })}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  heading: { fontSize: 24, fontWeight: 700 },
  newBtn: {
    padding: '9px 20px',
    background: '#1e293b',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600
  },
  status: { color: '#6b7280', fontSize: 14 },
  errorMsg: {
    color: '#dc2626',
    background: '#fef2f2',
    padding: '12px 16px',
    borderRadius: 6,
    fontSize: 14
  }
};

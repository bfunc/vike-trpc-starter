import { startTransition, useDeferredValue, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import ConfirmModal from '$src/components/ui/ConfirmModal';
import { queryClient, trpc } from '$src/trpc/client';
import type { User, UserRole } from '../schema';
import UserFormModal from './UserFormModal';
import UsersGrid from './UsersGrid';
import './users-feature.css';
type StatusFilter = 'all' | 'active' | 'inactive';

export default function UsersFeature() {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const listInput = {
    role:  undefined,
    is_active: undefined,
    limit: 500,
    offset: 0
  };

  const usersQuery = useQuery(
    trpc.users.list.queryOptions(listInput, {
      staleTime: 30_000
    })
  );

  const deleteMutation = useMutation(
    trpc.users.delete.mutationOptions({
      onSuccess: async () => {
        setDeleteTarget(null);
        await queryClient.refetchQueries(trpc.users.list.queryFilter());
      }
    })
  );

  const users = usersQuery.data ?? [];
  const activeUsers = users.filter(user => user.is_active).length;
  const adminUsers = users.filter(user => user.role === 'admin').length;

  async function handleFormSuccess() {
    setIsCreateOpen(false);
    setEditingUser(null);
  }

  return (
    <section className="users-page">
      <header className="users-hero">
        <div className="users-heading">
          <h1>Users</h1>
          <p className="users-hero__copy">
            Manage access, keep contact details current, and review who is active across the organization.
          </p>
        </div>

        <div className="users-hero__actions">
          <button type="button" className="users-button users-button--primary" onClick={() => setIsCreateOpen(true)}>
            New user
          </button>
        </div>
      </header>

      <div className="users-stats">
        <article className="users-stat-card">
          <span>Total visible</span>
          <strong>{users.length}</strong>
          <p>Current result set from the active filters.</p>
        </article>
        <article className="users-stat-card">
          <span>Active users</span>
          <strong>{activeUsers}</strong>
          <p>People who can sign in and work today.</p>
        </article>
        <article className="users-stat-card">
          <span>Admins</span>
          <strong>{adminUsers}</strong>
          <p>Accounts with broad access to the workspace.</p>
        </article>
      </div>

      {usersQuery.isLoading ? <div className="users-feedback-card">Loading users…</div> : null}
      {usersQuery.isError ? <div className="users-feedback-card users-feedback-card--error">{usersQuery.error.message}</div> : null}
      {!usersQuery.isLoading && !usersQuery.isError ? (
        <UsersGrid users={users} onEdit={user => setEditingUser(user)} onDelete={user => setDeleteTarget(user)} />
      ) : null}

      {isCreateOpen ? <UserFormModal onCancel={() => setIsCreateOpen(false)} onSuccess={handleFormSuccess} /> : null}
      {editingUser ? (
        <UserFormModal user={editingUser} onCancel={() => setEditingUser(null)} onSuccess={handleFormSuccess} />
      ) : null}
      {deleteTarget ? (
        <ConfirmModal
          title="Delete user"
          message={`Remove ${deleteTarget.name} from the directory? This action cannot be undone.`}
          errorMessage={deleteMutation.error?.message}
          confirmLabel="Delete user"
          isLoading={deleteMutation.isPending}
          onCancel={() => {
            if (!deleteMutation.isPending) {
              setDeleteTarget(null);
            }
          }}
          onConfirm={() => deleteMutation.mutate({ id: deleteTarget.id })}
        />
      ) : null}
    </section>
  );
}
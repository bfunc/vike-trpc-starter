import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { queryClient, trpc } from '$src/trpc/client';
import type { User, UserRole } from '../schema';

type Props = {
  user?: User;
  onCancel: () => void;
  onSuccess: () => Promise<void> | void;
};

type FormState = {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  is_active: boolean;
};

type ParsedFormErrors = {
  formError?: string;
  fieldErrors: Partial<Record<keyof FormState, string>>;
};

const defaultFormState: FormState = {
  name: '',
  email: '',
  role: 'viewer',
  department: '',
  is_active: true
};

export default function UserFormModal({ user, onCancel, onSuccess }: Props) {
  const [form, setForm] = useState<FormState>(defaultFormState);

  useEffect(() => {
    if (!user) {
      setForm(defaultFormState);
      return;
    }

    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department ?? '',
      is_active: user.is_active
    });
  }, [user]);

  const createMutation = useMutation(
    trpc.users.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.refetchQueries(trpc.users.list.queryFilter());
        await onSuccess();
      }
    })
  );

  const updateMutation = useMutation(
    trpc.users.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.refetchQueries(trpc.users.list.queryFilter());
        await onSuccess();
      }
    })
  );

  const activeMutation = user ? updateMutation : createMutation;
  const parsedErrors = parseMutationErrors(activeMutation.error);

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (user) {
      updateMutation.mutate({
        id: user.id,
        name: form.name,
        email: form.email,
        role: form.role,
        department: form.department.trim() || null,
        is_active: form.is_active
      });
      return;
    }

    createMutation.mutate({
      name: form.name,
      email: form.email,
      role: form.role,
      department: form.department.trim() || undefined,
      is_active: form.is_active
    });
  }

  return (
    <div className="users-modal-backdrop" role="presentation">
      <div className="users-modal users-form-modal" role="dialog" aria-modal="true" aria-labelledby="user-form-title">
        <div className="users-modal__header">
          <div>
            <p className="users-modal__eyebrow">Users</p>
            <h2 id="user-form-title">{user ? 'Edit user' : 'Create user'}</h2>
          </div>
          <button type="button" className="users-modal__icon-button" onClick={onCancel} disabled={activeMutation.isPending}>
            Close
          </button>
        </div>

        <form className="users-form" onSubmit={handleSubmit}>
          <label className="users-field">
            <span>Name</span>
            <input
              value={form.name}
              onChange={event => updateField('name', event.target.value)}
              placeholder="Avery Stone"
              autoFocus
            />
            {parsedErrors.fieldErrors.name ? <small>{parsedErrors.fieldErrors.name}</small> : null}
          </label>

          <label className="users-field">
            <span>Email</span>
            <input
              value={form.email}
              onChange={event => updateField('email', event.target.value)}
              placeholder="avery.stone@example.com"
              type="email"
            />
            {parsedErrors.fieldErrors.email ? <small>{parsedErrors.fieldErrors.email}</small> : null}
          </label>

          <div className="users-form__row">
            <label className="users-field">
              <span>Role</span>
              <select value={form.role} onChange={event => updateField('role', event.target.value as UserRole)}>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              {parsedErrors.fieldErrors.role ? <small>{parsedErrors.fieldErrors.role}</small> : null}
            </label>

            <label className="users-field">
              <span>Department</span>
              <input
                value={form.department}
                onChange={event => updateField('department', event.target.value)}
                placeholder="Operations"
              />
              {parsedErrors.fieldErrors.department ? <small>{parsedErrors.fieldErrors.department}</small> : null}
            </label>
          </div>

          <label className="users-toggle-field">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={event => updateField('is_active', event.target.checked)}
            />
            <span>Active user</span>
          </label>
          {parsedErrors.fieldErrors.is_active ? <small className="users-field-hint users-field-hint--error">{parsedErrors.fieldErrors.is_active}</small> : null}

          {parsedErrors.formError ? <p className="users-form__error">{parsedErrors.formError}</p> : null}

          <div className="users-modal__actions">
            <button type="button" className="users-button users-button--ghost" onClick={onCancel} disabled={activeMutation.isPending}>
              Cancel
            </button>
            <button type="submit" className="users-button users-button--primary" disabled={activeMutation.isPending}>
              {activeMutation.isPending ? 'Saving…' : user ? 'Save changes' : 'Create user'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function parseMutationErrors(error: unknown): ParsedFormErrors {
  if (!error) {
    return { fieldErrors: {} };
  }

  const maybeError = error as {
    message?: string;
    data?: {
      zodError?: {
        fieldErrors?: Record<string, string[] | undefined>;
        formErrors?: string[];
      } | null;
    };
  };

  const fieldErrors = maybeError.data?.zodError?.fieldErrors ?? {};

  return {
    formError: maybeError.data?.zodError?.formErrors?.[0] ?? maybeError.message ?? 'Unable to save user.',
    fieldErrors: {
      name: fieldErrors.name?.[0],
      email: fieldErrors.email?.[0],
      role: fieldErrors.role?.[0],
      department: fieldErrors.department?.[0],
      is_active: fieldErrors.is_active?.[0]
    }
  };
}
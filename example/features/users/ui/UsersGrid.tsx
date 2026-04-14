import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import type { User } from '$src/features/users/schema';
import { EditIcon, TrashIcon } from '$src/components/Icons';

ModuleRegistry.registerModules([AllCommunityModule]);

type Props = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

export default function UsersGrid({ users, onEdit, onDelete }: Props) {
  const colDefs = useMemo<ColDef<User>[]>(
    () => [
      { field: 'name', headerName: 'Name', sortable: true, filter: true, flex: 2 },
      { field: 'email', headerName: 'Email', sortable: true, filter: true, flex: 2 },
      { field: 'role', headerName: 'Role', sortable: true, filter: true, flex: 1 },
      {
        field: 'department',
        headerName: 'Department',
        filter: true,
        flex: 1,
        valueFormatter: ({ value }) => (value as string | null) ?? '—'
      },
      {
        field: 'is_active',
        headerName: 'Active',
        flex: 1,
        cellRenderer: ({ value }: ICellRendererParams<User, boolean>) => (
          <span
            style={{
              display: 'inline-block',
              padding: '2px 10px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 600,
              background: value ? '#dcfce7' : '#fee2e2',
              color: value ? '#166534' : '#991b1b'
            }}
          >
            {value ? 'Yes' : 'No'}
          </span>
        )
      },
      {
        field: 'created_at',
        headerName: 'Created',
        flex: 1,
        valueFormatter: ({ value }) => (value as string).slice(0, 10)
      },
      {
        headerName: 'Actions',
        flex: 1,
        sortable: false,
        filter: false,
        cellRenderer: ({ data }: ICellRendererParams<User>) => {
          if (!data) return null;
          return (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', height: '100%' }}>
              <button
                onClick={() => onEdit(data)}
                style={actionBtn}
                title="Edit"
              >
                <EditIcon /> Edit
              </button>
              <button
                onClick={() => onDelete(data)}
                style={{ ...actionBtn, color: '#dc2626', borderColor: '#fca5a5' }}
                title="Delete"
              >
                <TrashIcon /> Delete
              </button>
            </div>
          );
        }
      }
    ],
    [onEdit, onDelete]
  );

  return (
    <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
      <AgGridReact<User>
        rowData={users}
        columnDefs={colDefs}
        pagination={true}
        paginationPageSize={50}
        domLayout="normal"
      />
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '3px 10px',
  fontSize: 12,
  border: '1px solid #d1d5db',
  borderRadius: 4,
  background: '#fff',
  cursor: 'pointer',
  color: '#374151'
};

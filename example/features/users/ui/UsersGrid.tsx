import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, type ColDef, type ICellRendererParams } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { formatDate } from '$src/shared/helpers/date-helpers';
import type { User } from '../schema';

ModuleRegistry.registerModules([AllCommunityModule]);

type Props = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

export default function UsersGrid({ users, onEdit, onDelete }: Props) {
  const columnDefs: ColDef<User>[] = [
    {
      field: 'name',
      headerName: 'Name',
      minWidth: 190,
      cellClass: 'users-grid__primary-cell'
    },
    {
      field: 'email',
      headerName: 'Email',
      minWidth: 240
    },
    {
      field: 'role',
      headerName: 'Role',
      minWidth: 130,
      filter: 'agSetColumnFilter',
      cellRenderer: ({ value }: ICellRendererParams<User>) => {
        const role = String(value ?? 'viewer');
        return <span className={`users-role users-role--${role}`}>{role}</span>;
      }
    },
    {
      field: 'department',
      headerName: 'Department',
      minWidth: 180,
      valueFormatter: params => params.value || 'Unassigned'
    },
    {
      field: 'is_active',
      headerName: 'Active',
      minWidth: 120,
      maxWidth: 140,
      filter: 'agSetColumnFilter',
      valueFormatter: params => (params.value ? 'Yes' : 'No'),
      cellRenderer: ({ value }: ICellRendererParams<User>) => (
        <span className={value ? 'users-status users-status--active' : 'users-status users-status--inactive'}>
          {value ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      field: 'created_at',
      headerName: 'Created',
      minWidth: 130,
      maxWidth: 150,
      valueFormatter: params => formatDate(String(params.value ?? ''))
    },
    {
      headerName: 'Actions',
      colId: 'actions',
      sortable: false,
      filter: false,
      resizable: false,
      minWidth: 170,
      maxWidth: 190,
      pinned: 'right',
      cellRenderer: ({ data }: ICellRendererParams<User>) => {
        if (!data) {
          return null;
        }

        return (
          <div className="users-grid__actions">
            <button type="button" className="users-grid__button users-grid__button--edit" onClick={() => onEdit(data)}>
              Edit
            </button>
            <button type="button" className="users-grid__button users-grid__button--delete" onClick={() => onDelete(data)}>
              Delete
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="users-grid-card">
      <div className="users-grid-card__header">
        <div>
          <h3>User directory</h3>
          <p>{users.length} visible records</p>
        </div>
      </div>

      <div className="ag-theme-quartz users-grid-theme">
        <AgGridReact<User>
          rowData={users}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, filter: true, resizable: true, flex: 1, minWidth: 120 }}
          animateRows
          domLayout="autoHeight"
          pagination
          paginationPageSize={50}
          rowHeight={58}
          suppressCellFocus
          noRowsOverlayComponent={() => <div className="users-grid__empty">No users match the current filters.</div>}
        />
      </div>
    </div>
  );
}
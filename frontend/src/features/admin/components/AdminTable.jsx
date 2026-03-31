import { useState } from 'react';
import { 
  DataGrid, 
  GridToolbarContainer, 
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarColumnsButton 
} from '@mui/x-data-grid';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, IconButton, Chip } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const AdminTable = ({
  title,
  columns,
  data,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  createMutation,
  updateMutation,
  deleteMutation,
  getQuery
}) => {
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [formData, setFormData] = useState({});

  const handleAdd = () => {
    setEditRow(null);
    setFormData({});
    setOpen(true);
  };

  const handleEdit = (row) => {
    setEditRow(row);
    setFormData(row);
    setOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm(`Delete this ${title.toLowerCase()}?`)) {
      deleteMutation(id);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({});
    setEditRow(null);
  };

  const handleSave = () => {
    if (editRow) {
      updateMutation({ id: editRow.id, ...formData });
    } else {
      createMutation(formData);
    }
    handleClose();
  };

  const handleFieldChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const actionColumn = {
    field: 'actions',
    headerName: 'Actions',
    width: 150,
    sortable: false,
    renderCell: (params) => (
      <Box>
        <IconButton size="small" onClick={() => handleEdit(params.row)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    ),
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{title} Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add {title}
        </Button>
      </Box>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={data}
          columns={[...columns, actionColumn]}
          paginationMode="server"
          rowCount={totalCount}
          page={page - 1}
          pageSize={pageSize}
          onPageChange={(newPage) => onPageChange(newPage + 1)}
          onPageSizeChange={onPageSizeChange}
          rowsPerPageOptions={[5, 10, 20, 50]}
          disableSelectionOnClick
          components={{
            Toolbar: GridToolbarContainer,
          }}
          componentsProps={{
            toolbar: {
              csvOptions: { disableToolbarButton: false },
              printOptions: { disableToolbarButton: false },
              columns: { options: { sortable: true } },
            },
          }}
        />
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editRow ? 'Edit' : 'Add'} {title}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {columns.map((col) => (
              col.field !== 'id' && col.field !== 'actions' && (
                <TextField
                  key={col.field}
                  margin="dense"
                  label={col.headerName}
                  fullWidth
                  value={formData[col.field] || ''}
                  onChange={handleFieldChange(col.field)}
                  select={col.type === 'singleSelect'}
                  {...(col.type === 'singleSelect' && { SelectProps: { native: true } })}
                />
              )
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminTable;


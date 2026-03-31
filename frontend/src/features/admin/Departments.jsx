import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import AdminTable from './components/AdminTable';
import { 
  useGetDepartmentsQuery, 
  useCreateDepartmentMutation, 
  useUpdateDepartmentMutation, 
  useDeleteDepartmentMutation 
} from '../../services/adminApi';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 300, editable: true },
  { field: 'code', headerName: 'Code', width: 120, editable: true },
  { field: 'school', headerName: 'School', width: 200, editable: true },
];

const Departments = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading } = useGetDepartmentsQuery({ page, page_size: pageSize });
  const [createDepartment] = useCreateDepartmentMutation();
  const [updateDepartment] = useUpdateDepartmentMutation();
  const [deleteDepartment] = useDeleteDepartmentMutation();

  if (isLoading) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Departments</Typography>
      <AdminTable
        title="Department"
        columns={columns}
        data={data?.results || []}
        totalCount={data?.count || 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        createMutation={createDepartment}
        updateMutation={updateDepartment}
        deleteMutation={deleteDepartment}
      />
    </Box>
  );
};

export default Departments;


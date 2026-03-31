import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import AdminTable from './components/AdminTable';
import { 
  useGetAssignmentGroupsQuery, 
  useCreateAssignmentGroupMutation, 
  useUpdateAssignmentGroupMutation, 
  useDeleteAssignmentGroupMutation 
} from '../../services/adminApi';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 250, editable: true },
  { field: 'code', headerName: 'Code', width: 120, editable: true },
  { field: 'school', headerName: 'School', width: 200 },
  { field: 'department', headerName: 'Department', width: 200 },
  { field: 'is_active', headerName: 'Active', width: 100, type: 'boolean' },
];

const AssignmentGroups = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading } = useGetAssignmentGroupsQuery({ page, page_size: pageSize });
  const [createAssignmentGroup] = useCreateAssignmentGroupMutation();
  const [updateAssignmentGroup] = useUpdateAssignmentGroupMutation();
  const [deleteAssignmentGroup] = useDeleteAssignmentGroupMutation();

  if (isLoading) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Assignment Groups</Typography>
      <AdminTable
        title="Assignment Group"
        columns={columns}
        data={data?.results || []}
        totalCount={data?.count || 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        createMutation={createAssignmentGroup}
        updateMutation={updateAssignmentGroup}
        deleteMutation={deleteAssignmentGroup}
      />
    </Box>
  );
};

export default AssignmentGroups;


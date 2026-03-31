import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import AdminTable from './components/AdminTable';
import { 
  useGetRulesQuery, 
  useCreateRuleMutation, 
  useUpdateRuleMutation, 
  useDeleteRuleMutation 
} from '../../services/adminApi';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 250, editable: true },
  { field: 'priority', headerName: 'Priority', width: 100 },
  { field: 'is_active', headerName: 'Active', width: 100, type: 'boolean' },
  { field: 'created_at', headerName: 'Created', width: 150, type: 'dateTime' },
];

const Rules = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const { data, isLoading } = useGetRulesQuery({ page, page_size: pageSize });
  const [createRule] = useCreateRuleMutation();
  const [updateRule] = useUpdateRuleMutation();
  const [deleteRule] = useDeleteRuleMutation();

  if (isLoading) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Rules</Typography>
      <AdminTable
        title="Rule"
        columns={columns}
        data={data?.results || []}
        totalCount={data?.count || 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        createMutation={createRule}
        updateMutation={updateRule}
        deleteMutation={deleteRule}
      />
    </Box>
  );
};

export default Rules;


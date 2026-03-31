import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import AdminTable from './components/AdminTable';
import { 
  useGetSchoolsQuery, 
  useCreateSchoolMutation, 
  useUpdateSchoolMutation, 
  useDeleteSchoolMutation 
} from '../../services/adminApi';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 300, editable: true },
  { field: 'code', headerName: 'Code', width: 120, editable: true },
];

const Schools = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading } = useGetSchoolsQuery({ page, page_size: pageSize });
  const [createSchool] = useCreateSchoolMutation();
  const [updateSchool] = useUpdateSchoolMutation();
  const [deleteSchool] = useDeleteSchoolMutation();

  if (isLoading) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Schools</Typography>
      <AdminTable
        title="School"
        columns={columns}
        data={data?.results || []}
        totalCount={data?.count || 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        createMutation={createSchool}
        updateMutation={updateSchool}
        deleteMutation={deleteSchool}
      />
    </Box>
  );
};

export default Schools;


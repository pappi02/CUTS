import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import AdminTable from './components/AdminTable';
import { 
  useGetCategoriesQuery, 
  useCreateCategoryMutation, 
  useUpdateCategoryMutation, 
  useDeleteCategoryMutation 
} from '../../services/adminApi';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 300, editable: true },
  { field: 'parent', headerName: 'Parent', width: 200 },
  { field: 'default_assignment_group', headerName: 'Default Group', width: 200 },
  { field: 'is_active', headerName: 'Active', width: 100, type: 'boolean' },
];

const Categories = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading } = useGetCategoriesQuery({ page, page_size: pageSize });
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  if (isLoading) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Categories</Typography>
      <AdminTable
        title="Category"
        columns={columns}
        data={data?.results || []}
        totalCount={data?.count || 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        createMutation={createCategory}
        updateMutation={updateCategory}
        deleteMutation={deleteCategory}
      />
    </Box>
  );
};

export default Categories;


import React from 'react';
import { Box, Pagination as MuiPagination, Typography } from '@mui/material';

interface PaginationProps {
  count: number;
  page: number;
  onChange: (page: number) => void;
  showFirstLast?: boolean;
  size?: 'small' | 'medium' | 'large';
  showTotal?: boolean;
  total?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  count,
  page,
  onChange,
  showFirstLast = true,
  size = 'large',
  showTotal = false,
  total
}) => {
  const handleChange = (_: React.ChangeEvent<unknown>, value: number) => {
    onChange(value);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      gap: 2,
      mt: 4 
    }}>
      {showTotal && total !== undefined && (
        <Typography variant="body2" color="textSecondary">
          Total: {total}
        </Typography>
      )}
      <MuiPagination
        count={count}
        page={page}
        onChange={handleChange}
        color="primary"
        size={size}
        showFirstButton={showFirstLast}
        showLastButton={showFirstLast}
        sx={{
          '& .MuiPaginationItem-root': {
            borderRadius: '8px',
            margin: '0 4px',
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            },
          },
        }}
      />
    </Box>
  );
};

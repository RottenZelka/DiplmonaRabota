import { useState } from 'react';

interface PaginationData {
  total_count: number;
  page_count: number;
  current_page: number;
  page_size: number;
}

interface UsePaginationProps {
  initialPage?: number;
  initialPageSize?: number;
  onPageChange?: (page: number) => void;
}

export const usePagination = ({ 
  initialPage = 1, 
  initialPageSize = 21,
  onPageChange 
}: UsePaginationProps = {}) => {
  const [pagination, setPagination] = useState<PaginationData>({
    total_count: 0,
    page_count: 1,
    current_page: initialPage,
    page_size: initialPageSize
  });

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current_page: page }));
    onPageChange?.(page);
  };

  const updatePagination = (newPagination: Partial<PaginationData>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  };

  return {
    pagination,
    handlePageChange,
    updatePagination
  };
};

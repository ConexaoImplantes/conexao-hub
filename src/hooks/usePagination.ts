import { useState, useMemo, useEffect } from 'react';

interface UsePaginationOptions {
  totalItems: number;
  itemsPerPage?: number;
  resetDeps?: any[];
}

interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  startIndex: number;
  endIndex: number;
  hasPrev: boolean;
  hasNext: boolean;
  pageNumbers: number[];
}

export function usePagination({
  totalItems,
  itemsPerPage = 12,
  resetDeps = [],
}: UsePaginationOptions): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when dependencies change (e.g., filters)
  useEffect(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const setPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const nextPage = () => setPage(currentPage + 1);
  const prevPage = () => setPage(currentPage - 1);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  return {
    currentPage,
    totalPages,
    setPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
    pageNumbers,
  };
}

import React from "react";
import { Flex, Button, Text, Select } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  limit,
  onLimitChange
}) => {
  const maxVisiblePages = 5;
  
  // Calculate range of pages to show
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  // Adjust if we're at the end
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <Flex align="center" justify="center" gap={2} p={4}>
      {/* Limit selector */}
      <Select 
        value={limit} 
        onChange={(e) => onLimitChange(Number(e.target.value))}
        width="100px"
      >
        <option value={5}>5 per page</option>
        <option value={10}>10 per page</option>
        <option value={20}>20 per page</option>
        <option value={50}>50 per page</option>
      </Select>

      {/* Previous button */}
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        isDisabled={currentPage === 1}
        variant="outline"
        leftIcon={<ChevronLeftIcon />}
      >
        Previous
      </Button>

      {/* First page */}
      {startPage > 1 && (
        <>
          <Button
            onClick={() => onPageChange(1)}
            variant={currentPage === 1 ? "solid" : "outline"}
          >
            1
          </Button>
          {startPage > 2 && <Text>...</Text>}
        </>
      )}

      {/* Page numbers */}
      {pages.map((page) => (
        <Button
          key={page}
          onClick={() => onPageChange(page)}
          variant={currentPage === page ? "solid" : "outline"}
        >
          {page}
        </Button>
      ))}

      {/* Last page */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <Text>...</Text>}
          <Button
            onClick={() => onPageChange(totalPages)}
            variant={currentPage === totalPages ? "solid" : "outline"}
          >
            {totalPages}
          </Button>
        </>
      )}

      {/* Next button */}
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        isDisabled={currentPage === totalPages}
        variant="outline"
        rightIcon={<ChevronRightIcon />}
      >
        Next
      </Button>
    </Flex>
  );
};

export default Pagination;
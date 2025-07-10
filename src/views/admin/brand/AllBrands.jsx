import {
  Box,
  Button,
  Flex,
  Icon,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';
import Card from 'components/card/Card';
import { ChevronLeftIcon, ChevronRightIcon, EditIcon, PlusSquareIcon, SearchIcon } from '@chakra-ui/icons';
import { FaEye, FaTrash } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { useGetBrandsQuery, useDeleteBrandMutation } from 'api/brandSlice';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const columnHelper = createColumnHelper();

const AllBrands = () => {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState('');
  const { data: brandsResponse, refetch, isError, isLoading } = useGetBrandsQuery({ 
    page, 
    limit, 
    search: debouncedSearchQuery 
  });
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();
  const navigate = useNavigate();
  const [sorting, setSorting] = React.useState([]);
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const inputBg = useColorModeValue("white", "gray.700");

  // Extract table data and pagination info
  const tableData = brandsResponse?.data || [];
  
  // Check if API returned pagination data, if not implement client-side pagination
  const hasServerPagination = brandsResponse?.pagination;
  const serverPagination = brandsResponse?.pagination || { page: 1, limit: 10, totalItems: 0, totalPages: 1 };
  
  // Calculate client-side pagination if server doesn't provide it
  const totalItems = hasServerPagination ? serverPagination.totalItems : tableData.length;
  const totalPages = hasServerPagination ? serverPagination.totalPages : Math.ceil(tableData.length / limit);
  
  // Slice data for client-side pagination if needed
  const paginatedData = hasServerPagination ? tableData : tableData.slice((page - 1) * limit, page * limit);
  
  // Use the appropriate data source
  const displayData = hasServerPagination ? tableData : paginatedData;

  // Debug pagination
  console.log('Pagination Debug:', {
    page,
    limit,
    searchQuery: debouncedSearchQuery,
    hasServerPagination,
    totalItems,
    totalPages,
    dataLength: tableData.length,
    displayDataLength: displayData.length,
    serverPagination: serverPagination
  });

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to first page when limit changes
  React.useEffect(() => {
    setPage(1);
  }, [limit]);

  // Handle delete brand
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: t('brandTable.deleteConfirmationTitle'),
        text: t('brandTable.deleteConfirmationText'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: t('brandTable.deleteConfirmationConfirmButtonText'),
      });

      if (result.isConfirmed) {
        await deleteBrand(id).unwrap();
        await refetch();
        Swal.fire('Deleted!', t('brandTable.deleteSuccessMessage'), 'success');
      }
    } catch (error) {
      console.error('Failed to delete brand:', error);
      Swal.fire('Error!', t('brandTable.deleteErrorMessage'), 'error');
    }
  };

  // Transform API data into table data format
  const transformedData = React.useMemo(() => {
    return displayData.map((brand, index) => ({
      index: ((page - 1) * limit) + index + 1,
      id: brand.id,
      en_name: brand.name,
      ar_name: brand.translations?.find((t) => t.languageId === 'ar')?.name || 'N/A',
      image: brand.imageKey,
    }));
  }, [displayData, page, limit]);

  const columns = [
    columnHelper.accessor('index', {
      id: 'index',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('brandTable.id')}
        </Text>
      ),
      cell: (info) => (
        <Flex align="center">
          <Text color={textColor}>{info.getValue()}</Text>
        </Flex>
      ),
    }),
    columnHelper.accessor('en_name', {
      id: 'en_name',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('brandTable.enName')}
        </Text>
      ),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('ar_name', {
      id: 'ar_name',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('brandTable.arName')}
        </Text>
      ),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('image', {
      id: 'image',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('brandTable.image')}
        </Text>
      ),
      cell: (info) => (
        info.getValue() ? (
          <img
            src={info.getValue()}
            alt="Brand Image"
            width={70}
            height={70}
            style={{ borderRadius: '8px' }}
          />
        ) : (
          <Text color="gray.400" fontSize="sm">No Image</Text>
        )
      ),
    }),
    columnHelper.accessor('row', {
      id: 'actions',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('brandTable.actions')}
        </Text>
      ),
      cell: (info) => (
        <Flex align="center">
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="red.500"
            as={FaTrash}
            cursor="pointer"
            onClick={() => handleDelete(info.row.original.id)}
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="green.500"
            as={EditIcon}
            cursor="pointer"
            onClick={() => navigate(`/admin/edit-brand/${info.row.original.id}`)}
          />
        </Flex>
      ),
    }),
  ];

  const table = useReactTable({
    data: transformedData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Pagination controls
  const handleNextPage = () => {
    console.log('Next page clicked. Current page:', page, 'Total pages:', totalPages);
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    console.log('Previous page clicked. Current page:', page);
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    console.log('Limit changed to:', newLimit);
    setLimit(newLimit);
  };

  // Early returns for loading and error states
  if (isLoading) {
    return (
      <div className="container">
        <Card flexDirection="column" w="100%" px="0px" overflowX={{ sm: 'scroll', lg: 'hidden' }}>
          <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
            <Text color={textColor} fontSize="22px" fontWeight="700">
              {t('brandTable.allBrands')}
            </Text>
          </Flex>
          <Box p="20px" textAlign="center">
            <Text color={textColor}>{t('common.loading')}</Text>
          </Box>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container">
        <Card flexDirection="column" w="100%" px="0px" overflowX={{ sm: 'scroll', lg: 'hidden' }}>
          <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
            <Text color={textColor} fontSize="22px" fontWeight="700">
              {t('brandTable.allBrands')}
            </Text>
          </Flex>
          <Box p="20px" textAlign="center">
            <Text color="red.500">{t('common.error')}</Text>
          </Box>
        </Card>
      </div>
    );
  }

  return (
    <div className="container">
      <Card
        flexDirection="column"
        w="100%"
        px="0px"
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
      >
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            lineHeight="100%"
          >
            {t('brandTable.allBrands')}
          </Text>
          <HStack spacing={4} align="center">
            <Box width="300px">
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={SearchIcon} color="gray.400" />
                </InputLeftElement>
                <Input
                  type="text"
                  placeholder={t('brandTable.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg={inputBg}
                  borderRadius="10px"
                  dir={t('direction.ltr')}
                />
              </InputGroup>
            </Box>
          </HStack>
          <Button
            variant="darkBrand"
            color="white"
            fontSize="sm"
            fontWeight="500"
            borderRadius="70px"
            px="24px"
            py="5px"
            onClick={() => navigate('/admin/add-brand')}
            width={'200px'}
          >
            <PlusSquareIcon me="10px" />
            {t('brandTable.createNewBrand')}
          </Button>
        </Flex>
        <Box>
          <Table variant="simple" color="gray.500" mb="24px" mt="12px">
            <Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <Th
                        key={header.id}
                        colSpan={header.colSpan}
                        pe="10px"
                        borderColor={borderColor}
                        cursor="pointer"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <Flex
                          justifyContent="space-between"
                          align="center"
                          fontSize={{ sm: '10px', lg: '12px' }}
                          color="gray.400"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {{
                            asc: ' 🔼',
                            desc: ' 🔽',
                          }[header.column.getIsSorted()] ?? null}
                        </Flex>
                      </Th>
                    );
                  })}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => {
                  return (
                    <Tr key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <Td
                            key={cell.id}
                            fontSize={{ sm: '14px' }}
                            minW={{ sm: '150px', md: '200px', lg: 'auto' }}
                            borderColor="transparent"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </Td>
                        );
                      })}
                    </Tr>
                  );
                })
              ) : (
                <Tr>
                  <Td colSpan={columns.length} textAlign="center" py="40px">
                    <Text color={textColor}>{t('common.noData')}</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>

        {/* Pagination Controls */}
        <Flex justifyContent="space-between" alignItems="center" px="25px" pb="20px">
          <Flex alignItems="center">
            <Text color={textColor} fontSize="sm" mr="10px">
              {t('brandTable.rowsPerPage')}
            </Text>
            <select
              value={limit}
              onChange={handleLimitChange}
              style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ddd' }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </Flex>
                      <Text color={textColor}>
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalItems)} of {totalItems} entries
            </Text>
            <HStack spacing={2}>
              <Button
                size="sm"
                onClick={handlePreviousPage}
                isDisabled={page === 1}
              >
                {t('common.previous')}
              </Button>
              <Text color={textColor}>Page {page} of {totalPages}</Text>
              <Button
                size="sm"
                onClick={handleNextPage}
                isDisabled={page === totalPages}
              >
                {t('common.next')}
              </Button>
            </HStack>
        </Flex>
      </Card>
    </div>
  );
};

export default AllBrands;
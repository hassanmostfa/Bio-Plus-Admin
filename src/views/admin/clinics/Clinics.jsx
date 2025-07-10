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
  Select,
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
import { useGetClinicsQuery, useDeleteClinicMutation } from 'api/clinicSlice';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const columnHelper = createColumnHelper();

const Clinics = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [page, setPage] = React.useState(1); // Current page
  const [limit, setLimit] = React.useState(10); // Items per page
  const [searchQuery, setSearchQuery] = React.useState(''); // Search query
  const [debouncedSearch, setDebouncedSearch] = React.useState(''); // Debounced search
  const navigate = useNavigate();
  const [sorting, setSorting] = React.useState([]);

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, refetch, isError, isLoading } = useGetClinicsQuery({ 
    page, 
    limit, 
    search: debouncedSearch 
  });
  const [deleteClinic, { isError: isDeleteError, isLoading: isDeleteLoading }] = useDeleteClinicMutation();

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Extract table data and pagination info
  const tableData = data?.data || [];
  const pagination = data?.pagination || { page: 1, limit: 10, totalItems: 0, totalPages: 1 };

  // Debug logging
  React.useEffect(() => {
    console.log('Clinics Debug:', {
      page,
      limit,
      searchQuery,
      debouncedSearch,
      tableDataLength: tableData.length,
      pagination,
      isLoading,
      isError
    });
  }, [page, limit, debouncedSearch, tableData.length, pagination, isLoading, isError]);

  // Refetch data when page, limit, or search changes
  React.useEffect(() => {
    refetch();
  }, [page, limit, debouncedSearch, refetch]);

  // Delete function
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: t('messages.confirmDelete'),
        text: t('clinics.deleteWarning'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: t('messages.yesDelete'),
      });

      if (result.isConfirmed) {
        await deleteClinic(id).unwrap(); // Delete the clinic
        refetch(); // Refetch the data
        Swal.fire(t('messages.deleted'), t('clinics.deleteSuccess'), 'success');
      }
    } catch (error) {
      console.error('Failed to delete clinic:', error);
      Swal.fire(t('messages.error'), t('clinics.deleteError'), 'error');
    }
  };



  const columns = [
    columnHelper.accessor('name', {
      id: 'name',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('clinics.name')}
        </Text>
      ),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('email', {
      id: 'email',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('clinics.email')}
        </Text>
      ),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('fromTime', {
      id: 'from',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('clinics.openingTime')}
        </Text>
      ),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('toTime', {
      id: 'to',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('clinics.closingTime')}
        </Text>
      ),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
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
          {t('common.actions')}
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
            onClick={() => navigate(`/admin/edit-clinic/${info.row.original.id}`)}
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="blue.500"
            as={FaEye}
            cursor="pointer"
            onClick={() => navigate(`/admin/show-clinic/${info.row.original.id}`)}
          />
        </Flex>
      ),
    }),
  ];

  // Table instance
  const table = useReactTable({
    data: tableData, // Use server-side data directly
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  // Pagination controls
  const handleNextPage = () => {
    if (page < pagination.totalPages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1); // Reset to the first page when changing the limit
  };

  return (
    <div className="container" dir={language === 'ar' ? 'rtl' : 'ltr'}>
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
            {t('clinics.allClinics')}
          </Text>
          <div className="search-container d-flex align-items-center gap-2">
            <InputGroup w={{ base: "100", md: "400px" }}>
              <InputLeftElement>
                <IconButton
                  bg="inherit"
                  borderRadius="inherit"
                  _hover="none"
                  _active={{
                    bg: "inherit",
                    transform: "none",
                    borderColor: "transparent",
                  }}
                  _focus={{
                    boxShadow: "none",
                  }}
                  icon={<SearchIcon w="15px" h="15px" />}
                />
              </InputLeftElement>
              <Input
                variant="search"
                fontSize="sm"
                bg={useColorModeValue("secondaryGray.300", "gray.700")}
                color={useColorModeValue("gray.700", "white")}
                fontWeight="500"
                _placeholder={{ color: "gray.400", fontSize: "14px" }}
                borderRadius="30px"
                placeholder={t('clinics.searchClinics')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                dir="ltr"
              />
            </InputGroup>
          </div>
          <Button
            variant="darkBrand"
            color="white"
            fontSize="sm"
            fontWeight="500"
            borderRadius="70px"
            px="24px"
            py="5px"
            onClick={() => navigate('/admin/add-clinic')}
            width={'200px'}
          >
            <PlusSquareIcon me="10px" />
            {t('clinics.addNewClinic')}
          </Button>
        </Flex>
        <Box>
          {isLoading ? (
            <Flex justifyContent="center" alignItems="center" py="50px">
              <Text color={textColor}>Loading clinics...</Text>
            </Flex>
          ) : isError ? (
            <Flex justifyContent="center" alignItems="center" py="50px">
              <Text color="red.500">Error loading clinics. Please try again.</Text>
            </Flex>
          ) : tableData.length === 0 ? (
            <Flex justifyContent="center" alignItems="center" py="50px">
              <Text color={textColor}>
                {debouncedSearch ? `No clinics found matching "${debouncedSearch}"` : 'No clinics found.'}
              </Text>
            </Flex>
          ) : (
            <>
              <Table 
                variant="simple" 
                color="gray.500" 
                mb="24px" 
                mt="12px" 
                className="clinics-table"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              >
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
                  {table.getRowModel().rows.map((row) => {
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
                  })}
                </Tbody>
              </Table>
            </>
          )}
        </Box>

        {/* Pagination Controls */}
        <Flex justifyContent="space-between" alignItems="center" px="25px" py="10px">
          <Flex alignItems="center">
            <Text color={textColor} fontSize="sm" mr="10px">
              {t('table.rowsPerPage')}
            </Text>
            <Select
              value={limit}
              onChange={handleLimitChange}
              width="100px"
              size="sm"
              variant="outline"
              borderRadius="md"
              borderColor="gray.200"
              _hover={{ borderColor: 'gray.300' }}
              _focus={{ borderColor: 'blue.500', boxShadow: 'outline' }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Select>
          </Flex>
          <Flex alignItems="center" gap={2}>
            <Text color={textColor} fontSize="sm">
              {t('table.pageOf', { page: pagination.page, totalPages: pagination.totalPages })}
            </Text>
            {pagination.totalItems > 0 && (
              <Text color="gray.500" fontSize="sm">
                ({pagination.totalItems} total items)
              </Text>
            )}
          </Flex>
          <Flex>
            <Button
              onClick={handlePreviousPage}
              disabled={page === 1}
              variant="outline"
              size="sm"
              mr="10px"
            >
              <Icon as={ChevronLeftIcon} mr="5px" />
              {t('table.previous')}
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={page === pagination.totalPages}
              variant="outline"
              size="sm"
            >
              {t('table.next')}
              <Icon as={ChevronRightIcon} ml="5px" />
            </Button>
          </Flex>
        </Flex>
      </Card>
    </div>
  );
};

export default Clinics;
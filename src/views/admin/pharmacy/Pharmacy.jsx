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
  Select, // Import Select from Chakra UI
  Switch, // Import Switch for toggle functionality
  useToast, // Import useToast for notifications
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
import { CiSearch } from 'react-icons/ci';
import { useState } from 'react';
import { useGetPharmaciesQuery } from 'api/pharmacySlice'; // Replace with your actual API slice
import { useDeletePharmacyMutation, useUpdatePharmacyMutation } from 'api/pharmacySlice';
import Swal from 'sweetalert2';
import { FaRegFolderClosed } from "react-icons/fa6";
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';
const columnHelper = createColumnHelper();

const Pharmacy = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const toast = useToast(); // Add toast for notifications
  const [page, setPage] = React.useState(1); // Current page
  const [limit, setLimit] = React.useState(10); // Items per page
  const [searchQuery, setSearchQuery] = React.useState(''); // Search query
  const [debouncedSearch, setDebouncedSearch] = React.useState(''); // Debounced search

  const bg = useColorModeValue('secondaryGray.300', 'gray.700'); // Background color for light and dark mode
  const color = useColorModeValue('gray.700', 'white'); // Text color for light and dark mode

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data from API
  const { data: pharmacyData, refetch, isLoading, isError } = useGetPharmaciesQuery({
    page,
    limit, 
    search: debouncedSearch
  }, {
    // Refetch when parameters change
    refetchOnMountOrArgChange: true,
  });
  const [deletePharmacy, { isError: isDeleteError, isLoading: isDeleteLoading }] = useDeletePharmacyMutation();
  const [updatePharmacy, { isLoading: isUpdateLoading }] = useUpdatePharmacyMutation(); // Add update mutation

  const navigate = useNavigate();
  const [sorting, setSorting] = React.useState([]);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Extract data and pagination info from API response
  const tableData = pharmacyData?.data?.items || [];
  const pagination = pharmacyData?.data || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  // Debug logging for search and pagination
  React.useEffect(() => {
    console.log('Search query changed:', searchQuery);
    console.log('Debounced search:', debouncedSearch);
  }, [searchQuery, debouncedSearch]);

  React.useEffect(() => {
    console.log('Page changed:', page);
    console.log('Limit changed:', limit);
  }, [page, limit]);

  // Debug API response
  React.useEffect(() => {
    console.log('API Response:', pharmacyData);
    console.log('Table Data:', tableData);
    console.log('Pagination:', pagination);
  }, [pharmacyData, tableData, pagination]);

  // Delete function with proper response handling
  const deletePharmacyHandler = async (id) => {
    try {
      const result = await Swal.fire({
        title: t('messages.confirmDelete'),
        text: t('pharmacy.deleteWarning'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: t('messages.yesDelete'),
      });

      if (result.isConfirmed) {
        const response = await deletePharmacy(id).unwrap();
        refetch(); // Refetch the data
        Swal.fire(
          t('messages.deleted'), 
          response?.message || t('pharmacy.deleteSuccess'), 
          'success'
        );
      }
    } catch (error) {
      console.error('Failed to delete pharmacy:', error);
      Swal.fire(
        t('messages.error'), 
        t('pharmacy.deleteError'), 
        'error'
      );
    }
  };

  // Toggle active status function
  const toggleActiveStatus = async (pharmacyId, currentStatus) => {
    try {
      await updatePharmacy({
        id: pharmacyId,
        pharmacy: { isActive: !currentStatus }
      }).unwrap();
      
      toast({
        title: t('pharmacy.statusUpdateSuccess'),
        description: t('pharmacy.statusUpdateSuccessDesc'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      refetch(); // Refetch the data to update the UI
    } catch (error) {
      console.error('Failed to update pharmacy status:', error);
      toast({
        title: t('pharmacy.statusUpdateError'),
        description: error.data?.message || t('pharmacy.statusUpdateErrorDesc'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1); // Reset to the first page when changing the limit
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < pagination.totalPages) {
      setPage(page + 1);
    }
  };

  const columns = [
    columnHelper.accessor('name', {
      header: t('pharmacy.name'),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('imageKey', {
      header: t('pharmacy.image'),
      cell: (info) => (
        <img
          src={info.getValue()}
          alt={t('pharmacy.image')}
          width={70}
          height={70}
          style={{ borderRadius: '8px' }}
        />
      ),
    }),
    columnHelper.accessor('whatsappNumber', {
      header: t('pharmacy.whatsapp'),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('revenueShare', {
      header: t('pharmacy.revenueShare'),
      cell: (info) => <Text color={textColor}>{info.getValue()}%</Text>,
    }),
    columnHelper.accessor('isActive', {
      header: t('pharmacy.isActive'),
      cell: (info) => (
        <Flex align="center" justify="center">
          <Switch
            isChecked={info.getValue()}
            onChange={() => toggleActiveStatus(info.row.original.id, info.getValue())}
            colorScheme="green"
            size="md"
            isDisabled={isUpdateLoading}
          />
        </Flex>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: t('pharmacy.createdAt') || 'Created At',
      cell: (info) => {
        const date = new Date(info.getValue());
        const formattedDate = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        return <Text color={textColor}>{formattedDate}</Text>;
      },
    }),
    columnHelper.accessor('id', {
      header: t('pharmacy.actions'),
      cell: (info) => (
        <Flex align="center">
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="red.500"
            as={FaTrash}
            cursor="pointer"
            onClick={() => deletePharmacyHandler(info.row.original.id)}
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="green.500"
            as={EditIcon}
            cursor="pointer"
            onClick={() => navigate(`/admin/edit-pharmacy/${info.row.original.id}`)}
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="blue.500"
            as={FaEye}
            cursor="pointer"
            onClick={() => navigate(`/admin/show/pharmacy/${info.row.original.id}`)}
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="black"
            as={FaRegFolderClosed}
            cursor="pointer"
            onClick={() => navigate(`/admin/pharmacy/${info.row.original.id}/files`)}
          />
        </Flex>
      ),
    }),
  ];

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

  if (isLoading) {
    return <div>{t('pharmacy.loading')}</div>;
  }

  if (isError) {
    return <div>{t('pharmacy.errorFetching')}</div>;
  }

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
            {t('pharmacy.title')}
          </Text>

          <div className="search-container d-flex align-items-center gap-2">
            <InputGroup w={{ base: '100%', md: '400px' }}>
              <InputLeftElement>
                <IconButton
                  bg="inherit"
                  borderRadius="inherit"
                  _hover="none"
                  _active={{
                    bg: 'inherit',
                    transform: 'none',
                    borderColor: 'transparent',
                  }}
                  _focus={{
                    boxShadow: 'none',
                  }}
                  icon={<SearchIcon w="15px" h="15px" />}
                />
              </InputLeftElement>
              <Input
                variant="search"
                fontSize="sm"
                bg={bg}
                color={textColor}
                fontWeight="500"
                _placeholder={{ color: 'gray.400', fontSize: '14px' }}
                borderRadius="30px"
                placeholder={t('pharmacy.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                dir="ltr"
                _focus={{
                  borderColor: 'blue.500',
                  boxShadow: '0 0 0 1px #3182ce',
                }}
              />
            </InputGroup>
            {debouncedSearch && (
              <Text fontSize="sm" color="blue.500">
                Searching: "{debouncedSearch}" {isLoading && "(Loading...)"}
              </Text>
            )}
          </div>
          <Button
            variant="darkBrand"
            color="white"
            fontSize="sm"
            fontWeight="500"
            borderRadius="70px"
            px="24px"
            py="5px"
            onClick={() => navigate('/admin/add-pharmacy')}
            width={'200px'}
          >
            {t('pharmacy.addPharmacy')}
          </Button>
        </Flex>
        <Box>
          {isLoading ? (
            <Flex justifyContent="center" alignItems="center" py="50px">
              <Text color={textColor}>Loading pharmacies...</Text>
            </Flex>
          ) : isError ? (
            <Flex justifyContent="center" alignItems="center" py="50px">
              <Text color="red.500">Error loading pharmacies. Please try again.</Text>
            </Flex>
          ) : !tableData || tableData.length === 0 ? (
            <Flex justifyContent="center" alignItems="center" py="50px">
              <Text color={textColor}>No pharmacies found.</Text>
            </Flex>
          ) : (
            <Table 
              variant="simple" 
              color="gray.500" 
              mb="24px" 
              mt="12px"
              className="pharmacy-table"
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
          )}
        </Box>

        {/* Pagination Controls */}
        <Flex justifyContent="space-between" alignItems="center" px="25px" py="10px">
          <Flex alignItems="center">
            <Text color={textColor} fontSize="sm" mr="10px">
              {t('pharmacy.rowsPerPage')}
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
          <Text color={textColor} fontSize="sm">
            {t('pharmacy.pageOf', { page: pagination.page, totalPages: pagination.totalPages })} ({pagination.total} total)
          </Text>
          <Flex>
            <Button
              onClick={handlePreviousPage}
              disabled={page === 1}
              variant="outline"
              size="sm"
              mr="10px"
            >
              <Icon as={ChevronLeftIcon} mr="5px" />
              {t('pharmacy.previous')}
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={page === pagination.totalPages}
              variant="outline"
              size="sm"
            >
              {t('pharmacy.next')}
              <Icon as={ChevronRightIcon} ml="5px" />
            </Button>
          </Flex>
        </Flex>
      </Card>
    </div>
  );
};

export default Pharmacy;
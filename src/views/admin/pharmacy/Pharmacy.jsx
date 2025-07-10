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
import { useDeletePharmacyMutation } from 'api/pharmacySlice';
import Swal from 'sweetalert2';
import { FaRegFolderClosed } from "react-icons/fa6";
import { useTranslation } from 'react-i18next';
const columnHelper = createColumnHelper();

const Pharmacy = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [limit, setLimit] = useState(10); // Items per page
  const [searchQuery, setSearchQuery] = useState(''); // Search query
  const [debouncedSearch, setDebouncedSearch] = useState(''); // Debounced search
  const [page, setPage] = React.useState(1); // Current page

  const bg = useColorModeValue('secondaryGray.300', 'gray.700'); // Background color for light and dark mode
  const color = useColorModeValue('gray.700', 'white'); // Text color for light and dark mode

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data from API
  const { data: pharmacyData, refetch, isLoading, isError } = useGetPharmaciesQuery({
    page: currentPage,
    limit, 
    search: debouncedSearch
  });
  const [deletePharmacy, { isError: isDeleteError, isLoading: isDeleteLoading }] = useDeletePharmacyMutation();

  React.useEffect(() => {
    refetch();
  }, [currentPage, limit, debouncedSearch, refetch]);

  const deletePharmacyHandler = async (id) => {
    try {
      Swal.fire({
        title: t('pharmacy.confirmDelete'),
        text: t('pharmacy.deleteWarning'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: t('pharmacy.delete'),
      }).then(async (result) => {
        if (result.isConfirmed) {
          await deletePharmacy(id);
          refetch();
          Swal.fire(t('pharmacy.deleteSuccess'), '', 'success');
        }
      });
    } catch (error) {
      Swal.fire(t('pharmacy.deleteError'), error.data?.message || '', 'error');
    }
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setCurrentPage(1); // Reset to the first page when changing the limit
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

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
      cell: (info) =>
        info.getValue() ? (
          <Text color="green.500">{t('pharmacy.active')}</Text>
        ) : (
          <Text color="red.500">{t('pharmacy.inactive')}</Text>
        ),
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
            onClick={() => navigate(`/admin/show-pharmacy/${info.row.original.id}`)}
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
            {t('pharmacy.title')}
          </Text>

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
            />
          </InputGroup>
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
            {t('pharmacy.pageOf', { page: pagination.page, totalPages: pagination.totalPages })}
          </Text>
          <Flex>
            <Button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              mr="10px"
            >
              <Icon as={ChevronLeftIcon} mr="5px" />
              {t('pharmacy.previous')}
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={currentPage === pagination.totalPages}
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
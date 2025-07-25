import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
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
  Badge,
  Spinner,
  Image,
  Select,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { EditIcon, PlusSquareIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FaEye, FaTrash } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { useGetReturnsQuery, useDeleteReturnMutation } from 'api/returnSlice';
import Swal from 'sweetalert2';
import { FaSearch } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const columnHelper = createColumnHelper();

const Returns = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: returnsResponse, isLoading, refetch } = useGetReturnsQuery({ page, limit });
  const [deleteReturn, { isLoading: isDeleting }] = useDeleteReturnMutation();

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Extract table data and pagination info
  const tableData = returnsResponse?.data || [];
  const pagination = returnsResponse?.pagination || { page: 1, limit: 10, totalItems: 0, totalPages: 1 };
  useEffect(() => {
    refetch();
  },[]);
  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return tableData;
    return tableData.filter((returnItem) =>
      Object.values(returnItem).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [tableData, searchQuery]);

  // Handle delete return
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: t('returns.deleteConfirmTitle'),
        text: t('returns.deleteConfirmText'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: t('returns.deleteConfirmButton'),
      });

      if (result.isConfirmed) {
        await deleteReturn(id).unwrap();
        refetch();
        Swal.fire(t('returns.deleteSuccessTitle'), t('returns.deleteSuccessText'), 'success');
      }
    } catch (error) {
      console.error('Failed to delete return policy:', error);
      Swal.fire(t('returns.deleteErrorTitle'), t('returns.deleteErrorText'), 'error');
    }
  };

  const columns = [
    columnHelper.accessor('contentEn', {
      id: 'contentEn',
      header: () => <Text color="gray.400">{t('returns.englishContent')}</Text>,
      cell: (info) => (
        <Text color={textColor} noOfLines={2}>
          {info.getValue().substring(0, 100)}...
        </Text>
      ),
    }),
    columnHelper.accessor('contentAr', {
      id: 'contentAr',
      header: () => <Text color="gray.400">{t('returns.arabicContent')}</Text>,
      cell: (info) => (
        <Text color={textColor} noOfLines={2} dir="rtl">
          {info.getValue() ? info.getValue().substring(0, 100) + '...' : t('returns.notAvailable')}
        </Text>
      ),
    }),
    columnHelper.accessor('image', {
      id: 'image',
      header: () => <Text color="gray.400">{t('returns.icon')}</Text>,
      cell: (info) => (
        <Image
          src={info.getValue()}
          alt={t('returns.returnPolicy')}
          boxSize="70px"
          objectFit="cover"
          borderRadius="md"
          fallbackSrc="https://via.placeholder.com/70"
        />
      ),
    }),
    columnHelper.accessor('isActive', {
      id: 'status',
      header: () => <Text color="gray.400">{t('returns.status')}</Text>,
      cell: (info) => (
        <Badge colorScheme={info.getValue() ? 'green' : 'red'}>
          {info.getValue() ? t('returns.active') : t('returns.inactive')}
        </Badge>
      ),
    }),
    columnHelper.accessor('id', {
      id: 'actions',
      header: () => <Text color="gray.400">{t('returns.actions')}</Text>,
      cell: (info) => (
        <Flex>
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="red.500"
            as={FaTrash}
            cursor="pointer"
            onClick={() => handleDelete(info.getValue())}
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="green.500"
            as={EditIcon}
            cursor="pointer"
            onClick={() => navigate(`/admin/cms/edit-return/${info.getValue()}`)}
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="blue.500"
            as={FaEye}
            cursor="pointer"
            onClick={() => navigate(`/admin/cms/show-return/${info.getValue()}`)}
          />
        </Flex>
      ),
    }),
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
    setPage(1);
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <div className="container" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Card flexDirection="column" w="100%" px="0px" overflowX={{ sm: 'scroll', lg: 'hidden' }}>
        <Flex px="25px" mb="8px" mt="20px" justifyContent="space-between" align="center">
          <Text color={textColor} fontSize="22px" fontWeight="700" lineHeight="100%">
            {t('returns.returnPolicies')}
          </Text>
          
          <Flex align="center" gap={4}>
            {/* <InputGroup w={{ base: "100%", md: "200px" }}>
              <InputLeftElement>
                <IconButton
                  bg="inherit"
                  borderRadius="inherit"
                  _hover="none"
                  _active={{ bg: "inherit" }}
                  icon={<FaSearch color="gray.400" />}
                />
              </InputLeftElement>
              <Input
                variant="search"
                fontSize="sm"
                placeholder={t('returns.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup> */}
            
            <Button
              variant='darkBrand'
              color='white'
              fontSize='sm'
              fontWeight='500'
              borderRadius='70px'
              px='24px'
              py='5px'
              onClick={() => navigate('/admin/cms/add-return')}
              leftIcon={<PlusSquareIcon />}
            >
              {t('returns.addReturnPolicy')}
            </Button>
          </Flex>
        </Flex>
        
        <Box>
          <Table variant="simple" color="gray.500" mb="24px" mt="12px">
            <Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th key={header.id} borderColor={borderColor}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {table.getRowModel().rows.map((row) => (
                <Tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Td key={cell.id} borderColor="transparent">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Pagination Controls */}
        <Flex justifyContent="space-between" alignItems="center" px="25px" py="10px">
          <Flex alignItems="center">
            <Text color={textColor} fontSize="sm" mr="10px">
              {t('returns.rowsPerPage')}:
            </Text>
            <Select
              value={limit}
              onChange={handleLimitChange}
              size="sm"
              w="80px"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Select>
          </Flex>
          
          <Text color={textColor} fontSize="sm">
            {t('returns.page')} {pagination.page} {t('returns.of')} {pagination.totalPages}
          </Text>
          
          <Flex>
            <Button
              onClick={handlePreviousPage}
              disabled={page === 1}
              variant="outline"
              size="sm"
              mr="10px"
              leftIcon={<ChevronLeftIcon />}
            >
              {t('returns.previous')}
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={page === pagination.totalPages}
              variant="outline"
              size="sm"
              rightIcon={<ChevronRightIcon />}
            >
              {t('returns.next')}
            </Button>
          </Flex>
        </Flex>
      </Card>
    </div>
  );
};

export default Returns;
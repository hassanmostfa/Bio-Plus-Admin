import React, { useEffect, useState } from 'react';
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
  Badge,
  Spinner,
  Select,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Card from 'components/card/Card';
import { EditIcon, PlusSquareIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FaEye, FaTrash } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { useGetTagsQuery, useDeleteTagMutation } from 'api/tagSlice';
import Swal from 'sweetalert2';
import { FaSearch } from 'react-icons/fa';
import { useGetSpecializationsQuery } from 'api/doctorSpecializationSlice';
import { useDeleteSpecializationMutation } from 'api/doctorSpecializationSlice';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../contexts/LanguageContext';

const columnHelper = createColumnHelper();

const Specialization = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: specializations, isLoading, refetch } = useGetSpecializationsQuery({ page, limit });
  const [deleteSpecialization, { isLoading: isDeleting }] = useDeleteSpecializationMutation();

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Extract table data and pagination info
  const tableData = specializations?.data || [];
  const pagination = specializations?.pagination || { page: 1, limit: 10, totalItems: 0, totalPages: 1 };

  useEffect(()=>{
    refetch();
  },[]);
  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return tableData;
    return tableData.filter((tag) =>
      Object.values(tag).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [tableData, searchQuery]);

  // Handle delete tag
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: t('specializations.confirmDelete'),
        text: t('specializations.deleteWarning'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: t('specializations.delete'),
      });

      if (result.isConfirmed) {
        await deleteSpecialization(id).unwrap();
        refetch();
        Swal.fire(t('specializations.deleteSuccess'), t('specializations.specializationDeleted'), 'success');
      }
    } catch (error) {
      console.error('Failed to delete tag:', error);
      Swal.fire(t('specializations.error'), t('specializations.failedToDeleteSpecialization'), 'error');
    }
  };

  const columns = [
    columnHelper.accessor('id', {
      id: 'id',
      header: () => <Text color="gray.400">{t('specializations.id')}</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('name', {
      id: 'en_title',
      header: () => <Text color="gray.400">{t('specializations.englishTitle')}</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('name', {
      id: 'ar_title',
      header: () => <Text color="gray.400">{t('specializations.arabicTitle')}</Text>,
      cell: (info) => <Text color={textColor} dir="">{info.getValue()}</Text>,
    }),
    columnHelper.accessor('id', {
      id: 'actions',
      header: () => <Text color="gray.400">{t('specializations.actions')}</Text>,
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
            onClick={() => navigate(`/admin/edit-specialization/${info.getValue()}`)}
          />
          {/* <Icon
            w="18px"
            h="18px"
            me="10px"
            color="blue.500"
            as={FaEye}
            cursor="pointer"
            onClick={() => navigate(`/admin/tag-details/${info.getValue()}`)}
          /> */}
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
    <div className="container" >
      <Card flexDirection="column" w="100%" px="0px" overflowX={{ sm: 'scroll', lg: 'hidden' }}>
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text color={textColor} fontSize="22px" fontWeight="700" lineHeight="100%">
            {t('specializations.doctorSpecializations')}
          </Text>
          
          <Flex align="center" gap={4}>
            <InputGroup w={{ base: "100%", md: "200px" }}>
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
                placeholder={t('specializations.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            
            <Button
              variant='darkBrand'
              color='white'
              fontSize='sm'
              fontWeight='500'
              borderRadius='70px'
              px='24px'
              py='5px'
              onClick={() => navigate('/admin/add-specialization')}
              leftIcon={<PlusSquareIcon />}
            >
              {t('specializations.addSpecialization')}
            </Button>
          </Flex>
        </Flex>
        
        <Box>
          <Table variant="simple" color="gray.500" mb="24px" mt="12px" dir="ltr">
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
              {t('specializations.rowsPerPage')}:
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
            {t('specializations.page')} {pagination.page} {t('specializations.of')} {pagination.totalPages}
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
              {t('specializations.previous')}
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={page === pagination.totalPages}
              variant="outline"
              size="sm"
              rightIcon={<ChevronRightIcon />}
            >
              {t('specializations.next')}
            </Button>
          </Flex>
        </Flex>
      </Card>
    </div>
  );
};

export default Specialization;
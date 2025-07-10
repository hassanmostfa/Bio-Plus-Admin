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
import { useGetCategoriesQuery, useDeleteCategoryMutation } from 'api/categorySlice';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper();

const AllCategories = () => {
  const [page, setPage] = React.useState(1); // Current page
  const [limit, setLimit] = React.useState(10); // Items per page
  const [searchQuery, setSearchQuery] = React.useState(''); // Search query
  const { data: categoriesResponse, refetch, isError, isLoading } = useGetCategoriesQuery({ page, limit });
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const navigate = useNavigate();
  const [sorting, setSorting] = React.useState([]);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Extract table data and pagination info
  const tableData = categoriesResponse?.data?.data || [];
  const pagination = categoriesResponse?.data?.pagination || { page: 1, limit: 10, totalItems: 0, totalPages: 1 };

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return tableData; // Return all data if no search query
    return tableData.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [tableData, searchQuery]);

  React.useEffect(() => {
    refetch();
  }, [page, limit, refetch]);

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: t('category.deleteConfirmTitle'),
        text: t('category.deleteConfirmText'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: t('category.deleteConfirmButton'),
      });

      if (result.isConfirmed) {
        await deleteCategory(id).unwrap(); // Delete the category
        refetch(); // Refetch the data
        Swal.fire(t('category.deleteSuccessTitle'), t('category.deleteSuccessText'), 'success');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      Swal.fire(t('common.error'), t('category.deleteError'), 'error');
    }
  };

  // Transform API data into table data format
  const transformedData = React.useMemo(() => {
    return filteredData.map((category, index) => ({
      index: index + 1,
      id: category.id,
      en_name: category.translations.find((t) => t.languageId === 'en')?.name || t('category.notAvailable'),
      ar_name: category.translations.find((t) => t.languageId === 'ar')?.name || t('category.notAvailable'),
      category_type: t('category.notAvailable'), // Replace with actual category type if available
      image: category.image,
    }));
  }, [filteredData, t]);

  const columns = [
    columnHelper.accessor('index', {
      id: 'index',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">{t('common.id')}</Text>
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
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">{t('category.enName')}</Text>
      ),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('ar_name', {
      id: 'ar_name',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">{t('category.arName')}</Text>
      ),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('image', {
      id: 'image',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">{t('category.image')}</Text>
      ),
      cell: (info) => (
        <img
          src={info.getValue()}
          alt="Category Img"
          width={70}
          height={70}
          style={{ borderRadius: '8px' }}
        />
      ),
    }),
    columnHelper.accessor('id', {
      id: 'actions',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">{t('common.actions')}</Text>
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
            onClick={() => handleDelete(info.getValue())}
            title={t('common.delete')}
            aria-label={t('common.delete')}
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="green.500"
            as={EditIcon}
            cursor="pointer"
            onClick={() => navigate(`/admin/edit-category/${info.getValue()}`)}
            title={t('common.edit')}
            aria-label={t('common.edit')}
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="blue.500"
            as={FaEye}
            cursor="pointer"
            onClick={() => navigate(`/admin/edit-category/${info.getValue()}`)}
            title={t('common.view')}
            aria-label={t('common.view')}
          />
        </Flex>
      ),
    }),
  ];

  const table = useReactTable({
    data: transformedData, // Use transformed data
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
    <div className="container" >
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
            textAlign={isRTL ? 'right' : 'left'}
          >
            {t('category.allCategories')}
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
                placeholder={t('category.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                dir={isRTL ? 'rtl' : 'ltr'}
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
            onClick={() => navigate('/admin/add-category')}
            width={'200px'}
          >
            <PlusSquareIcon me="10px" />
            {t('category.addButton')}
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
                            asc: t('common.sortAsc'),
                            desc: t('common.sortDesc'),
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
              {t('common.rowsPerPage')}
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
              dir="ltr"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Select>
          </Flex>
          <Text color={textColor} fontSize="sm">
            {t('common.pageOf', { page: pagination.page, totalPages: pagination.totalPages })}
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
              {t('common.previous')}
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={page === pagination.totalPages}
              variant="outline"
              size="sm"
            >
              {t('common.next')}
              <Icon as={ChevronRightIcon} ml="5px" />
            </Button>
          </Flex>
        </Flex>
      </Card>
    </div>
  );
};

export default AllCategories;
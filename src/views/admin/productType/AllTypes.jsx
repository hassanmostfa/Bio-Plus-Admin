import {
  Box,
  Button,
  Flex,
  Icon,
  Image,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
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
import { EditIcon, PlusSquareIcon } from '@chakra-ui/icons';
import { FaEye, FaTrash } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { useGetTypesQuery, useDeleteTypeMutation } from 'api/typeSlice';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const columnHelper = createColumnHelper();

const AllTypes = () => {
  const navigate = useNavigate();
  const { data: typesResponse, isLoading, isError, refetch } = useGetTypesQuery();
  const [deleteType, { isLoading: isDeleting }] = useDeleteTypeMutation(); // Delete mutation
  const [sorting, setSorting] = React.useState([]);
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

   // Trigger refetch when component mounts (navigates to)
   React.useEffect(() => {
    // Only trigger refetch if the data is not being loaded
    if (!isLoading) {
      refetch(); // Manually trigger refetch when component is mounted
    }
  }, [refetch, isLoading]); // Dependency array to ensure it only runs on mount
  
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Transform API data into table data format
  const tableData = React.useMemo(() => {
    if (!typesResponse?.data?.items) return [];

    return typesResponse.data.items.map((type, index) => ({
      index: index + 1,
      id: type.id,
      product_en_type: type.name, // English name is directly from the type object
      product_ar_type: type.translations.find((t) => t.languageId === 'ar')?.name || 'N/A', // Arabic name from translations
      imageKey: type.imageKey || 'N/A', // Image link from the type object
    }));
  }, [typesResponse]);

  // Handle delete type
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: t('productTypeTable.deleteConfirmationTitle'),
        text: t('productTypeTable.deleteConfirmationText'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: t('productTypeTable.deleteConfirmationButton'),
      });

      if (result.isConfirmed) {
        await deleteType(id).unwrap(); // Delete the type
        refetch(); // Refetch the data
        Swal.fire('Deleted!', t('productTypeTable.deleteSuccessMessage'), 'success');
      }
    } catch (error) {
      console.error('Failed to delete product type:', error);
      Swal.fire('Error!', t('productTypeTable.deleteErrorMessage'), 'error');
    }
  };

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
          {t('productTypeTable.idHeader')}
        </Text>
      ),
      cell: (info) => (
        <Flex align="center">
          <Text color={textColor}>{info.getValue()}</Text>
        </Flex>
      ),
    }),
    columnHelper.accessor('product_en_type', {
      id: 'product_en_type',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('productTypeTable.productEnTypeHeader')}
        </Text>
      ),
      cell: (info) => (
        <Flex align="center">
          <Text color={textColor}>{info.getValue()}</Text>
        </Flex>
      ),
    }),
    columnHelper.accessor('product_ar_type', {
      id: 'product_ar_type',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('productTypeTable.productArTypeHeader')}
        </Text>
      ),
      cell: (info) => (
        <Flex align="center">
          <Text color={textColor}>{info.getValue()}</Text>
        </Flex>
      ),
    }),
    columnHelper.accessor('imageKey', {
      id: 'imageKey',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('productTypeTable.imageKeyHeader')}
        </Text>
      ),
      cell: (info) => (
        <Flex align="center">
          {info.getValue() && info.getValue() !== 'N/A' ? (
            <Image
              src={info.getValue()}
              alt="Product Type Image"
              boxSize="50px"
              objectFit="cover"
              borderRadius="md"
              fallbackSrc="https://via.placeholder.com/50x50?text=No+Image"
            />
          ) : (
            <Text color={textColor} fontSize="sm">
              {t('common.noImage')}
            </Text>
          )}
        </Flex>
      ),
    }),
    columnHelper.accessor('id', {
      id: 'actions',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('productTypeTable.actionsHeader')}
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
            onClick={() => handleDelete(info.getValue())} // Delete action
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="green.500"
            as={EditIcon}
            cursor="pointer"
            onClick={() => navigate(`/admin/edit-product-type/${info.getValue()}`)} // Edit action
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="blue.500"
            as={FaEye}
            cursor="pointer"
            onClick={() => navigate(`/admin/edit-product-type/${info.getValue()}`)} // Edit action
          />
        </Flex>
      ),
    }),
  ];

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  if (isLoading) return <Text>{t('productTypeTable.loadingText')}</Text>;
  if (isError) return <Text>{t('productTypeTable.errorLoadingProductTypes')}</Text>;

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
            {t('productTypeTable.productTypes')}
          </Text>
          <Button
            variant="darkBrand"
            color="white"
            fontSize="sm"
            fontWeight="500"
            borderRadius="70px"
            px="24px"
            py="5px"
            onClick={() => navigate('/admin/add-product-types')}
            width={'230px'}
          >
            <PlusSquareIcon me="10px" />
            {t('productTypeTable.createNewProductType')}
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
      </Card>
    </div>
  );
};

export default AllTypes;
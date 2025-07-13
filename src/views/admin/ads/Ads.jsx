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
import { useGetAdsQuery, useDeleteAdMutation } from 'api/adsSlice';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';


const columnHelper = createColumnHelper();

const Ads = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [page, setPage] = React.useState(1);
  const limit = 10;
  
  const { data: adsResponse, isLoading, refetch } = useGetAdsQuery({ page, limit });
  const [deleteAd] = useDeleteAdMutation();
  React.useEffect(() => {
    refetch();
  }, []);
  const navigate = useNavigate();
  
  const [sorting, setSorting] = React.useState([]);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Transform API data to match table structure
  const tableData = React.useMemo(() => {
    if (!adsResponse?.data) return [];
    
    return adsResponse.data.map(ad => ({
      id: ad.id,
      title: ad.title,
      link: ad.link,
      linkType: ad.linkType,
      image: ad.imageKey, // You might want to use a proper image URL here
      isActive: ad.isActive ? t('ads.active') : t('ads.inactive'),
      order: ad.order,
    }));
  }, [adsResponse, t]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: t('ads.deleteConfirmTitle'),
      text: t('ads.deleteConfirmText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('ads.deleteConfirmButton')
    });

    if (result.isConfirmed) {
      try {
        await deleteAd(id).unwrap();
        await Swal.fire(
          t('ads.deleteSuccessTitle'),
          t('ads.deleteSuccessText'),
          'success'
        );
        refetch();
      } catch (error) {
        await Swal.fire(
          t('ads.deleteErrorTitle'),
          error.message || t('ads.deleteErrorText'),
          'error'
        );
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/cms/edit-ads/${id}`);
  };

  const handleView = (id) => {
    navigate(`/admin/cms/edit-ads/${id}`);
  };

  const columns = [
    columnHelper.accessor('title', {
      id: 'title',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('ads.table.title')}
        </Text>
      ),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('link', {
      id: 'link',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('ads.table.link')}
        </Text>
      ),
      cell: (info) => (
        <Text 
          color={textColor}
          maxW="200px"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('linkType', {
      id: 'linkType',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('ads.table.linkType')}
        </Text>
      ),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('isActive', {
      id: 'isActive',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('ads.table.status')}
        </Text>
      ),
      cell: (info) => (
        <Text 
          color={info.getValue() === t('ads.active') ? 'green.500' : 'red.500'}
          fontWeight="bold"
        >
          {info.getValue()}
        </Text>
      ),
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
          {t('ads.table.image')}
        </Text>
      ),
      cell: (info) => (
        <img
          src={info.getValue()}
          alt="Ad Image"
          width={70}
          height={70}
          style={{ borderRadius: '8px' }}
        />
      ),
    }),
    columnHelper.accessor('actions', {
      id: 'actions',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('ads.table.actions')}
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
            onClick={() => handleEdit(info.row.original.id)}
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="blue.500"
            as={FaEye}
            cursor="pointer"
            onClick={() => handleView(info.row.original.id)}
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

  // Pagination controls
  const PaginationControls = () => {
    if (!adsResponse?.pagination) return null;
    
    const { page: currentPage, totalPages } = adsResponse.pagination;
    
    return (
      <Flex justifyContent="center" mt={4} gap={2}>
        <Button
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          isDisabled={currentPage === 1}
        >
          {t('ads.previous')}
        </Button>
        <Text>
          {t('ads.page')} {currentPage} {t('ads.of')} {totalPages}
        </Text>
        <Button
          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
          isDisabled={currentPage === totalPages}
        >
          {t('ads.next')}
        </Button>
      </Flex>
    );
  };

  if (isLoading) {
    return <div>{t('ads.loading')}</div>;
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
            {t('ads.title')}
          </Text>
          <Button
            variant="darkBrand"
            color="white"
            fontSize="sm"
            fontWeight="500"
            borderRadius="70px"
            px="24px"
            py="5px"
            onClick={() => navigate('/admin/cms/add-ads')}
            width={'200px'}
          >
            <PlusSquareIcon me="10px" />
            {t('ads.createNewAd')}
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
          <PaginationControls />
        </Box>
      </Card>
    </div>
  );
};

export default Ads;
import { Box, Text, Flex, Button, Table, Thead, Tbody, Tr, Th, Td, useColorModeValue, Icon, Image, Badge, useToast, Spinner } from '@chakra-ui/react';
import React, { useState, useMemo, useRef } from 'react';
import Card from 'components/card/Card';
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { useGetBannersQuery, useDeleteBannerMutation } from 'api/homeBannerSlice';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const columnHelper = createColumnHelper();

const HomeBanners = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const toast = useToast();
  const [bannerToDelete, setBannerToDelete] = useState(null);

  const { data: bannersResponse, isLoading, isError, error, refetch } = useGetBannersQuery();
  console.log("data : " , bannersResponse);
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();

  const banners = useMemo(() => bannersResponse?.data || [], [bannersResponse]);
   
  const handleDeleteClick = (bannerId) => {
    Swal.fire({
      title: t('homeBanners.deleteConfirmTitle'),
      text: t('homeBanners.deleteConfirmText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('homeBanners.deleteConfirmButton')
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteBanner(bannerId).unwrap();
          Swal.fire(
            t('homeBanners.deleteSuccessTitle'),
            t('homeBanners.deleteSuccessText'),
            'success'
          );
          refetch(); // Refetch banners after deletion
        } catch (error) {
          Swal.fire(
            t('homeBanners.deleteErrorTitle'),
            error?.data?.message || t('homeBanners.deleteErrorText'),
            'error'
          );
        }
      }
    });
  };

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  const columns = useMemo(() => [
    columnHelper.accessor('imageKey', {
      header: t('homeBanners.table.image'),
      cell: (info) => (
        <Image src={info.getValue()} boxSize="50px" objectFit="cover" fallbackSrc="https://via.placeholder.com/50" />
      ),
    }),
    columnHelper.accessor('textEn', {
      header: t('homeBanners.table.titleEnglish'),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('textAr', {
      header: t('homeBanners.table.titleArabic'),
      cell: (info) => <Text color={textColor} dir="rtl">{info.getValue()}</Text>,
    }),
    columnHelper.accessor('link', {
      header: t('homeBanners.table.link'),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('order', {
      header: t('homeBanners.table.order'),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('isActive', {
      header: t('homeBanners.table.active'),
      cell: (info) => (
        <Badge colorScheme={info.getValue() ? 'green' : 'red'}>
          {info.getValue() ? t('homeBanners.yes') : t('homeBanners.no')}
        </Badge>
      ),
    }),
    columnHelper.accessor('id', {
      header: t('homeBanners.table.actions'),
      cell: (info) => (
        <Flex>
          <Icon
            as={FaEdit}
            w="18px"
            h="18px"
            me="10px"
            color="green.500"
            cursor="pointer"
            onClick={() => navigate(`/admin/home-banner/edit/${info.getValue()}`)} // Assuming edit route
          />
          <Icon
            as={FaTrashAlt}
            w="18px"
            h="18px"
            color="red.500"
            cursor="pointer"
            onClick={() => handleDeleteClick(info.getValue())}
          />
        </Flex>
      ),
    }),
  ], [textColor, navigate, t]);

  const table = useReactTable({
    data: banners,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), // Optional: if you want sorting
    // Add pagination state and handlers if needed
  });

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Card flexDirection="column" w="100%" px="0px" overflowX={{ sm: 'scroll', lg: 'hidden' }}>
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text color={textColor} fontSize="22px" fontWeight="700">{t('homeBanners.title')}</Text>
          <Button
            variant="darkBrand"
            color="white"
            fontSize="sm"
            fontWeight="500"
            borderRadius="70px"
            px="24px"
            py="5px"
            onClick={() => navigate('/admin/home-banner/add')} // Assuming add route
          >
            {t('homeBanners.addNewBanner')}
          </Button>
        </Flex>

        {isLoading ? (
          <Flex justifyContent="center" alignItems="center" height="200px">
            <Spinner size="xl" />
          </Flex>
        ) : isError ? (
          <Flex justifyContent="center" alignItems="center" height="200px">
            <Text color="red.500">{t('homeBanners.loadErrorText')}: {error.message}</Text>
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" color="gray.500" mb="24px" mt="12px">
              <Thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <Tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <Th
                        key={header.id}
                        colSpan={header.colSpan}
                        pe="10px"
                        borderColor={borderColor}
                        cursor="pointer"
                        onClick={header.column.getToggleSortingHandler?.()}
                      >
                        <Flex
                          justifyContent="space-between"
                          align="center"
                          fontSize={{ sm: '10px', lg: '12px' }}
                          color="gray.400"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {/* Add sorting icon here if sorting is enabled */}
                        </Flex>
                      </Th>
                    ))}
                  </Tr>
                ))}
              </Thead>
              <Tbody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <Tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <Td key={cell.id} borderColor="transparent">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Td>
                      ))}
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={columns.length} textAlign="center" py="40px">
                      <Text color={textColor}>{t('homeBanners.noBannersFound')}</Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        )}

      </Card>
    </Box>
  );
};

export default HomeBanners; 
import React, { useState } from "react";
import {
  Box,
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
  Switch,
  Button,
  useToast,
  Skeleton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Card
} from "@chakra-ui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FaEye, FaTrash, FaFileExport, FaFileImport, FaDownload, FaUpload } from "react-icons/fa6";
import { EditIcon, PlusSquareIcon, ChevronDownIcon } from "@chakra-ui/icons";
import {FaSearch} from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { useGetProductsQuery, useDeleteProductMutation, useUpdateProductMutation } from "api/productSlice";
import Swal from "sweetalert2";
import Pagination from "theme/components/Pagination";
import * as XLSX from 'xlsx';
import { useDownloadTemplateQuery } from "api/productSlice";
import { useUploadProductsMutation } from "api/productSlice";
import { useTranslation } from "react-i18next";
import FormWrapper from "components/FormWrapper";

const columnHelper = createColumnHelper();

const Products = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const { data: productsResponse, isLoading, isFetching, refetch } = useGetProductsQuery({ 
    page, 
    limit, 
    search: debouncedSearchTerm 
  });
  const [deleteProduct] = useDeleteProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const { data: templateData, isLoading: isTemplateLoading } = useDownloadTemplateQuery();
  const [uploadProducts] = useUploadProductsMutation();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  // Extract products and pagination data from response
  const products = productsResponse?.data || [];
  const pagination = productsResponse?.pagination || {
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1
  };

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when limit changes
  React.useEffect(() => {
    setPage(1);
  }, [limit]);

  // Trigger refetch when component mounts (navigates to)
  React.useEffect(() => {
    if (!isLoading) {
      refetch();
    }
  }, [refetch, isLoading]);

  const toggleStatus = async (productId, currentStatus) => {
    try {
      await updateProduct({
        id: productId,
        data: { isActive: !currentStatus }
      }).unwrap();
      toast({
        title: t('product.statusUpdateSuccess'),
        description: '',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
    } catch (err) {
      toast({
        title: t('product.statusUpdateError'),
        description: err.data?.message || t('product.statusUpdateError'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const togglePublish = async (productId, currentPublished) => {
    try {
      await updateProduct({
        id: productId,
        data: { isPublished: !currentPublished }
      }).unwrap();
      toast({
        title: t('product.publishUpdateSuccess'),
        description: '',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
    } catch (err) {
      toast({
        title: t('product.publishUpdateError'),
        description: err.data?.message || t('product.publishUpdateError'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (productId) => {
    const result = await Swal.fire({
      title: t('product.deleteConfirmTitle'),
      text: t('product.deleteConfirmText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('product.deleteConfirmButton')
    });

    if (result.isConfirmed) {
      try {
        await deleteProduct(productId).unwrap();
        refetch();
        toast({
          title: t('product.deleteSuccessTitle'),
          description: t('product.deleteSuccessText'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (err) {
        toast({
          title: t('product.deleteError'),
          description: err.data?.message || t('product.deleteError'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  // Export to Excel function
  const exportToExcel = async () => {
    try {
      // Show loading toast
      toast({
        title: t('product.exportingTitle'),
        description: t('product.exportingText'),
        status: 'info',
        duration: 2000,
        isClosable: true,
      });

      // Fetch all products for export (with a large limit to get all products)
      const allProductsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'https://back.biopluskw.com/api/v1'}/admin/products?page=1&limit=10000&search=${debouncedSearchTerm}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!allProductsResponse.ok) {
        throw new Error('Failed to fetch all products');
      }

      const allProductsData = await allProductsResponse.json();
      const allProducts = allProductsData.data || [];

      // Debug: Log the first product to see actual field names
      if (allProducts.length > 0) {
        console.log('Sample product data structure:', allProducts[0]);
      }

      if (allProducts.length === 0) {
        toast({
          title: t('product.noDataToExport'),
          description: t('product.noProductsFound'),
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const data = allProducts.map(product => ({
        'Product ID': product.id,
        'Name (English)': product.name,
        'Description (English)': product.description || product.descriptionEn || '',
        'Description (Arabic)': product.descriptionAr || product.arabicDescription || '',
        'Category': product.categoryName || product.category?.name || '',
        'Product Type': product.productTypeName || product.productType?.name || '',
        'Brand': product.brandName || product.brand?.name || '',
        'SKU': product.sku || '',
        'Price': product.price || 0,
        'Discount': product.discount || 0,
        'Discount Type': product.discountType || '',
        'Stock Quantity': product.quantity || product.stockQuantity || 0,
        'Lot Number': product.lotNumber || '',
        'Expiry Date': product.expiryDate || '',
        'How To Use (English)': product.howToUse || product.howToUseEn || '',
        'How To Use (Arabic)': product.howToUseAr || product.arabicHowToUse || '',
        'Treatment (English)': product.treatment || product.treatmentEn || '',
        'Treatment (Arabic)': product.treatmentAr || product.arabicTreatment || '',
        'Ingredients (English)': product.ingredients || product.ingredientsEn || '',
        'Ingredients (Arabic)': product.ingredientsAr || product.arabicIngredients || '',
        'Status': product.isActive ? 'Active' : 'Inactive',
        'Published': product.isPublished ? 'Yes' : 'No',
        'Created At': product.createdAt || '',
        'Updated At': product.updatedAt || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

      // Generate filename with current date
      const date = new Date().toISOString().slice(0, 10);
      const fileName = `Products_${date}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast({
        title: t('product.exportSuccessTitle'),
        description: `${t('product.exportSuccessText')} (${allProducts.length} products)`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t('product.exportErrorTitle'),
        description: t('product.exportErrorText'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Import from Excel function
  const handleFileImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadProducts(formData).unwrap();
      
      toast({
        title: t('product.importSuccessTitle'),
        description: t('product.importSuccessText'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh the products list
      refetch();
    } catch (err) {
      toast({
        title: t('product.importErrorTitle'),
        description: err.data?.message || t('product.importErrorText'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const columns = [
    columnHelper.accessor("name", {
      id: "name",
      header: () => <Text color="gray.400">{t('product.productName')}</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("categoryName", {
      id: "category",
      header: () => <Text color="gray.400">{t('product.category')}</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("price", {
      id: "price",
      header: () => <Text color="gray.400">{t('product.sellingPrice')}</Text>,
      cell: (info) => <Text color={textColor}> {info.getValue()} kwd</Text>,
    }),
    columnHelper.accessor("quantity", {
      id: "quantity",
      header: () => <Text color="gray.400">{t('product.stockLevel')}</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("isActive", {
      id: "status",
      header: () => <Text color="gray.400">{t('common.status')}</Text>,
      cell: (info) => (
        <Switch
          colorScheme="green"
          isChecked={info.getValue()}
          onChange={() => toggleStatus(info.row.original.id, info.getValue())}
          isDisabled={isFetching}
        />
      ),
    }),
    columnHelper.accessor("isPublished", {
      id: "publish",
      header: () => <Text color="gray.400">{t('product.published')}</Text>,
      cell: (info) => (
        <Switch
          colorScheme="blue"
          isChecked={info.getValue()}
          onChange={() => togglePublish(info.row.original.id, info.getValue())}
          isDisabled={isFetching}
        />
      ),
    }),
    columnHelper.accessor("row", {
      id: "actions",
      header: () => <Text color="gray.400">{t('common.actions')}</Text>,
      cell: (info) => (
        <Flex>
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="blue.500"
            as={FaEye}
            cursor="pointer"
            onClick={() => navigate(`/admin/products/${info.row.original.id}`)}
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="green.500"
            as={EditIcon}
            cursor="pointer"
            onClick={() => navigate(`/admin/edit-product/${info.row.original.id}`)}
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="red.500"
            as={FaTrash}
            cursor="pointer"
            onClick={() => handleDelete(info.row.original.id)}
          />
        </Flex>
      ),
    }),
  ];

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="container">
      <Card flexDirection="column" w="100%" pt={"20px"} px="0px" overflowX="auto">
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            {t('product.title')}
          </Text>
          <Flex>
            <Button
              variant="darkBrand"
              color="white"
              fontSize="sm"
              fontWeight="500"
              borderRadius="70px"
              px="24px"
              py="5px"
              onClick={() => navigate("/admin/add-product")}
              width={"200px"}
              mr={3}
            >
              <PlusSquareIcon me="10px" />
              {t('product.addProduct')}
            </Button>
            
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                leftIcon={<FaFileExport />}
                variant="outline"
                colorScheme="blue"
              >
                {t('product.export')}
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FaDownload />} onClick={exportToExcel}>
                  {t('product.exportToExcel')}
                </MenuItem>
              </MenuList>
            </Menu>
            
            <Box ml={3} position="relative">
              <Button
                as="label"
                leftIcon={<FaUpload />}
                variant="outline"
                colorScheme="green"
                htmlFor="file-import"
                cursor="pointer"
              >
                {t('product.import')}
                <input
                  type="file"
                  id="file-import"
                  accept=".xlsx,.xls,.csv,.json"
                  onChange={handleFileImport}
                  style={{ display: 'none' }}
                />
              </Button>
            </Box>
            <Box ml={3}>
              <Button
                leftIcon={<FaDownload />}
                variant="outline"
                colorScheme="blue"
                onClick={() => {
                  if (templateData) {
                    const url = window.URL.createObjectURL(templateData);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'product_template.xlsx';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    toast({
                      title: t('product.downloadStartedTitle'),
                      description: t('product.downloadStartedText'),
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                    });
                  }
                }}
                isLoading={isTemplateLoading}
                disabled={isTemplateLoading}
              >
                {t('product.downloadTemplate')}
              </Button>
            </Box>
          </Flex>
        </Flex>
        
        {/* Search Input */}
        <Flex px="25px" mb="20px">
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <FaSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder={t('product.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              borderRadius="20px"
            />
          </InputGroup>
        </Flex>
        
        <Box>
          {isLoading ? (
            <Box p="20px">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height="40px" mb="10px" />
              ))}
            </Box>
          ) : (
            <>
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
                        <Text color={textColor}>{t('common.noData')}</Text>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Flex justifyContent="center" mt={4} pb={4}>
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(newPage) => setPage(newPage)}
                    limit={limit}
                    onLimitChange={setLimit}
                    labelRowsPerPage={t('table.rowsPerPage')}
                    labelPrevious={t('table.previous')}
                    labelNext={t('table.next')}
                    labelPageOf={t('table.pageOf', { page: pagination.page, totalPages: pagination.totalPages })}
                  />
                </Flex>
              )}
            </>
          )}
        </Box>
      </Card>
    </div>
  );
};

export default Products;
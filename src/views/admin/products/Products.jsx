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
  Skeleton
} from "@chakra-ui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FaEye, FaTrash } from "react-icons/fa6";
import { EditIcon, PlusSquareIcon } from "@chakra-ui/icons";
import Card from "components/card/Card";
import { useNavigate } from "react-router-dom";
import { useGetProductsQuery, useDeleteProductMutation, useUpdateProductMutation } from "api/productSlice";
import Swal from "sweetalert2";
import Pagination from "theme/components/Pagination";


const columnHelper = createColumnHelper();

const Products = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: productsResponse, isLoading, isFetching, refetch } = useGetProductsQuery({ page, limit });
  const [deleteProduct] = useDeleteProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const navigate = useNavigate();
  const toast = useToast();

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

   // Trigger refetch when component mounts (navigates to)
   React.useEffect(() => {
    // Only trigger refetch if the data is not being loaded
    if (!isLoading) {
      refetch(); // Manually trigger refetch when component is mounted
    }
  }, [refetch, isLoading]); // Dependency array to ensure it only runs on mount

  // Function to handle status toggle
  const toggleStatus = async (productId, currentStatus) => {
    // try {
    //   await updateProduct({
    //     id: productId,
    //     isActive: !currentStatus
    //   }).unwrap();
      
    //   toast({
    //     title: "Success",
    //     description: "Product status updated successfully",
    //     status: "success",
    //     duration: 3000,
    //     isClosable: true,
    //   });
    // } catch (err) {
    //   toast({
    //     title: "Error",
    //     description: err.data?.message || "Failed to update product status",
    //     status: "error",
    //     duration: 5000,
    //     isClosable: true,
    //   });
    // }
  };

  // Function to handle publish toggle
  const togglePublish = async (productId, currentPublished) => {
    // try {
    //   await updateProduct({
    //     id: productId,
    //     isPublished: !currentPublished
    //   }).unwrap();
      
    //   toast({
    //     title: "Success",
    //     description: "Product publish status updated successfully",
    //     status: "success",
    //     duration: 3000,
    //     isClosable: true,
    //   });
    // } catch (err) {
    //   toast({
    //     title: "Error",
    //     description: err.data?.message || "Failed to update product publish status",
    //     status: "error",
    //     duration: 5000,
    //     isClosable: true,
    //   });
    // }
  };

  // Function to handle delete with confirmation
  const handleDelete = async (productId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        await deleteProduct(productId).unwrap();
        refetch();
        toast({
          title: "Deleted!",
          description: "Product has been deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (err) {
        toast({
          title: "Error",
          description: err.data?.message || "Failed to delete product",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const columns = [
    columnHelper.accessor("name", {
      id: "name",
      header: () => <Text color="gray.400">Product Name</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("categoryName", {
      id: "category",
      header: () => <Text color="gray.400">Category</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("price", {
      id: "price",
      header: () => <Text color="gray.400">Price</Text>,
      cell: (info) => <Text color={textColor}>${info.getValue()}</Text>,
    }),
    columnHelper.accessor("quantity", {
      id: "quantity",
      header: () => <Text color="gray.400">Stock</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("isActive", {
      id: "status",
      header: () => <Text color="gray.400">Status</Text>,
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
      header: () => <Text color="gray.400">Publish</Text>,
      cell: (info) => (
        <Switch
          colorScheme="blue"
          isChecked={info.getValue()}
          onChange={() => togglePublish(info.row.original.id, info.getValue())}
          isDisabled={isFetching}
        />
      ),
    }),
    columnHelper.accessor("actions", {
      id: "actions",
      header: () => <Text color="gray.400">Actions</Text>,
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
      <Card flexDirection="column" w="100%" px="0px" overflowX="auto">
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            Products
          </Text>
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
          >
            <PlusSquareIcon me="10px" />
            Add Product
          </Button>
        </Flex>
        
        <Box>
          {isLoading ? (
            // Loading skeleton
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
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Flex justifyContent="center" mt={4} pb={4}>
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(newPage) => setPage(newPage)}
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
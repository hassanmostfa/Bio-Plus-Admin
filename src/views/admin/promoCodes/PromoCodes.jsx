import React, { useEffect, useState } from "react";
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
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Select,
  Badge,
} from "@chakra-ui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FaEye, FaTrash } from "react-icons/fa6";
import { EditIcon, PlusSquareIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import Card from "components/card/Card";
import { useNavigate } from "react-router-dom";
import { useGetPromocodesQuery } from "api/promocodeSlice";
import Swal from "sweetalert2";
import { FaSearch } from "react-icons/fa";
import { useDeletePromocodeMutation } from "api/promocodeSlice";

const columnHelper = createColumnHelper();

const PromoCodes = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: promocodesResponse, isLoading, refetch } = useGetPromocodesQuery({ page, limit });
    useEffect(()=>{
        refetch();
    },[]);
    const bg = useColorModeValue('secondaryGray.300', 'gray.700'); 
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  
  // Extract table data and pagination info
  const tableData = promocodesResponse?.data || [];
  const pagination = promocodesResponse?.pagination || { page: 1, limit: 10, totalItems: 0, totalPages: 1 };
  const [deletePromoCode] = useDeletePromocodeMutation();
  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return tableData;
    return tableData.filter((promo) =>
      Object.values(promo).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [tableData, searchQuery]);

  // Function to toggle status
//   const toggleStatus = async (id, currentStatus) => {
//     try {
//       const newStatus = !currentStatus;
//       await updateStatus({ id, isActive: newStatus }).unwrap();
//       refetch();
//       Swal.fire(
//         'Success!',
//         `Promo code ${newStatus ? 'activated' : 'deactivated'} successfully.`,
//         'success'
//       );
//     } catch (error) {
//       console.error('Failed to update status:', error);
//       Swal.fire('Error!', 'Failed to update promo code status.', 'error');
//     }
//   };

  const columns = [
    columnHelper.accessor("code", {
      id: "code",
      header: () => <Text color="gray.400">Code</Text>,
      cell: (info) => <Text color={textColor} fontWeight="600">{info.getValue()}</Text>,
    }),
    columnHelper.accessor("type", {
      id: "type",
      header: () => <Text color="gray.400">Type</Text>,
      cell: (info) => (
        <Badge
          colorScheme={info.getValue() === "FIXED" ? "blue" : "purple"}
          px={2}
          py={1}
          borderRadius="md"
          textTransform="capitalize"
        >
          {info.getValue().toLowerCase()}
        </Badge>
      ),
    }),
    columnHelper.accessor("amount", {
      id: "amount",
      header: () => <Text color="gray.400">Amount</Text>,
      cell: (info) => (
        <Text color={textColor}>
          {info.row.original.type === "FIXED" ? `$${info.getValue()}` : `${info.getValue()}%`}
        </Text>
      ),
    }),
    columnHelper.accessor("endDate", {
      id: "endDate",
      header: () => <Text color="gray.400">End Date</Text>,
      cell: (info) => (
        <Text color={textColor}>
          {new Date(info.getValue()).toLocaleDateString()}
        </Text>
      ),
    }),
    columnHelper.accessor("maxUsage", {
      id: "maxUsage",
      header: () => <Text color="gray.400">Max Usage</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("countUsage", {
      id: "countUsage",
      header: () => <Text color="gray.400">Used</Text>,
      cell: (info) => (
        <Text color={textColor}>
          {info.getValue()}/{info.row.original.maxUsage}
        </Text>
      ),
    }),
    columnHelper.accessor("isActive", {
      id: "status",
      header: () => <Text color="gray.400">Status</Text>,
      cell: (info) => (
        <Switch
          colorScheme="green"
          isChecked={info.getValue()}
        //   onChange={() => toggleStatus(info.row.original.id, info.getValue())}
        />
      ),
    }),
    columnHelper.accessor("id", {
      id: "actions",
      header: () => <Text color="gray.400">Actions</Text>,
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
            onClick={() => navigate(`/admin/edit-promo-code/${info.getValue()}`)} 
          />
          <Icon 
            w="18px" 
            h="18px" 
            me="10px" 
            color="blue.500" 
            as={FaEye} 
            cursor="pointer" 
            onClick={() => navigate(`/admin/promo-code-details/${info.getValue()}`)} 
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

  // Handle delete promo code
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      });

      if (result.isConfirmed) {
        await deletePromoCode(id).unwrap();
        refetch();
        Swal.fire('Deleted!', 'The promo code has been deleted.', 'success');
      }
    } catch (error) {
      console.error('Failed to delete promo code:', error);
      Swal.fire('Error!', 'Failed to delete the promo code.', 'error');
    }
  };

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

  return (
    <div className="container">
      <Card flexDirection="column" w="100%" px="0px" overflowX={{ sm: 'scroll', lg: 'hidden' }}>
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text color={textColor} fontSize="22px" fontWeight="700" lineHeight="100%">
            Promo Codes
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
                bg = {bg}
                color={textColor}
                fontWeight="500"
                _placeholder={{ color: 'gray.400', fontSize: '14px' }}
                borderRadius="30px"
                placeholder="Search..."
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
              onClick={() => navigate('/admin/add-promo-code')}
              leftIcon={<PlusSquareIcon />}
            >
              Add Promo Code
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
              Rows per page:
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
            Page {pagination.page} of {pagination.totalPages}
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
              Previous
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={page === pagination.totalPages}
              variant="outline"
              size="sm"
              rightIcon={<ChevronRightIcon />}
            >
              Next
            </Button>
          </Flex>
        </Flex>
      </Card>
    </div>
  );
};

export default PromoCodes;
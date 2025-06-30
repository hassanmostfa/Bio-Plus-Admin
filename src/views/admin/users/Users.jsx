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
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
} from "@chakra-ui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FaEye, FaTrash, FaSearch } from "react-icons/fa";
import { EditIcon, ChevronDownIcon } from "@chakra-ui/icons";
import Card from "components/card/Card";
import { useNavigate } from "react-router-dom";
import { useGetUsersQuery, useUpdateUserMutation } from "api/clientSlice";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import FormWrapper from "components/FormWrapper";

const columnHelper = createColumnHelper();

const Users = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const { data: usersData, isLoading, refetch } = useGetUsersQuery({
    page:1,
    limit:10000000000000,
    search: debouncedSearchTerm,
    status: statusFilter,
  });
  const [updateStatus] = useUpdateUserMutation();

  const allUsers = usersData?.data || [];
  const totalPages = usersData?.totalPages || 1;
  const totalItems = usersData?.totalItems || 0;

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when status filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `You are about to change the user's status to ${newStatus}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, update it!'
      });
      
      if (result.isConfirmed) {
        await updateStatus({ id: userId, data: { status: newStatus } }).unwrap();
        await refetch();
        toast({
          title: 'Status updated',
          description: `User status has been changed to ${newStatus}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error updating status',
        description: error.message || 'Failed to update user status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const columns = [
    columnHelper.accessor("name", {
      id: "name",
      header: () => <Text color="gray.400">{t('common.name')}</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("email", {
      id: "email",
      header: () => <Text color="gray.400">{t('common.email')}</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("gender", {
      id: "gender",
      header: () => <Text color="gray.400">Gender</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("phoneNumber", {
      id: "phone",
      header: () => <Text color="gray.400">{t('common.phone')}</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("status", {
      id: "status",
      header: () => <Text color="gray.400">{t('common.status')}</Text>,
      cell: (info) => (
        <Text 
          color={info.getValue() === 'ACTIVE' ? 'green.500' : 
                info.getValue() === 'SUSPENDED' ? 'red.500' :
                info.getValue() === 'PENDING' ? 'orange.500' : 'gray.500'}
          fontWeight="bold"
        >
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("actions", {
      id: "actions",
      header: () => <Text color="gray.400">{t('common.actions')}</Text>,
      cell: (info) => (
        <Flex alignItems="center"> 
          <Icon 
            w="18px" 
            h="18px" 
            me="10px" 
            color="green.500" 
            onClick={() => navigate(`/admin/users/edit/${info.row.original.id}`)} 
            title="Edit User" 
            as={EditIcon} 
            cursor="pointer" 
          />
          <Menu>
            <MenuButton 
              as={Button} 
              rightIcon={<ChevronDownIcon />} 
              size="sm" 
              variant="outline"
              colorScheme="teal"
            >
              {t('common.edit')} {t('common.status')}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => handleStatusUpdate(info.row.original.id, 'PENDING')}>PENDING</MenuItem>
              <MenuItem onClick={() => handleStatusUpdate(info.row.original.id, 'ACTIVE')}>ACTIVE</MenuItem>
              <MenuItem onClick={() => handleStatusUpdate(info.row.original.id, 'SUSPENDED')}>SUSPENDED</MenuItem>
              <MenuItem onClick={() => handleStatusUpdate(info.row.original.id, 'BLOCKED')}>BLOCKED</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      ),
    }),
  ];

  const table = useReactTable({
    data: allUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="container">
      <Card flexDirection="column" w="100%" px="0px" overflowX="auto">
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text color={textColor} fontSize="22px" fontWeight="700">{t('common.users')}</Text>
          <HStack spacing={4}>
            <FormWrapper>
              <Box width="300px">
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type="text"
                    placeholder={t('common.search') + ' ' + t('common.users').toLowerCase() + '...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    bg={useColorModeValue("white", "gray.700")}
                    borderRadius="10px"
                  />
                </InputGroup>
              </Box>
              <Select
                placeholder={t('common.search') + ' ' + t('common.status').toLowerCase()}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                width="200px"
              >
                <option value="">All {t('common.status')}</option>
                <option value="PENDING">PENDING</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="BLOCKED">BLOCKED</option>
              </Select>
            </FormWrapper>
          </HStack>

          <Button
            variant="darkBrand"
            color="white"
            fontSize="sm"
            fontWeight="500"
            borderRadius="70px"
            px="24px"
            py="5px"
            onClick={() => navigate("/admin/add-user")}
            width={"200px"}
          >
            {t('common.add')} {t('common.users')}
          </Button>
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

          {/* Pagination Controls */}
          <Flex justifyContent="space-between" alignItems="center" px="25px" pb="20px">
            <Text color={textColor}>
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalItems)} of {totalItems} entries
            </Text>
            <HStack spacing={2}>
              <Button
                size="sm"
                onClick={() => setPage(page - 1)}
                isDisabled={page === 1}
              >
                {t('common.previous')}
              </Button>
              <Text color={textColor}>Page {page} of {totalPages}</Text>
              <Button
                size="sm"
                onClick={() => setPage(page + 1)}
                isDisabled={page === totalPages}
              >
                {t('common.next')}
              </Button>
            </HStack>
          </Flex>
        </Box>
      </Card>
    </div>
  );
};

export default Users;
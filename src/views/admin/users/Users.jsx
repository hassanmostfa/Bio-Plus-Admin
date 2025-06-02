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

const columnHelper = createColumnHelper();

const Users = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: usersData,loading:isLoading , refetch } = useGetUsersQuery({ page: 1, limit: 100000 });
  const [updateStatus] = useUpdateUserMutation();
  
  const allUsers = usersData?.data || [];
  const [filteredUsers, setFilteredUsers] = useState(allUsers);
  const [searchTerm, setSearchTerm] = useState("");
  
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  // Trigger refetch when component mounts (navigates to)
  React.useEffect(() => {
    if (!isLoading) {
      refetch();
    }
  }, [refetch, isLoading]);

  // Apply search filter whenever searchTerm or allUsers changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, allUsers]);

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
      header: () => <Text color="gray.400">Name</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("email", {
      id: "email",
      header: () => <Text color="gray.400">Email</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("gender", {
      id: "gender",
      header: () => <Text color="gray.400">Gender</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("phoneNumber", {
      id: "phone",
      header: () => <Text color="gray.400">Phone</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("status", {
      id: "status",
      header: () => <Text color="gray.400">Status</Text>,
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
      header: () => <Text color="gray.400">Actions</Text>,
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
              Edit Status
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
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="container">
      <Card flexDirection="column" w="100%" px="0px" overflowX="auto">
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text color={textColor} fontSize="22px" fontWeight="700">Users</Text>
          <Box width="300px">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={useColorModeValue("white", "gray.700")}
                borderRadius="10px"
              />
            </InputGroup>
          </Box>

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
            Add User
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
                    <Text color={textColor}>No users found matching your search</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Card>
    </div>
  );
};

export default Users;
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Spinner,
} from "@chakra-ui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FaEye, FaTrash, FaSearch } from "react-icons/fa";
import { EditIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
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
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [blockedReason, setBlockedReason] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);

  const { data: usersData, isLoading, isError, refetch } = useGetUsersQuery({
    page,
    limit,
    search: debouncedSearchTerm,
    status: statusFilter,
  }, {
    refetchOnMountOrArgChange: true,
  });
  const [updateStatus] = useUpdateUserMutation();

  // Extract table data and pagination info
  const users = usersData?.data || [];
  
  // Check if API returned pagination data, if not implement client-side pagination
  const hasServerPagination = usersData?.pagination;
  const pagination = usersData?.pagination || { page: 1, limit: 10, totalItems: users.length, totalPages: Math.ceil(users.length / limit) };

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    refetch();
  }, [page, limit, debouncedSearchTerm, statusFilter, refetch]);

  // Reset to first page when status filter, limit, or search changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter, limit, debouncedSearchTerm]);

  // Pagination handlers
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
  };

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

  const handleBlockUser = (userId) => {
    setSelectedUserId(userId);
    setBlockedReason("");
    onOpen();
  };

  const handleConfirmBlock = async () => {
    if (!blockedReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for blocking the user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await updateStatus({ 
        id: selectedUserId, 
        data: { 
          status: 'BLOCKED',
          blockedReason: blockedReason.trim()
        } 
      }).unwrap();
      
      await refetch();
      onClose();
      setBlockedReason("");
      setSelectedUserId(null);
      
      toast({
        title: 'User blocked',
        description: 'User has been blocked successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error blocking user',
        description: error.message || 'Failed to block user',
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
      header: () => <Text color="gray.400">{t('user.gender')}</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("phoneNumber", {
      id: "phone",
      header: () => <Text color="gray.400">{t('common.phone')}</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("createdBy", {
      id: "createdBy",
      header: () => <Text color="gray.400">{t('userTable.createdBy')}</Text>,
      cell: (info) => (
        <Text color={textColor} fontSize="sm">
          {info.getValue() || t('userTable.unknown')}
        </Text>
      ),
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
    columnHelper.accessor("createdAt", {
      id: "createdAt",
      header: () => <Text color="gray.400">{t('common.createdAt')}</Text>,
      cell: (info) => {
        const date = new Date(info.getValue());
        const formattedDate = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        return (
          <Text color={textColor} fontSize="sm">
            {formattedDate}
          </Text>
        );
      },
    }),
    columnHelper.accessor("row", {
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
              <MenuItem onClick={() => handleStatusUpdate(info.row.original.id, 'PENDING')}>{t('common.pending')}</MenuItem>
              <MenuItem onClick={() => handleStatusUpdate(info.row.original.id, 'ACTIVE')}>{t('common.active')}</MenuItem>
              <MenuItem onClick={() => handleStatusUpdate(info.row.original.id, 'SUSPENDED')}>{t('common.suspended')}</MenuItem>
              <MenuItem onClick={() => handleBlockUser(info.row.original.id)}>{t('common.blocked')}</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      ),
    }),
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="container">
      <Card flexDirection="column" w="100%" px="0px" overflowX="auto">
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text 
            color={textColor} 
            fontSize="22px" 
            fontWeight="700"
            textAlign={isRTL ? 'right' : 'left'}
          >
            {t('common.users')}
          </Text>
          <HStack spacing={4} align="center">
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
                  dir={t('direction.ltr')}
                />
              </InputGroup>
            </Box>
            <Box width="200px">
              <Select
                placeholder={t('common.search') + ' ' + t('common.status').toLowerCase()}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                dir={t('direction.ltr')}
              >
                <option value="">{t('common.all')} {t('common.status')}</option>
                <option value="PENDING">{t('common.pending')}</option>
                <option value="ACTIVE">{t('common.active')}</option>
                <option value="SUSPENDED">{t('common.suspended')}</option>
                <option value="BLOCKED">{t('common.blocked')}</option>
              </Select>
            </Box>
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
          {isLoading ? (
            <Flex justify="center" align="center" py="50px">
              <Spinner size="lg" />
            </Flex>
          ) : isError ? (
            <Flex justify="center" align="center" py="50px">
              <Text color="red.500">{t('common.errorLoadingData')}</Text>
            </Flex>
          ) : (
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
          )}

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
        </Box>
      </Card>

      {/* Block User Modal */}
      <Modal isOpen={isOpen} onClose={onClose} width="500px" height="500px">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('common.blockUser')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4} color={textColor}>
              {t('common.pleaseProvideReason')}
            </Text>
            <Textarea
              value={blockedReason}
              onChange={(e) => setBlockedReason(e.target.value)}
              placeholder={t('common.enterBlockReason')}
              size="md"
              resize="vertical"
              minH="120px"
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleConfirmBlock}>
              {t('common.blockUser')}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              {t('common.cancel')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Users;
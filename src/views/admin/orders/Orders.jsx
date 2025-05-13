import {
  Box,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
  Badge,
  Image,
  useToast,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React, { useState, useEffect } from 'react';
import Card from 'components/card/Card';
import { FaEye } from 'react-icons/fa6';
import { IoMdPrint } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { useGetOrdersQuery } from 'api/orderSlice';
import { useGetDocumentsQuery } from 'api/documentSlice';


const columnHelper = createColumnHelper();

const Orders = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  
  // Filters state
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    startDate: '',
    endDate: '',
  });


  // Fetch orders with pagination and filters
  const { data: ordersResponse, isLoading, refetch } = useGetOrdersQuery({
    page: pagination.page,
    limit: pagination.limit,
    ...filters
  });

  const orders = ordersResponse?.data || [];
  const totalItems = ordersResponse?.pagination?.totalItems || 0;
  const totalPages = ordersResponse?.pagination?.totalPages || 1;

  // Format date for display
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }) : 'N/A';
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Apply filters (triggers automatic refetch)
  const applyFilters = () => {
    refetch();
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      status: '',
      paymentMethod: '',
      startDate: '',
      endDate: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  // Handle print selected orders
  const handlePrintSelectedOrders = () => {
    if (selectedOrders.length === 0) {
      toast({
        title: 'No orders selected',
        description: 'Please select at least one order to print',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const ordersToPrint = orders.filter((order) => selectedOrders.includes(order.id));
    
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Print Orders</title></head><body>');
    printWindow.document.write('<h1>Selected Orders</h1>');
    printWindow.document.write('<table border="1" style="width:100%; border-collapse: collapse;">');
    printWindow.document.write(`
      <tr>
        <th>Order Number</th>
        <th>Date</th>
        <th>Customer</th>
        <th>Phone</th>
        <th>Pharmacy</th>
        <th>Status</th>
        <th>Payment</th>
        <th>Total</th>
      </tr>
    `);
  
    ordersToPrint.forEach((order) => {
      printWindow.document.write(`
        <tr>
          <td>${order.orderNumber}</td>
          <td>${formatDate(order.createdAt)}</td>
          <td>${order.user?.name || 'N/A'}</td>
          <td>${order.user?.phoneNumber || 'N/A'}</td>
          <td>${order.pharmacy?.name || 'N/A'}</td>
          <td>${order.status}</td>
          <td>${order.paymentMethod}</td>
          <td>${order.total}</td>
        </tr>
      `);
    });
  
    printWindow.document.write('</table></body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  const columns = [
    columnHelper.accessor('id', {
      header: '',
      cell: (info) => (
        <Checkbox
          isChecked={selectedOrders.includes(info.getValue())}
          onChange={() => handleCheckboxChange(info.getValue())}
          colorScheme={'brandScheme'}
        />
      ),
    }),
    columnHelper.accessor('orderNumber', {
      header: 'Order #',
      cell: (info) => <Text color={textColor} fontWeight="bold">{info.getValue()}</Text>,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Date',
      cell: (info) => <Text color={textColor}>{formatDate(info.getValue())}</Text>,
    }),
    columnHelper.accessor('user.name', {
      header: 'Customer',
      cell: (info) => <Text color={textColor}>{info.getValue() || 'N/A'}</Text>,
    }),
    columnHelper.accessor('user.phoneNumber', {
      header: 'Phone',
      cell: (info) => <Text color={textColor}>{info.getValue() || 'N/A'}</Text>,
    }),
    columnHelper.accessor('pharmacy.name', {
      header: 'Pharmacy',
      cell: (info) => <Text color={textColor}>{info.getValue() || 'N/A'}</Text>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <Badge
          colorScheme={
            info.getValue() === 'PENDING' ? 'yellow' :
            info.getValue() === 'COMPLETED' ? 'green' : 'red'
          }
          px="10px"
          py="2px"
          borderRadius="8px"
        >
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('paymentMethod', {
      header: 'Payment',
      cell: (info) => (
        <Badge
          colorScheme={info.getValue() === 'PAID' ? 'green' : 'orange'}
          px="10px"
          py="2px"
          borderRadius="8px"
        >
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('total', {
      header: 'Total',
      cell: (info) => <Text color={textColor} fontWeight="bold">{info.getValue()}</Text>,
    }),
    columnHelper.accessor('actions', {
      header: 'Actions',
      cell: (info) => (
        <Icon
          w="18px"
          h="18px"
          me="10px"
          color="blue.500"
          as={FaEye}
          cursor="pointer"
          onClick={() => {
            setSelectedOrder(info.row.original);
            onOpen();
          }}
        />
      ),
    }),
  ];

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="container">
      <Card flexDirection="column" w="100%" px="0px" overflowX={{ sm: 'scroll', lg: 'hidden' }}>
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text color={textColor} fontSize="22px" fontWeight="700">All Orders</Text>
          <Box display="flex" gap="10px">

            <Button
            variant="darkBrand"
            color="white"
            fontSize="sm"
            fontWeight="500"
            borderRadius="70px"
            px="24px"
            py="5px"
            onClick={() => navigate('/admin/add-order')}
            width={'200px'}
          >
            Add Order
          </Button>

          <Button
            variant="darkBrand"
            color="white"
            fontSize="sm"
            fontWeight="500"
            borderRadius="70px"
            px="24px"
            py="5px"
            width={'200px'}
            onClick={handlePrintSelectedOrders}
            leftIcon={<IoMdPrint />}
          >
            Print Selected
          </Button>
          </Box>
        </Flex>

        {/* Filters */}
        <Flex mb="20px" mx="10px" wrap="wrap" justifyContent="space-around" gap="10px">
          {/* Status Filter */}
          {/* <Box>
            <Select
              placeholder="Filter by Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              size="sm"
              borderRadius="15px"
              width="250px"
              bg={'gray.100'}
            >
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </Box> */}

          {/* Payment Method Filter */}
          {/* <Box>
            <Select
              placeholder="Filter by Payment"
              value={filters.paymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              size="sm"
              borderRadius="15px"
              width="250px"
              bg={'gray.100'}
            >
              <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="PAYPAL">PayPal</option>
            </Select>
          </Box> */}
        </Flex>

        {/* Date Range Filter */}
        <Flex mb="20px" mx="20px" wrap="wrap" justifyContent="space-around" alignItems="center" gap="10px">
          <Box>
            <Text color={textColor} mb="10px" fontWeight="bold" fontSize="sm">
              From Date
            </Text>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              size="sm"
              borderRadius="15px"
              padding="20px"
              bg={'gray.100'}
              width={'250px'}
            />
          </Box>
          <Box>
            <Text color={textColor} mb="10px" fontWeight="bold" fontSize="sm">
              To Date
            </Text>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              size="sm"
              borderRadius="15px"
              padding="20px"
              bg={'gray.100'}
              width={'250px'}
            />
          </Box>
          <Flex gap="10px" mt="20px">
            <Button
              onClick={applyFilters}
              variant="darkBrand"
              color="white"
              fontSize="sm"
              fontWeight="500"
              borderRadius="70px"
              px="24px"
              py="5px"
            >
              Apply Filters
            </Button>
            <Button
              onClick={resetFilters}
              variant="outline"
              colorScheme="gray"
              fontSize="sm"
              fontWeight="500"
              borderRadius="70px"
              px="24px"
              py="5px"
            >
              Reset Filters
            </Button>
          </Flex>
        </Flex>

        {/* Table */}
        <Box overflowX="auto">
          <Table variant="simple" color="gray.500" mb="24px" mt="12px" minWidth="1000px">
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
                            header.getContext()
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
                    <Text color={textColor}>No orders found</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>

        {/* Pagination */}
        <Flex justifyContent="space-between" alignItems="center" px="25px" py="10px">
          <Text color={textColor}>
            Showing {orders.length} of {totalItems} orders
          </Text>
          <Flex gap="10px">
            <Button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              isDisabled={pagination.page === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Text color={textColor} px="10px" display="flex" alignItems="center">
              Page {pagination.page} of {totalPages}
            </Text>
            <Button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              isDisabled={pagination.page >= totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Order Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Order Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedOrder && (
              <Box>
                <Flex justifyContent="space-between" mb="20px">
                  <Box>
                    <Text fontSize="sm" color="gray.500">Order Number</Text>
                    <Text fontWeight="bold">{selectedOrder.orderNumber}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">Date</Text>
                    <Text>{formatDate(selectedOrder.createdAt)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">Status</Text>
                    <Badge
                      colorScheme={
                        selectedOrder.status === 'PENDING' ? 'yellow' :
                        selectedOrder.status === 'COMPLETED' ? 'green' : 'red'
                      }
                      px="10px"
                      py="2px"
                      borderRadius="8px"
                    >
                      {selectedOrder.status}
                    </Badge>
                  </Box>
                </Flex>

                <Flex justifyContent="space-between" mb="20px">
                  <Box>
                    <Text fontSize="sm" color="gray.500">Customer</Text>
                    <Text>{selectedOrder.user?.name || 'N/A'}</Text>
                    <Text>{selectedOrder.user?.phoneNumber || 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">Pharmacy</Text>
                    <Text>{selectedOrder.pharmacy?.name || 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">Payment</Text>
                    <Text>{selectedOrder.paymentMethod}</Text>
                    <Badge
                      colorScheme={selectedOrder.paymentStatus === 'PAID' ? 'green' : 'orange'}
                      px="10px"
                      py="2px"
                      borderRadius="8px"
                    >
                      {selectedOrder.paymentStatus}
                    </Badge>
                  </Box>
                </Flex>

                <Box mb="20px">
                  <Text fontSize="sm" color="gray.500">Address</Text>
                  {selectedOrder.address ? (
                    <Text>
                      {selectedOrder.address.buildingNo} {selectedOrder.address.street}, 
                      {selectedOrder.address.city}
                    </Text>
                  ) : (
                    <Text>N/A</Text>
                  )}
                </Box>

                <Box mb="20px">
                  <Text fontSize="lg" fontWeight="bold" mb="10px">Items</Text>
                  {selectedOrder.items?.map((item) => (
                    <Flex key={item.id} mb="10px" p="10px" borderBottom="1px solid" borderColor="gray.200">
                      <Image
                        src={item.imageUrl}
                        boxSize="50px"
                        objectFit="cover"
                        mr="10px"
                        fallbackSrc="https://via.placeholder.com/50"
                      />
                      <Box flex="1">
                        <Text fontWeight="bold">{item.name}</Text>
                        <Text>Qty: {item.quantity}</Text>
                      </Box>
                      <Box textAlign="right">
                        <Text>${item.price}</Text>
                        <Text>Subtotal: ${item.subtotal}</Text>
                      </Box>
                    </Flex>
                  ))}
                </Box>

                <Flex justifyContent="flex-end">
                  <Box textAlign="right">
                    <Text>Subtotal: ${selectedOrder.subtotal}</Text>
                    <Text>Delivery Fee: ${selectedOrder.deliveryFee}</Text>
                    <Text fontWeight="bold" fontSize="lg">Total: ${selectedOrder.total}</Text>
                  </Box>
                </Flex>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Orders;
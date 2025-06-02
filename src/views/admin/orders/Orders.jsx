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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
import { useGetOrdersQuery, useUpdateOrderStatusMutation } from 'api/orderSlice';
import { useGetDocumentsQuery } from 'api/documentSlice';
import { ChevronDownIcon, EditIcon } from '@chakra-ui/icons';
import { FaSearch, FaFileExport } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { skipToken } from '@reduxjs/toolkit/query/react';


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
    paymentStatus: '',
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting state
  const [sorting, setSorting] = useState([]);

  // State to trigger fetching all data for export
  const [triggerExportFetch, setTriggerExportFetch] = useState(null); // 'excel' or 'pdf'

  // Fetch orders with pagination, filters, and sorting
  // This hook is for displaying paginated data
  const { data: ordersResponse, isLoading, refetch } = useGetOrdersQuery({
    page: pagination.page,
    limit: pagination.limit,
    ...filters,
    ...(searchTerm && { search: searchTerm }),
    // Add sorting parameters if sorting is applied
    ...(sorting.length > 0 && {
      sortBy: sorting[0].id,
      sortOrder: sorting[0].desc ? 'desc' : 'asc'
    }),
  });

  // Fetch all orders for export (conditionally triggered)
  // This hook will be skipped unless triggerExportFetch is set
  const { data: allOrdersResponse, isFetching: isLoadingAllOrders } = useGetOrdersQuery(
    triggerExportFetch ? {
      page: 1, // Start from the first page
      limit: 100000, // Set a very high limit to fetch all orders
      ...filters, // Include current filters
      ...(searchTerm && { search: searchTerm }), // Include current search term
      // Exclude sorting for export unless specifically requested
    } : skipToken // Use skipToken to skip this query initially
  );

  // Initialize the mutation hook
  const [updateOrderStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();

  const orders = ordersResponse?.data || [];
  const totalItems = ordersResponse?.pagination?.totalItems || 0;
  const totalPages = ordersResponse?.pagination?.totalPages || 1;

  // Effect to handle export after fetching all data
  useEffect(() => {
    if (triggerExportFetch && allOrdersResponse) {
      const allOrders = allOrdersResponse?.data || [];
      if (allOrders.length === 0) {
        toast({
          title: 'No data to export',
          description: 'No orders found matching current filters/search for export.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      } else {
        if (triggerExportFetch === 'excel') {
          performExportToExcel(allOrders);
        } else if (triggerExportFetch === 'pdf') {
          performExportToPdf(allOrders);
        }
      }
      setTriggerExportFetch(null); // Reset trigger state
    }
  }, [triggerExportFetch, allOrdersResponse, toast]); // Depend on trigger state and fetched data

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
    // Reset to first page when filters change, including search
    setPagination(prev => ({ ...prev, page: 1 }));

    // Update search term state if the field is 'search'
    if (field === 'search') {
      setSearchTerm(value);
    }
  };

  // Handle sorting change
  const handleSortingChange = (sorter) => {
    setSorting(sorter);
    // Reset to first page when sorting changes
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Apply filters (triggers automatic refetch of paginated data)
  const applyFilters = () => {
    // Changing filters/searchTerm already triggers a refetch of the paginated data
    // No explicit refetch call needed here unless you want to force it
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      status: '',
      paymentMethod: '',
      startDate: '',
      endDate: '',
      paymentStatus: '',
    });
    setSearchTerm(''); // Reset search term as well
    setPagination(prev => ({ ...prev, page: 1 }));
    setSorting([]); // Reset sorting
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

  // Trigger export fetch for Excel
  const handleExportToExcel = () => {
    if (orders.length === 0) {
       toast({
         title: 'No data to export',
         description: 'The current table is empty.',
         status: 'warning',
         duration: 3000,
         isClosable: true,
       });
       return;
     }
    setTriggerExportFetch('excel');
  };

  // Trigger export fetch for PDF
  const handleExportToPdf = () => {
    if (orders.length === 0) {
      toast({
        title: 'No data to export',
        description: 'The current table is empty.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setTriggerExportFetch('pdf');
  };

  // Separate function to perform Excel export with fetched data
  const performExportToExcel = (data) => {
    // Prepare data for export - map order objects to a flat structure
    const dataToExport = data.map(order => ({
      'Order #': order.orderNumber,
      'Date': formatDate(order.createdAt),
      'Customer': order.user?.name || 'N/A',
      'Phone': order.user?.phoneNumber || 'N/A',
      'Pharmacy': order.pharmacy?.name || 'N/A',
      'Status': order.status,
      'Payment Method': order.paymentMethod,
      'Payment Status': order.paymentStatus,
      'Total': order.total,
      'Subtotal': order.subtotal,
      'Delivery Fee': order.deliveryFee,
      'Address': order.address ? `${order.address.buildingNo} ${order.address.street}, ${order.address.city}` : 'N/A',
      'Items': order.items?.map(item => `${item.name} (Qty: ${item.quantity})`).join('; ') || 'N/A',
      // Add more fields as needed
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    // Filename with current date
    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Orders_${date}.xlsx`);

    toast({
      title: 'Export Successful',
      description: 'Orders data has been exported to Excel.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Separate function to perform PDF export with fetched data
  const performExportToPdf = (data) => {
     // Logic to capture table HTML and generate PDF
       const tempDiv = document.createElement('div');
       tempDiv.style.position = 'absolute';
       tempDiv.style.left = '-9999px'; // Position off-screen
       // Set a reasonable width for rendering the single order view
       tempDiv.style.width = '190mm'; // slightly less than A4 width for margins
       document.body.appendChild(tempDiv);

       const pdf = new jsPDF('portrait', 'mm', 'a4'); // Portrait mode
       const margin = 10; // mm
       const pageWidth = pdf.internal.pageSize.getWidth();

       const processOrders = async () => {
           for (let i = 0; i < data.length; i++) {
               const order = data[i];

               if (i > 0) {
                   pdf.addPage();
               }

               // Generate HTML for a single order's details
               const orderHtml = `
                   <div style="padding: ${margin}mm;">\n
                       <h2 style="font-size: 1.2em; font-weight: bold; margin-bottom: 15px;">Order Details - #${order.orderNumber}</h2>\n
                       <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">\n                           <div style="flex: 1;">\n                               <p style="font-size: 0.9em; color: gray;">Date</p>\n                               <p>${formatDate(order.createdAt)}</p>\n                           </div>\n                           <div style="flex: 1;">\n                               <p style="font-size: 0.9em; color: gray;">Status</p>\n                               <span style="background-color: ${order.status === 'PENDING' || order.status === 'PROCESSING' ? '#fbd38d' /* yellow */ : order.status === 'SHIPPED' || order.status === 'DELIVERED' ? '#90cdf4' /* blue */ : order.status === 'COMPLETED' ? '#9ae6b4' /* green */ : order.status === 'CANCELLED' ? '#feb2b2' /* red */ : '#e2e8f0' /* gray */}; padding: 2px 8px; border-radius: 5px; color: black;">${order.status}</span>\n                           </div>\n                           <div style="flex: 1;">\n                               <p style="font-size: 0.9em; color: gray;">Payment Status</p>\n                               <span style="background-color: ${order.paymentStatus === 'PAID' ? '#9ae6b4' /* green */ : order.paymentStatus === 'UNPAID' ? '#fed7d7' /* orange */ : order.paymentStatus === 'REFUNDED' ? '#feb2b2' /* red */ : '#e2e8f0' /* gray */}; padding: 2px 8px; border-radius: 5px; color: black;">${order.paymentStatus}</span>\n                           </div>\n                       </div>\n
                       <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">\n                           <div style="flex: 1;">\n                               <p style="font-size: 0.9em; color: gray;">Customer</p>\n                               <p>${order.user?.name || 'N/A'}</p>\n                               <p>${order.user?.phoneNumber || 'N/A'}</p>\n                           </div>\n                           <div style="flex: 1;">\n                               <p style="font-size: 0.9em; color: gray;">Pharmacy</p>\n                               <p>${order.pharmacy?.name || 'N/A'}</p>\n                           </div>\n                           <div style="flex: 1;">\n                               <p style="font-size: 0.9em; color: gray;">Payment Method</p>\n                               <p>${order.paymentMethod}</p>\n                           </div>\n                       </div>\n
                       <div style="margin-bottom: 15px;">\n                           <p style="font-size: 0.9em; color: gray;">Address</p>\n                           ${order.address ? `
                               <p>${order.address.buildingNo} ${order.address.street}, ${order.address.city}</p>
                           ` : '<p>N/A</p>'}\n                       </div>\n
                       <div style="margin-bottom: 15px;">\n                           <h3 style="font-size: 1.1em; font-weight: bold; margin-bottom: 10px;">Items</h3>\n                           ${order.items?.map(item => `
                               <div style="display: flex; align-items: center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">\n                                   ${item.imageUrl ? `<img src="${item.imageUrl}" style="width: 40px; height: 40px; object-fit: cover; margin-right: 10px;"/>` : '<div style="width: 40px; height: 40px; margin-right: 10px; background-color: #e2e8f0;"></div>'}\n                                   <div style="flex: 1;">\n                                       <p style="font-weight: bold;">${item.name}</p>\n                                       <p style="font-size: 0.9em; color: gray;">Qty: ${item.quantity}</p>
                                   </div>\n                                   <div style="text-align: right;">\n                                       <p>$${item.price}</p>
                                   </div>\n                               </div>
                           `).join('') || '<p>No items found</p>'}\n                       </div>\n
                       <div style="display: flex; justify-content: flex-end;">\n                           <div style="text-align: right;">\n                               <p>Subtotal: $${order.subtotal}</p>
                               <p>Delivery Fee: $${order.deliveryFee}</p>
                               <p style="font-weight: bold; font-size: 1.1em;">Total: $${order.total}</p>
                           </div>
                       </div>
                   </div>
               `;

               tempDiv.innerHTML = orderHtml;

               // Give images/content a moment to render
               await new Promise(resolve => setTimeout(resolve, 150)); // Increased delay slightly

               const canvas = await html2canvas(tempDiv, { scale: 3 }); // Increased scale for better quality
               const imgData = canvas.toDataURL('image/png');

               const imgWidth = pageWidth - 2 * margin;
               const imgHeight = canvas.height * imgWidth / canvas.width;

               // Add image to PDF. Ensure it fits on the page.
               // This simple approach assumes the content for one order fits on one page.
               // For content spanning multiple pages, a more advanced approach with jspdf autoTable or similar is needed.
               pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
           }

           // After processing all orders, save the PDF and clean up
           pdf.save(`Orders_Details_${new Date().toISOString().slice(0, 10)}.pdf`);

           // Clean up the temporary div
           document.body.removeChild(tempDiv);

           toast({
               title: 'Export Successful',
               description: 'Orders details has been exported to PDF (one page per order).',
               status: 'success',
               duration: 3000,
               isClosable: true,
           });
       };

       // Start the async process
       processOrders().catch(err => {
           toast({
               title: 'Error Exporting to PDF',
               description: err.message || 'Failed to generate PDF.',
               status: 'error',
               duration: 5000,
               isClosable: true,
           });
           console.error('Error generating PDF:', err);
           // Clean up the temporary div even on error
           if(document.body.contains(tempDiv)) {
               document.body.removeChild(tempDiv);
           }
       });
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
      enableSorting: true, // Enable sorting for Date column
    }),
    columnHelper.accessor('user.name', {
      header: 'Customer',
      cell: (info) => <Text color={textColor}>{info.getValue() || 'N/A'}</Text>,
      enableSorting: true, // Enable sorting for Customer column
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
            info.getValue() === 'PENDING' || info.getValue() === 'PROCESSING' ? 'yellow' :
            info.getValue() === 'SHIPPED' || info.getValue() === 'DELIVERED' ? 'blue' :
            info.getValue() === 'COMPLETED' ? 'green' :
            info.getValue() === 'CANCELLED' ? 'red' :
            'gray'
          }
          px="10px"
          py="2px"
          borderRadius="8px"
        >
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('paymentStatus', {
      header: 'Payment Status',
      cell: (info) => (
        <Badge
          colorScheme={
            info.getValue() === 'PAID' ? 'green' :
            info.getValue() === 'UNPAID' ? 'orange' :
            info.getValue() === 'REFUNDED' ? 'red' :
            'gray'
          }
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
      enableSorting: true, // Enable sorting for Total column
    }),
    columnHelper.accessor('actions', {
      header: 'Actions',
      cell: (info) => (
        <Flex>
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
          {/* Status Update Menu */}
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              size="sm"
              variant="outline"
              colorScheme="teal"
              isLoading={isUpdatingStatus} // Disable while updating
            >
              Update Status
            </MenuButton>
            <MenuList>
              {/* Status options matching API payload expectations */}
              <MenuItem onClick={() => handleUpdateStatus(info.row.original.id, 'PENDING')}>PENDING</MenuItem>
              <MenuItem onClick={() => handleUpdateStatus(info.row.original.id, 'PROCESSING')}>PROCESSING</MenuItem>
              <MenuItem onClick={() => handleUpdateStatus(info.row.original.id, 'SHIPPED')}>SHIPPED</MenuItem>
              <MenuItem onClick={() => handleUpdateStatus(info.row.original.id, 'DELIVERED')}>DELIVERED</MenuItem>
              <MenuItem onClick={() => handleUpdateStatus(info.row.original.id, 'COMPLETED')}>COMPLETED</MenuItem>
              <MenuItem onClick={() => handleUpdateStatus(info.row.original.id, 'CANCELLED')}>CANCELLED</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      ),
    }),
  ];

  // Function to handle status update
  const handleUpdateStatus = async (orderId, status) => {
    try {
      await updateOrderStatus({ orderId, status }).unwrap();
      toast({ // Show success toast
        title: 'Status Updated',
        description: `Order status updated to ${status}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch(); // Refetch orders to show updated status
    } catch (err) {
      toast({ // Show error toast
        title: 'Error Updating Status',
        description: err.data?.message || 'Failed to update order status.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Failed to update order status:', err);
    }
  };

  const table = useReactTable({
    data: orders,
    columns,
    state: {
      sorting, // Pass sorting state to table
    },
    onSortingChange: setSorting, // Update sorting state when sorting changes
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

          {/* Export Menu */}
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              leftIcon={<FaFileExport />}
              variant="outline"
              colorScheme="blue"
              fontSize="sm"
              fontWeight="500"
              borderRadius="70px"
              px="24px"
              py="5px"
              width={'200px'}
            >
              Export
            </MenuButton>
            <MenuList>
              <MenuItem onClick={handleExportToExcel}>Export to Excel</MenuItem>
              {/* Add onClick for PDF export if implemented */}
              <MenuItem onClick={handleExportToPdf}>Export to PDF</MenuItem>
            </MenuList>
          </Menu>
          </Box>
        </Flex>

        {/* Search Input */}
        <Flex px="25px" mb="20px">
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => handleFilterChange('search', e.target.value)} // Use handleFilterChange for search
              borderRadius="20px"
              bg={useColorModeValue('gray.100', 'gray.700')}
            />
          </InputGroup>
        </Flex>

        {/* Filters */}
        <Flex mb="20px" mx="10px" wrap="wrap" justifyContent="space-around" gap="10px">
          {/* Status Filter */}
          <Box>
            <Select
              placeholder="Filter by Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              size="sm"
              borderRadius="15px"
              width="250px"
              bg={useColorModeValue('gray.100', 'gray.700')}
            >
              {/* Add status options */}
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </Box>

          {/* Payment Method Filter */}
          <Box>
            <Select
              placeholder="Filter by Payment Method"
              value={filters.paymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              size="sm"
              borderRadius="15px"
              width="250px"
              bg={useColorModeValue('gray.100', 'gray.700')}
            >
              {/* Add payment method options */}
              <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
              <option value="CARD">Card</option>
              <option value="ONLINE">Online</option>
            </Select>
          </Box>

          {/* Payment Status Filter */}
          <Box>
            <Select
              placeholder="Filter by Payment Status"
              value={filters.paymentStatus}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              size="sm"
              borderRadius="15px"
              width="250px"
              bg={useColorModeValue('gray.100', 'gray.700')}
            >
              {/* Add payment status options */}
              <option value="PAID">Paid</option>
              <option value="UNPAID">Unpaid</option>
              <option value="REFUNDED">Refunded</option>
            </Select>
          </Box>
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
          <Table variant="simple" color="gray.500" mb="24px" mt="12px" minWidth="1000px" id="orders-table">
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
              {isLoading ? (
                 <Tr>
                   <Td colSpan={columns.length} textAlign="center" py="40px">
                     <Text color={textColor}>Loading Orders...</Text>
                   </Td>
                 </Tr>
               ) : table.getRowModel().rows.length > 0 ? (
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
              isDisabled={pagination.page === 1 || isLoading}
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
              isDisabled={pagination.page >= totalPages || isLoading}
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
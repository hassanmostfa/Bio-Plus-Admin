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
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';


const columnHelper = createColumnHelper();

const Orders = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  
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
          title: t('orders.noDataToExport'),
          description: t('orders.noOrdersFoundForExport'),
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
  }, [triggerExportFetch, allOrdersResponse, toast, t]);

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

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (orders.length === 0) return; // No orders to select
    
    if (selectedOrders.length === orders.length) {
      // If all are selected, deselect all
      console.log('Deselecting all orders');
      setSelectedOrders([]);
    } else {
      // If not all are selected, select all
      const allOrderIds = orders.map(order => order.id);
      console.log('Selecting all orders:', allOrderIds);
      setSelectedOrders(allOrderIds);
    }
  };

  // Check if all orders are selected
  const isAllSelected = orders.length > 0 && selectedOrders.length === orders.length;
  const isIndeterminate = selectedOrders.length > 0 && selectedOrders.length < orders.length;

  // Debug information
  console.log('Orders count:', orders.length);
  console.log('Selected orders count:', selectedOrders.length);
  console.log('Is all selected:', isAllSelected);
  console.log('Is indeterminate:', isIndeterminate);

  // Handle print selected orders
  const handlePrintSelectedOrders = () => {
    if (selectedOrders.length === 0) {
      toast({
        title: t('orders.noOrdersSelected'),
        description: t('orders.selectAtLeastOneOrder'),
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
         title: t('orders.noDataToExport'),
         description: t('orders.currentTableEmpty'),
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
        title: t('orders.noDataToExport'),
        description: t('orders.currentTableEmpty'),
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
      title: t('orders.exportSuccessful'),
      description: t('orders.ordersExportedToExcel'),
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Separate function to perform PDF export with fetched data
  const performExportToPdf = (data) => {
    // Create a temporary div for rendering
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '1200px'; // Wider for landscape
    tempDiv.style.padding = '20px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.color = 'black';
    tempDiv.style.fontSize = '12px'; // Bigger font for better readability
    document.body.appendChild(tempDiv);

    // Generate HTML content for PDF
    const pdfContent = `
      <div style="font-family: Arial, sans-serif;">
        <h1 style="text-align: center; color: #333; margin-bottom: 20px; font-size: 22px;margin-top: 20px;">Orders Report</h1>
        <p style="text-align: center; color: #666; margin-bottom: 20px; font-size: 14px;">Generated on ${new Date().toLocaleDateString()}</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11px;margin-top: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px;">Order #</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px;">Date</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px;">Customer</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px;">Phone</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px;">Pharmacy</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px;">Status</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px;">Payment Status</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px;">Payment Method</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px;">Subtotal</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px;">Delivery Fee</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(order => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px; font-size: 11px;">${order.orderNumber || 'N/A'}</td>
                <td style="border: 1px solid #ddd; padding: 8px; font-size: 11px;">${formatDate(order.createdAt)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; font-size: 11px;">${order.user?.name || 'N/A'}</td>
                <td style="border: 1px solid #ddd; padding: 8px; font-size: 11px;">${order.user?.phoneNumber || 'N/A'}</td>
                <td style="border: 1px solid #ddd; padding: 8px; font-size: 11px;">${order.pharmacy?.name || 'N/A'}</td>
                <td style="border: 1px solid #ddd; padding: 8px; font-size: 11px;">
                  <span style="
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-size: 10px;
                  ">${order.status}</span>
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; font-size: 11px;">
                  <span style="
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-size: 10px;
                  ">${order.paymentStatus}</span>
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; font-size: 11px;">${order.paymentMethod || 'N/A'}</td>
                <td style="border: 1px solid #ddd; padding: 8px; font-size: 11px;">${order.subtotal || '0'}</td>
                <td style="border: 1px solid #ddd; padding: 8px; font-size: 11px;">${order.deliveryFee || '0'}</td>
                <td style="border: 1px solid #ddd; padding: 8px; font-size: 11px; font-weight: bold;">${order.total || '0'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; text-align: center; color: #666; font-size: 14px;">
          <p><strong>Total Orders:</strong> ${data.length}</p>
          <p><strong>Total Revenue:</strong> ${data.reduce((sum, order) => sum + parseFloat(order.total || 0), 0).toFixed(2)} KWD</p>
          <p><strong>Average Order Value:</strong> ${(data.reduce((sum, order) => sum + parseFloat(order.total || 0), 0) / data.length).toFixed(2)} KWD</p>
        </div>
      </div>
    `;

    tempDiv.innerHTML = pdfContent;

    // Generate PDF using html2canvas and jsPDF
    html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 1200,
      height: tempDiv.scrollHeight
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20; // Leave 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Check if content fits on one page
      if (imgHeight <= pageHeight - 20) {
        // Single page
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      } else {
        // Multiple pages needed - use a simpler approach for consistent sizing
        const maxHeightPerPage = pageHeight - 20;
        let currentY = 10;
        let currentPage = 0;
        
        while (currentY < imgHeight) {
          if (currentPage > 0) {
            pdf.addPage();
          }
          
          const remainingHeight = imgHeight - currentY;
          const heightToShow = Math.min(maxHeightPerPage, remainingHeight);
          
          // Calculate the source Y position in the canvas
          const sourceY = (currentY / imgHeight) * canvas.height;
          const sourceHeight = (heightToShow / imgHeight) * canvas.height;
          
          // Create a temporary canvas for this page
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          tempCanvas.width = canvas.width;
          tempCanvas.height = sourceHeight;
          
          // Draw the portion of the image for this page
          tempCtx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight,
            0, 0, canvas.width, sourceHeight
          );
          
          const pageImgData = tempCanvas.toDataURL('image/png');
          pdf.addImage(pageImgData, 'PNG', 10, 10, imgWidth, heightToShow);
          
          currentY += maxHeightPerPage;
          currentPage++;
        }
      }
      
      // Save the PDF
      const fileName = `Orders_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);
      
      // Clean up
      document.body.removeChild(tempDiv);
      
      toast({
        title: t('orders.exportSuccessful'),
        description: t('orders.ordersExportedToPdf'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }).catch(error => {
      console.error('Error generating PDF:', error);
      document.body.removeChild(tempDiv);
      
      toast({
        title: t('orders.errorExportingToPdf'),
        description: t('orders.failedToGeneratePdf'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    });
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
      case 'PROCESSING':
        return '#fbd38d';
      case 'SHIPPED':
      case 'DELIVERED':
        return '#90cdf4';
      case 'COMPLETED':
        return '#9ae6b4';
      case 'CANCELLED':
        return '#feb2b2';
      default:
        return '#e2e8f0';
    }
  };

  // Helper function to get payment status color
  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'PAID':
        return '#9ae6b4';
      case 'UNPAID':
        return '#fed7d7';
      case 'REFUNDED':
        return '#feb2b2';
      default:
        return '#e2e8f0';
    }
  };

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  const columns = [
    columnHelper.accessor('select', {
      id: 'select',
      header: () => (
        <Box bg="gray.50" p={2} borderRadius="md" border="1px solid" borderColor="gray.200">
          <Flex justify="center" align="center">
            <Checkbox
              isChecked={isAllSelected}
              isIndeterminate={isIndeterminate}
              onChange={handleSelectAll}
              colorScheme={'blue'}
              size="lg"
              cursor="pointer"
              title="Select/Deselect All Orders"
              borderColor="blue.500"
              _hover={{
                borderColor: "blue.600",
                transform: "scale(1.1)"
              }}
            />
          </Flex>
        </Box>
      ),
      cell: (info) => (
        <Box bg="gray.25" p={2} borderRadius="md">
          <Flex justify="center" align="center">
            <Checkbox
              isChecked={selectedOrders.includes(info.row.original.id)}
              onChange={() => handleCheckboxChange(info.row.original.id)}
              colorScheme={'blue'}
              size="md"
              cursor="pointer"
            />
          </Flex>
        </Box>
      ),
      size: 80,
      enableSorting: false,
    }),
    columnHelper.accessor('user.name', {
      header: t('orders.customer'),
      cell: (info) => <Text color={textColor}>{info.getValue() || 'N/A'}</Text>,
      enableSorting: true, // Enable sorting for Customer column
      size: 180,
    }),
    columnHelper.accessor('pharmacy.name', {
      header: t('orders.pharmacy'),
      cell: (info) => <Text color={textColor}>{info.getValue() || 'N/A'}</Text>,
      size: 180,
    }),
    columnHelper.accessor('status', {
      header: t('orders.status'),
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
      size: 120,
    }),
    columnHelper.accessor('paymentStatus', {
      header: t('orders.paymentStatus'),
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
      size: 120,
    }),
    columnHelper.accessor('total', {
      header: t('orders.total'),
      cell: (info) => <Text color={textColor} fontWeight="bold">{info.getValue()}</Text>,
      enableSorting: true, // Enable sorting for Total column
      size: 120,
    }),
    columnHelper.accessor('actions', {
      header: t('orders.actions'),
      cell: (info) => (
        <Flex gap="5px">
          <Icon
            w="18px"
            h="18px"
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
              {t('orders.updateStatus')}
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
      size: 220,
    }),
  ];

  // Function to handle status update
  const handleUpdateStatus = async (orderId, status) => {
    try {
      await updateOrderStatus({ orderId, status }).unwrap();
      toast({ // Show success toast
        title: t('orders.statusUpdated'),
        description: t('orders.orderStatusUpdatedTo', { status }),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch(); // Refetch orders to show updated status
    } catch (err) {
      toast({ // Show error toast
        title: t('orders.errorUpdatingStatus'),
        description: err.data?.message || t('orders.failedToUpdateOrderStatus'),
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
      <Card flexDirection="column" w="100%" px="0px" overflowX="auto">
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text color={textColor} fontSize="22px" fontWeight="700">{t('orders.allOrders')}</Text>
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
            {t('orders.addOrder')}
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
            {t('orders.printSelected')}
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
              {t('orders.export')}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={handleExportToExcel}>{t('orders.exportToExcel')}</MenuItem>
              {/* Add onClick for PDF export if implemented */}
              <MenuItem onClick={handleExportToPdf}>{t('orders.exportToPdf')}</MenuItem>
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
              placeholder={t('orders.searchOrders')}
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
              placeholder={t('orders.filterByStatus')}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              size="sm"
              borderRadius="15px"
              width="250px"
              bg={useColorModeValue('gray.100', 'gray.700')}
            >
              {/* Add status options */}
              <option value="PENDING">{t('orders.pending')}</option>
              <option value="PROCESSING">{t('orders.processing')}</option>
              <option value="SHIPPED">{t('orders.shipped')}</option>
              <option value="DELIVERED">{t('orders.delivered')}</option>
              <option value="COMPLETED">{t('orders.completed')}</option>
              <option value="CANCELLED">{t('orders.cancelled')}</option>
            </Select>
          </Box>

          {/* Payment Method Filter */}
          <Box>
            <Select
              placeholder={t('orders.filterByPaymentMethod')}
              value={filters.paymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              size="sm"
              borderRadius="15px"
              width="250px"
              bg={useColorModeValue('gray.100', 'gray.700')}
            >
              {/* Add payment method options */}
              <option value="CASH_ON_DELIVERY">{t('orders.cashOnDelivery')}</option>
              <option value="CARD">{t('orders.card')}</option>
              <option value="ONLINE">{t('orders.online')}</option>
            </Select>
          </Box>

          {/* Payment Status Filter */}
          <Box>
            <Select
              placeholder={t('orders.filterByPaymentStatus')}
              value={filters.paymentStatus}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              size="sm"
              borderRadius="15px"
              width="250px"
              bg={useColorModeValue('gray.100', 'gray.700')}
            >
              {/* Add payment status options */}
              <option value="PAID">{t('orders.paid')}</option>
              <option value="UNPAID">{t('orders.unpaid')}</option>
              <option value="REFUNDED">{t('orders.refunded')}</option>
            </Select>
          </Box>
        </Flex>

        {/* Date Range Filter */}
        <Flex mb="20px" mx="20px" wrap="wrap" justifyContent="space-around" alignItems="center" gap="10px">
          <Box>
            <Text color={textColor} mb="10px" fontWeight="bold" fontSize="sm">
              {t('orders.fromDate')}
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
              {t('orders.toDate')}
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
              {t('orders.applyFilters')}
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
              {t('orders.resetFilters')}
            </Button>
          </Flex>
        </Flex>

        {/* Table */}
        <Box overflowX="auto">
          <Table variant="simple" color="gray.500" mb="24px" mt="12px" minWidth="1280px" id="orders-table">
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
                     <Text color={textColor}>{t('orders.loadingOrders')}</Text>
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
                    <Text color={textColor}>{t('orders.noOrdersFound')}</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>

        {/* Pagination */}
        <Flex justifyContent="space-between" alignItems="center" px="25px" py="10px">
          <Text color={textColor}>
            {t('orders.showing')} {orders.length} {t('orders.of')} {totalItems} {t('orders.orders')}
          </Text>
          <Flex gap="10px">
            <Button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              isDisabled={pagination.page === 1 || isLoading}
              variant="outline"
              size="sm"
            >
              {t('orders.previous')}
            </Button>
            <Text color={textColor} px="10px" display="flex" alignItems="center">
              {t('orders.page')} {pagination.page} {t('orders.of')} {totalPages}
            </Text>
            <Button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              isDisabled={pagination.page >= totalPages || isLoading}
              variant="outline"
              size="sm"
            >
              {t('orders.next')}
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Order Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('orders.orderDetails')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedOrder && (
              <Box>
                <Flex justifyContent="space-between" mb="20px">
                  <Box>
                    <Text fontSize="sm" color="gray.500">{t('orders.orderNumber')}</Text>
                    <Text fontWeight="bold">{selectedOrder.orderNumber}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">{t('orders.date')}</Text>
                    <Text>{formatDate(selectedOrder.createdAt)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">{t('orders.status')}</Text>
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
                    <Text fontSize="sm" color="gray.500">{t('orders.customer')}</Text>
                    <Text>{selectedOrder.user?.name || 'N/A'}</Text>
                    <Text>{selectedOrder.user?.phoneNumber || 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">{t('orders.pharmacy')}</Text>
                    <Text>{selectedOrder.pharmacy?.name || 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">{t('orders.payment')}</Text>
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
                  <Text fontSize="sm" color="gray.500">{t('orders.address')}</Text>
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
                  <Text fontSize="lg" fontWeight="bold" mb="10px">{t('orders.items')}</Text>
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
                        <Text>{t('orders.qty')}: {item.quantity}</Text>
                      </Box>
                      <Box textAlign="right">
                        <Text>kwd {item.price}</Text>
                        <Text>{t('orders.subtotal')}: kwd {item.subtotal}</Text>
                      </Box>
                    </Flex>
                  ))}
                </Box>

                <Flex justifyContent="flex-end">
                  <Box textAlign="right">
                    <Text>{t('orders.subtotal')}: kwd {selectedOrder.subtotal}</Text>
                    <Text>{t('orders.deliveryFee')}: kwd {selectedOrder.deliveryFee}</Text>
                    <Text fontWeight="bold" fontSize="lg">{t('orders.total')}: kwd {selectedOrder.total}</Text>
                  </Box>
                </Flex>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>{t('orders.close')}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Orders;
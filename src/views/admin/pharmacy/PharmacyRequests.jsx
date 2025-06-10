import {
  Box,
  Button,
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
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  FormControl,
  FormLabel,
  Select,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';
import Card from 'components/card/Card';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useGetPharmaciesRequestsQuery } from 'api/pharmacyRequestsSlice';
import { useProcessRequestMutation } from 'api/pharmacyRequestsSlice';

const columnHelper = createColumnHelper();

const PharmacyRequests = () => {
  const toast = useToast();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const { data: response, isLoading, refetch } = useGetPharmaciesRequestsQuery({ page, limit });
  const [processRequest] = useProcessRequestMutation();
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRequest, setSelectedRequest] = React.useState(null);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [actionType, setActionType] = React.useState(''); // 'approve' or 'reject'
  
  const navigate = useNavigate();
  const [sorting, setSorting] = React.useState([]);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Transform API data to match table structure
  const tableData = React.useMemo(() => {
    if (!response?.data) return [];
    
    return response.data.map(request => ({
      id: request.id,
      pharmacyName: request.pharmacyName || 'N/A',
      productName: request.productName || 'N/A',
      productPrice: request.price ? `${request.price} kwd` : 'N/A',
      brandName: request.brandName || 'N/A',
      offerPercentage: `${request.offerPercentage}%`,
      offerType: request.offerType,
      status: request.status,
    }));
  }, [response]);

  const columns = [
    columnHelper.accessor('pharmacyName', {
      id: 'pharmacyName',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          Pharmacy Name
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor}>
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('productName', {
      id: 'productName',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          Product Name
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor}>
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('productPrice', {
      id: 'productPrice',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          Price
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor}>
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('brandName', {
      id: 'brandName',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          Brand
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor}>
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('offerPercentage', {
      id: 'offerPercentage',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          Offer %
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor}>
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('offerType', {
      id: 'offerType',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          Offer Type
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor}>
          {info.getValue().replace('_', ' ').toLowerCase()}
        </Text>
      ),
    }),
    columnHelper.accessor('actions', {
      id: 'actions',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          Actions
        </Text>
      ),
      cell: (info) => {
        if (info.row.original.status === 'PENDING') {
          return (
            <Flex align="center" gap="15px">
              <Flex 
                border={`1px solid #01b574`} 
                borderRadius={"5px"} 
                padding={"5px"} 
                align="center" 
                gap="5px" 
                cursor="pointer" 
                onClick={() => handleActionClick(info.row.original.id, 'approve')}
              >
                <Icon w="18px" h="18px" color="green.500" as={FaCheck} />
                <Text fontSize="sm" color="green.500" fontWeight="bold">
                  Approve
                </Text>
              </Flex>
        
              <Flex 
                w={"90px"} 
                border={`1px solid #ee5d50`} 
                justifyContent={"center"} 
                borderRadius={"5px"} 
                padding={"5px"} 
                align="center" 
                gap="5px" 
                cursor="pointer" 
                onClick={() => handleActionClick(info.row.original.id, 'reject')}
              >
                <Icon w="18px" h="18px" color="red.500" as={FaTimes} />
                <Text fontSize="sm" color="red.500" fontWeight="bold">
                  Reject
                </Text>
              </Flex>
            </Flex>
          );
        } else if (info.row.original.status === 'REJECTED') {
          return (
            <Flex align="center" gap="10px">
              <Text fontSize="sm" color="red.500" fontWeight="bold">
                REJECTED
              </Text>
            </Flex>
          );
        } else {
          return (
            <Flex align="center" gap="10px">
              <Text fontSize="sm" color="green.500" fontWeight="bold">
                APPROVED
              </Text>
            </Flex>
          );
        }
      },
    }),
  ];

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  const handleActionClick = (id, type) => {
    setSelectedRequest(id);
    setActionType(type);
    onOpen();
  };

  const handleConfirmAction = async () => {
    try {
      if (actionType === 'approve') {
        await processRequest({
          id: selectedRequest,
          status: "APPROVED"
        }).unwrap();
        
        toast({
          title: "Request approved",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        await processRequest({
          id: selectedRequest,
          status: "REJECTED",
          rejectionReason: rejectionReason || "No reason provided"
        }).unwrap();
        
        toast({
          title: "Request rejected",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
      
      refetch();
    } catch (err) {
      toast({
        title: `Error ${actionType === 'approve' ? 'approving' : 'rejecting'} request`,
        description: err.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setRejectionReason('');
      onClose();
    }
  };

  // Handle reject action
  const handleReject = async (id) => {
    // In a real app, you might want to show a modal to collect the rejection reason
    const rejectionReason = "Price is too low for this discount percentage";
    
    try {
      await processRequest({
        id,
        status: "REJECTED",
        rejectionReason
      }).unwrap();
      
      toast({
        title: "Request rejected",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      refetch();
    } catch (err) {
      toast({
        title: "Error rejecting request",
        description: err.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <Card
        flexDirection="column"
        w="100%"
        px="0px"
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
      >
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            lineHeight="100%"
          >
            Pharmacy Requests
          </Text>
          <Text color="gray.500" fontSize="sm">
            Total: {response?.pagination?.totalItems || 0} requests
          </Text>
        </Flex>
        <Box>
          <Table variant="simple" color="gray.500" mb="24px" mt="12px">
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
                            header.getContext(),
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
              {table
                .getRowModel()
                .rows.map((row) => {
                  return (
                    <Tr key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <Td
                            key={cell.id}
                            fontSize={{ sm: '14px' }}
                            minW={{ sm: '150px', md: '200px', lg: 'auto' }}
                            borderColor="transparent"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </Td>
                        );
                      })}
                    </Tr>
                  );
                })}
            </Tbody>
          </Table>
        </Box>
        {/* Pagination Controls */}
        <Flex justify="space-between" align="center" px="25px" py="15px">
          <Flex align="center">
            <Text mr={2}>Rows per page:</Text>
            <Select
              value={limit}
              onChange={handleLimitChange}
              w="70px"
              size="sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Select>
          </Flex>
          <Flex align="center">
            <Text mr={4}>
              Page {page} of {response?.pagination?.totalPages || 1}
            </Text>
            <Button
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              isDisabled={page === 1}
              mr={2}
            >
              Previous
            </Button>
            <Button
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              isDisabled={page === (response?.pagination?.totalPages || 1)}
            >
              Next
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {actionType === 'approve' ? (
              <Text>Are you sure you want to approve this request?</Text>
            ) : (
              <>
                <Text mb={4}>Are you sure you want to reject this request?</Text>
                <FormControl>
                  <FormLabel>Reason for rejection</FormLabel>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter the reason for rejection..."
                  />
                </FormControl>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme={actionType === 'approve' ? 'green' : 'red'} 
              onClick={handleConfirmAction}
              isDisabled={actionType === 'reject' && !rejectionReason}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default PharmacyRequests;
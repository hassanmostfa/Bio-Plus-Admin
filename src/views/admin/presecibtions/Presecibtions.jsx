import {
  Box,
  Button,
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
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
import { EditIcon, SearchIcon } from '@chakra-ui/icons';
import { FaEye, FaTrash, FaX } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { CgAssign } from 'react-icons/cg';
import { CiSearch } from "react-icons/ci";

import { useAssignDocumentMutation } from 'api/documentSlice';
import { useRejectDocumentMutation } from 'api/documentSlice';
import { useGetPharmaciesQuery } from 'api/pharmacySlice';
import Swal from 'sweetalert2';
import { useGetDocumentsQuery } from 'api/documentSlice';



const columnHelper = createColumnHelper();

const Prescriptions = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  // Filters state
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  // API calls
  const { data: pharmacyData } = useGetPharmaciesQuery({
    page: 1,
    limit: 100000
  });
  
  const { data: documentsResponse , refetch , isLoading , isFetching } = useGetDocumentsQuery({
    page: pagination.page,
    limit: pagination.limit,
    ...filters
  });


  

  const [assignDocument] = useAssignDocumentMutation();
  const [rejectDocument] = useRejectDocumentMutation();

  // Data extraction
  const documents = documentsResponse?.data?.items || [];
  const pharmacies = pharmacyData?.data?.items || [];
  const totalItems = documentsResponse?.data?.total || 0;
  const totalPages = documentsResponse?.data?.totalPages || 1;


  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
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

  // Handle assign pharmacy
  const handleAssignPharmacy = async () => {
    if (!selectedDocument || !selectedPharmacy) return;

    try {
      onClose();
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Assign this prescription to ${selectedPharmacy.name}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, assign it!'
      });

      if (result.isConfirmed) {
        await assignDocument({id:selectedDocument.id,data:{
          documentId: selectedDocument.id,
          pharmacyId: selectedPharmacy.id
        }}).unwrap();

        Swal.fire(
          'Assigned!',
          'The prescription has been assigned.',
          'success'
        );
        refetch();

      }
    } catch (error) {
      Swal.fire(
        'Error!',
        error.message || 'Failed to assign prescription',
        'error'
      );
    }
  };

  // Handle reject document
  const handleRejectDocument = async (documentId) => {
    const { value: reason } = await Swal.fire({
      title: 'Reject Prescription',
      input: 'textarea',
      inputLabel: 'Reason for rejection',
      inputPlaceholder: 'Enter the reason for rejecting this prescription...',
      inputAttributes: {
        'aria-label': 'Type your rejection reason here'
      },
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Reject',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to provide a reason!';
        }
      }
    });

    if (reason) {
      try {
        await rejectDocument({id:documentId,data:{
          reason
        }}).unwrap();

        Swal.fire(
          'Rejected!',
          'The prescription has been rejected.',
          'success'
        );
        refetch();
      } catch (error) {
        Swal.fire(
          'Error!',
          error.message || 'Failed to reject prescription',
          'error'
        );
      }
    }
  };

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  const columns = [
    columnHelper.accessor('userName', {
      header: 'User',
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('fileKey', {
      header: 'Prescription',
      cell: (info) => (
        <Image
          src={info.getValue()}
          alt="Prescription"
          boxSize="70px"
          objectFit="cover"
          borderRadius="8px"
          fallbackSrc="https://via.placeholder.com/70"
        />
      ),
    }),
    columnHelper.accessor('userPhone', {
      header: 'Phone',
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Upload Date',
      cell: (info) => <Text color={textColor}>{formatDate(info.getValue())}</Text>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <Badge
          colorScheme={
            info.getValue() === 'PENDING_REVIEW' ? 'yellow' :
            info.getValue() === 'ASSIGNED' ? 'green' : 'red'
          }
          px="10px"
          py="2px"
          borderRadius="8px"
        >
          {info.getValue().replace('_', ' ')}
        </Badge>
      ),
    }),
    columnHelper.accessor('pharmacyName', {
      header: 'Assigned To',
      cell: (info) => (
        <Text color={textColor}>{info.getValue() || 'Not assigned'}</Text>
      ),
    }),
    columnHelper.accessor('actions', {
      header: 'Actions',
      cell: (info) => (
        <Flex align="center">
          {info.row.original.status !== 'REJECTED' && info.row.original.status !== 'ASSIGNED' && info.row.original.status === 'PENDING_REVIEW' ? (
            <>
              <Icon
                w="18px"
                h="18px"
                me="10px"
                color="red.500"
                as={FaX}
                cursor="pointer"
                onClick={() => handleRejectDocument(info.row.original.id)}
                title="Reject Prescription"
              />
              <Icon
                w="18px"
                h="18px"
                me="10px"
                color="green.500"
                as={CgAssign}
                cursor="pointer"
                title="Assign to Pharmacy"
                onClick={() => {
                  setSelectedDocument(info.row.original);
                  onOpen();
                }}
              />
            </>
          ) : (
            <Text color={textColor}>----</Text>
          )}
        </Flex>
      ),
    }),
  ];

 
  const table = useReactTable({
    data: documents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
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
            All Prescriptions
          </Text>
          <Flex alignItems="center" gap="10px">
            <InputGroup borderRadius="15px" background={"gray.100"} w="300px">
              <InputLeftElement pointerEvents="none">
                <CiSearch color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                border="1px solid"
                borderColor="gray.200"
                _hover={{ borderColor: "gray.400" }}
                borderRadius={"15px"}
              />
            </InputGroup>
            <Select
              placeholder="Filter by status"
              width="300px"
              background={"gray.100"}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              variant="outline"
              fontSize="sm"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ borderColor: "gray.400" }}
              borderRadius={"15px"}
            >
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="REJECTED">Rejected</option>
            </Select>
          </Flex>
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
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <Tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
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
                    ))}
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={columns.length} textAlign="center" py="40px">
                    <Text color={textColor}>No prescriptions found</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>

        {/* Pagination */}
        <Flex justifyContent="space-between" alignItems="center" px="25px" py="10px">
          <Text color={textColor}>
            Showing {documents.length} of {totalItems} prescriptions
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

      {/* Assign Pharmacy Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Assign Prescription to Pharmacy</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedDocument && (
              <>
                <Text mb="4">Assign prescription from {selectedDocument.userName} to:</Text>
                <Box maxH="400px" overflowY="auto">
                  {pharmacies.map((pharmacy) => (
                    <Box
                      key={pharmacy.id}
                      p="3"
                      mb="2"
                      borderWidth="1px"
                      borderRadius="md"
                      cursor="pointer"
                      bg={selectedPharmacy?.id === pharmacy.id ? 'blue.50' : 'white'}
                      borderColor={selectedPharmacy?.id === pharmacy.id ? 'blue.200' : 'gray.200'}
                      _hover={{ bg: 'gray.50' }}
                      onClick={() => setSelectedPharmacy(pharmacy)}
                    >
                      <Flex align="center">
                        <Image
                          src={pharmacy.imageKey}
                          boxSize="50px"
                          objectFit="cover"
                          borderRadius="md"
                          mr="3"
                          fallbackSrc="https://via.placeholder.com/50"
                        />
                        <Box>
                          <Text fontWeight="bold">{pharmacy.name}</Text>
                          <Text fontSize="sm" color="gray.600">{pharmacy.description}</Text>
                          <Text fontSize="sm">Branches: {pharmacy.numOfBranches}</Text>
                        </Box>
                      </Flex>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleAssignPharmacy}
              isDisabled={!selectedPharmacy}
            >
              Assign to {selectedPharmacy?.name || 'Pharmacy'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Prescriptions;
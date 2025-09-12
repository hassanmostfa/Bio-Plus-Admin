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
  Link,
  VStack,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Card from 'components/card/Card';
import { FaX, FaCircleInfo } from 'react-icons/fa6';
import { CgAssign } from 'react-icons/cg';
import { CiSearch } from "react-icons/ci";

import { useAssignDocumentMutation } from 'api/documentSlice';
import { useRejectDocumentMutation } from 'api/documentSlice';
import { useGetPharmaciesQuery } from 'api/pharmacySlice';
import Swal from 'sweetalert2';
import { useGetDocumentsQuery } from 'api/documentSlice';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper();

// Memoized pharmacy item component to prevent unnecessary re-renders
const PharmacyItem = React.memo(({ pharmacy, isSelected, onSelect }) => {
  const { t } = useTranslation();
  
  return (
    <Box
      p="3"
      mb="2"
      borderWidth="1px"
      borderRadius="md"
      cursor="pointer"
      bg={isSelected ? 'blue.50' : 'white'}
      borderColor={isSelected ? 'blue.200' : 'gray.200'}
      _hover={{ bg: 'gray.50' }}
      onClick={() => onSelect(pharmacy)}
    >
      <Flex align="center">
        <Image
          src={pharmacy.imageKey}
          boxSize="50px"
          objectFit="cover"
          borderRadius="md"
          mr="3"
          fallbackSrc="https://via.placeholder.com/50"
          loading="lazy"
        />
        <Box>
          <Text fontWeight="bold">{pharmacy.name}</Text>
          <Text fontSize="sm" color="gray.600">{pharmacy.description}</Text>
          <Text fontSize="sm">{t('prescriptionsTable.branches')}: {pharmacy.numOfBranches}</Text>
        </Box>
      </Flex>
    </Box>
  );
});

PharmacyItem.displayName = 'PharmacyItem';

const Prescriptions = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isRejectionModalOpen, onOpen: onRejectionModalOpen, onClose: onRejectionModalClose } = useDisclosure();
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [pharmacySearch, setPharmacySearch] = useState('');
  const [selectedRejectionReason, setSelectedRejectionReason] = useState('');
  const { t } = useTranslation();
  const timeoutRef = useRef(null);
  const pharmacySearchTimeoutRef = useRef(null);

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

  const { data: documentsResponse , refetch , isLoading , isFetching } = useGetDocumentsQuery({
    page: pagination.page,
    limit: pagination.limit,
    ...filters
  });

  // Fetch pharmacies using RTK Query with search
  const { data: pharmaciesResponse, isLoading: pharmaciesLoading, error: pharmaciesError, refetch: refetchPharmacies } = useGetPharmaciesQuery({
    page: 1,
    limit: 100, // Reduced limit for better performance
    search: pharmacySearch, // Add search parameter
  });

  const [assignDocument] = useAssignDocumentMutation();
  const [rejectDocument] = useRejectDocumentMutation();

  // Data extraction with safety checks
  const documents = documentsResponse?.data?.items || [];
  const totalItems = documentsResponse?.data?.total || 0;
  const totalPages = documentsResponse?.data?.totalPages || 1;
  const pharmacies = useMemo(() => pharmaciesResponse?.data?.items || [], [pharmaciesResponse?.data?.items]);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (pharmacySearchTimeoutRef.current) {
        clearTimeout(pharmacySearchTimeoutRef.current);
      }
    };
  }, []);

  // Format date and time for display
  const formatDate = useCallback((dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }, []);

  // Handle filter changes with debouncing
  const handleFilterChange = useCallback((field, value) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debouncing
    timeoutRef.current = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        [field]: value
      }));
      // Reset to first page when filters change
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 300); // 300ms debounce
  }, []);

  // Handle pharmacy selection
  const handlePharmacySelect = useCallback((pharmacy) => {
    setSelectedPharmacy(pharmacy);
  }, []);

  // Handle pharmacy search with debouncing
  const handlePharmacySearch = useCallback((value) => {
    // Clear existing timeout
    if (pharmacySearchTimeoutRef.current) {
      clearTimeout(pharmacySearchTimeoutRef.current);
    }

    // Set new timeout for debouncing
    pharmacySearchTimeoutRef.current = setTimeout(() => {
      setPharmacySearch(value);
    }, 300); // 300ms debounce
  }, []);

  // Handle modal close with cleanup
  const handleModalClose = useCallback(() => {
    setPharmacySearch('');
    setSelectedPharmacy(null);
    onClose();
  }, [onClose]);

  // Handle rejection reason modal
  const handleRejectionReasonClick = useCallback((rejectionReason) => {
    setSelectedRejectionReason(rejectionReason);
    onRejectionModalOpen();
  }, [onRejectionModalOpen]);

  const handleRejectionModalClose = useCallback(() => {
    setSelectedRejectionReason('');
    onRejectionModalClose();
  }, [onRejectionModalClose]);

  // Handle assign pharmacy
  const handleAssignPharmacy = useCallback(async () => {
    if (!selectedDocument || !selectedPharmacy) return;

    try {
      const result = await Swal.fire({
        title: t('prescriptionsTable.areYouSure'),
        text: t('prescriptionsTable.assignPrescriptionTo', { pharmacy: selectedPharmacy.name }),
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: t('prescriptionsTable.yesAssignIt')
      });

      if (result.isConfirmed) {
        handleModalClose();
        await assignDocument({id:selectedDocument.id,data:{
          documentId: selectedDocument.id,
          pharmacyId: selectedPharmacy.id
        }}).unwrap();

        Swal.fire(
          t('prescriptionsTable.assigned'),
          t('prescriptionsTable.prescriptionAssigned'),
          'success'
        );
        refetch();

      }
    } catch (error) {
      Swal.fire(
        t('prescriptionsTable.error'),
        error.message || t('prescriptionsTable.failedToAssign'),
        'error'
      );
    }
  }, [selectedDocument, selectedPharmacy, handleModalClose, t, assignDocument, refetch]);

  // Handle reject document
  const handleRejectDocument = useCallback(async (documentId) => {
    const { value: reason } = await Swal.fire({
      title: t('prescriptionsTable.rejectPrescription'),
      input: 'textarea',
      inputLabel: t('prescriptionsTable.reasonForRejection'),
      inputPlaceholder: t('prescriptionsTable.enterRejectionReason'),
      inputAttributes: {
        'aria-label': 'Type your rejection reason here'
      },
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: t('prescriptionsTable.reject'),
      cancelButtonText: t('prescriptionsTable.cancel'),
      inputValidator: (value) => {
        if (!value) {
          return t('prescriptionsTable.provideReason');
        }
      }
    });

    if (reason) {
      try {
        await rejectDocument({id:documentId,data:{
          reason
        }}).unwrap();

        Swal.fire(
          t('prescriptionsTable.rejected'),
          t('prescriptionsTable.prescriptionRejected'),
          'success'
        );
        refetch();
      } catch (error) {
        Swal.fire(
          t('prescriptionsTable.error'),
          error.message || t('prescriptionsTable.failedToReject'),
          'error'
        );
      }
    }
  }, [t, rejectDocument, refetch]);

  // Simplified columns with minimal dependencies
  const columns = [
    columnHelper.accessor('userName', {
      header: t('prescriptionsTable.user'),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('fileKey', {
      header: t('prescriptionsTable.prescription'),
      cell: (info) => (
        <Image
          src={info.getValue()}
          alt="Prescription"
          boxSize="70px"
          objectFit="cover"
          borderRadius="8px"
          fallbackSrc="https://via.placeholder.com/70"
          loading="lazy"
        />
      ),
    }),
    columnHelper.accessor('userPhone', {
      header: t('prescriptionsTable.phone'),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('createdAt', {
      header: t('prescriptionsTable.uploadDate'),
      cell: (info) => <Text color={textColor}>{formatDate(info.getValue())}</Text>,
    }),
    columnHelper.accessor('status', {
      header: t('prescriptionsTable.status'),
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
          {info.getValue() === 'PENDING_REVIEW' ? t('prescriptionsTable.pendingReview') :
           info.getValue() === 'ASSIGNED' ? t('prescriptionsTable.assigned') :
           info.getValue() === 'REJECTED' ? t('prescriptionsTable.rejected') : info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('pharmacyName', {
      header: t('prescriptionsTable.assignedTo'),
      cell: (info) => (
        <Text color={textColor}>{info.getValue() || t('prescriptionsTable.notAssigned')}</Text>
      ),
    }),
    columnHelper.accessor('rejectionReason', {
      header: t('prescriptionsTable.rejectionReason'),
      cell: (info) => {
        const rejectionReason = info.getValue();
        return rejectionReason ? (
          <Link
            color="red.500"
            textDecoration="underline"
            cursor="pointer"
            onClick={() => handleRejectionReasonClick(rejectionReason)}
            _hover={{ color: 'red.600' }}
            fontSize="sm"
          >
            <Flex align="center" gap="5px">
              <Icon as={FaCircleInfo} w="12px" h="12px" />
              {t('prescriptionsTable.viewReason')}
            </Flex>
          </Link>
        ) : (
          <Text color="gray.400" fontSize="sm">-</Text>
        );
      },
    }),
    columnHelper.accessor('actions', {
      header: t('prescriptionsTable.actions'),
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
    debugTable: true,
  });

  // Memoized pharmacy list
  const pharmacyList = useMemo(() => {
    return pharmacies.map((pharmacy) => (
      <PharmacyItem
        key={pharmacy.id}
        pharmacy={pharmacy}
        isSelected={selectedPharmacy?.id === pharmacy.id}
        onSelect={handlePharmacySelect}
      />
    ));
  }, [pharmacies, selectedPharmacy, handlePharmacySelect]);

  // Show loading state
  if (isLoading || isFetching) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Text>Loading prescriptions...</Text>
      </Flex>
    );
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
            {t('prescriptionsTable.allPrescriptions')}
          </Text>
          <Flex alignItems="center" gap="10px">
            <InputGroup borderRadius="15px" background={"gray.100"} w="300px">
              <InputLeftElement pointerEvents="none">
                <CiSearch color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder={t('prescriptionsTable.search')}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                border="1px solid"
                borderColor="gray.200"
                _hover={{ borderColor: "gray.400" }}
                borderRadius={"15px"}
              />
            </InputGroup>
            <Select
              placeholder={t('prescriptionsTable.filterByStatus')}
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
              <option value="PENDING_REVIEW">{t('prescriptionsTable.pendingReview')}</option>
              <option value="ASSIGNED">{t('prescriptionsTable.assigned')}</option>
              <option value="REJECTED">{t('prescriptionsTable.rejected')}</option>
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
                table.getRowModel().rows.map((row) => {
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
                })
              ) : (
                <Tr>
                  <Td colSpan={columns.length} textAlign="center" py="40px">
                    <Text color={textColor}>{t('prescriptionsTable.noPrescriptionsFound')}</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>

        {/* Pagination */}
        <Flex justifyContent="space-between" alignItems="center" px="25px" py="10px">
          <Text color={textColor}>
            {t('prescriptionsTable.showing')} {documents.length} {t('prescriptionsTable.of')} {totalItems} {t('prescriptionsTable.prescriptions')}
          </Text>
          <Flex gap="10px">
            <Button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              isDisabled={pagination.page === 1}
              variant="outline"
              size="sm"
            >
              {t('prescriptionsTable.previous')}
            </Button>
            <Text color={textColor} px="10px" display="flex" alignItems="center">
              {t('prescriptionsTable.page')} {pagination.page} {t('prescriptionsTable.of')} {totalPages}
            </Text>
            <Button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              isDisabled={pagination.page >= totalPages}
              variant="outline"
              size="sm"
            >
              {t('prescriptionsTable.next')}
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Assign Pharmacy Modal */}
      <Modal isOpen={isOpen} onClose={handleModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('prescriptionsTable.assignPrescriptionToPharmacy')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedDocument && (
              <>
                <Text mb="4">{t('prescriptionsTable.assignPrescriptionFrom')} {selectedDocument.userName} {t('prescriptionsTable.to')}:</Text>
                
                {/* Search Input for Pharmacies */}
                <InputGroup mb="4">
                  <InputLeftElement pointerEvents="none">
                    <CiSearch color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder={t('prescriptionsTable.searchPharmacies')}
                    value={pharmacySearch}
                    onChange={(e) => handlePharmacySearch(e.target.value)}
                    border="1px solid"
                    borderColor="gray.200"
                    _hover={{ borderColor: "gray.400" }}
                    borderRadius="15px"
                  />
                </InputGroup>
                
                <Box maxH="400px" overflowY="auto">
                  {pharmaciesLoading ? (
                    <Flex justify="center" align="center" py="20px">
                      <Text>Loading pharmacies...</Text>
                    </Flex>
                  ) : pharmaciesError ? (
                    <Flex direction="column" justify="center" align="center" py="20px" gap="10px">
                      <Text color="red.500">Error loading pharmacies: {pharmaciesError.message}</Text>
                      <Button size="sm" onClick={refetchPharmacies}>
                        Retry
                      </Button>
                    </Flex>
                  ) : pharmacies.length === 0 ? (
                    <Flex justify="center" align="center" py="20px">
                      <Text>No pharmacies available.</Text>
                    </Flex>
                  ) : (
                    pharmacyList
                  )}
                </Box>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleModalClose}>
              {t('prescriptionsTable.cancel')}
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleAssignPharmacy}
              isDisabled={!selectedPharmacy || pharmaciesLoading}
            >
              {t('prescriptionsTable.assignTo')} {selectedPharmacy?.name || t('prescriptionsTable.pharmacy')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal isOpen={isRejectionModalOpen} onClose={handleRejectionModalClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex align="center" gap="10px">
              <Icon as={FaCircleInfo} color="red.500" w="20px" h="20px" />
              {t('prescriptionsTable.rejectionReason')}
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="4" align="stretch">
              <Box
                p="4"
                bg="red.50"
                border="1px solid"
                borderColor="red.200"
                borderRadius="md"
              >
                <Text fontSize="sm" color="red.600" fontWeight="medium" mb="2">
                  {t('prescriptionsTable.reasonForRejection')}:
                </Text>
                <Text color="gray.700" lineHeight="1.6">
                  {selectedRejectionReason}
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" variant="outline" onClick={handleRejectionModalClose}>
              {t('prescriptionsTable.close')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default React.memo(Prescriptions);
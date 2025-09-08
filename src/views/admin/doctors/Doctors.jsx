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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Checkbox,
  Spinner,
  useToast,
  Badge,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  VStack,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';
import { CgAssign } from 'react-icons/cg';
import { SearchIcon } from '@chakra-ui/icons';
import Card from 'components/card/Card';
import { EditIcon } from '@chakra-ui/icons';
import { FaEye, FaTrash } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { useGetDoctorsQuery, useDeleteDoctorMutation, useAssignDoctorMutation } from 'api/doctorSlice';
import Swal from 'sweetalert2';
import { useGetClinicsQuery } from 'api/clinicSlice';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../contexts/LanguageContext';

const columnHelper = createColumnHelper();

const Doctors = () => {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  
  // Create query parameters object
  const queryParams = React.useMemo(() => {
    const params = { page, limit };
    
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }
    
    if (statusFilter) {
      params.isActive = statusFilter;
    }
    
    return params;
  }, [page, limit, searchQuery, statusFilter]);

  const { data: doctorsData, isLoading, isError, refetch } = useGetDoctorsQuery(queryParams);
  const [deleteDoctor] = useDeleteDoctorMutation();
  const [assignDoctor] = useAssignDoctorMutation();
  const { data: clinicsResponse } = useGetClinicsQuery({});
  const clinics = clinicsResponse?.data || [];
  const toast = useToast();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  
  const doctors = doctorsData?.data || [];
  const pagination = doctorsData?.pagination || { page: 1, limit: 10, totalItems: 0, totalPages: 1 };
  
  const [selectedDoctorId, setSelectedDoctorId] = React.useState(null);
  const [selectedClinics, setSelectedClinics] = React.useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const [sorting, setSorting] = React.useState([]);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const inputBg = useColorModeValue('white', 'navy.800');
  const searchBg = useColorModeValue('gray.100', 'navy.700');

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  React.useEffect(() => {
    refetch();
  }, []);



  const handleAssignClick = (doctorId) => {
    const doctor = doctors.find(doc => doc.id === doctorId);
    const existingClinicIds = doctor?.clinics?.map(clinic => clinic.clinicId) || [];
    
    setSelectedDoctorId(doctorId);
    setSelectedClinics(existingClinicIds);
    onOpen();
  };

  const handleClinicSelection = (clinicId) => {
    setSelectedClinics(prev => 
      prev.includes(clinicId) 
        ? prev.filter(id => id !== clinicId) 
        : [...prev, clinicId]
    );
  };

  const handleAssignClinics = async () => {
    try {
      const id = selectedDoctorId;
      await assignDoctor({ id, data: { clinicIds: selectedClinics } }).unwrap();
      
      toast({
        title: t('doctors.success'),
        description: t('doctors.clinicsAssignedSuccessfully'),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      refetch();
      onClose();
      setSelectedClinics([]);
    } catch (err) {
      toast({
        title: t('doctors.error'),
        description: err.data?.message || t('doctors.failedToAssignClinics'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    const result = await Swal.fire({
      title: t('doctors.confirmDelete'),
      text: t('doctors.deleteWarning'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('doctors.delete')
    });
    
    if (result.isConfirmed) {
      try {
        await deleteDoctor(doctorId).unwrap();
        toast({
          title: t('doctors.deleteSuccess'),
          description: t('doctors.doctorDeleted'),
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        refetch();
      } catch (err) {
        toast({
          title: t('doctors.error'),
          description: err.data?.message || t('doctors.failedToDeleteDoctor'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPage(1);
  };

  const columns = [
    columnHelper.accessor('firstName', {
      id: 'firstName',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('doctors.firstName')}
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('lastName', {
      id: 'lastName',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('doctors.lastName')}
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('specialization', {
      id: 'specialization',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('doctors.specialization')}
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm">
          {info.getValue() || t('doctors.notAvailable')}
        </Text>
      ),
    }),
    columnHelper.accessor('isActive', {
      id: 'isActive',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('doctors.status')}
        </Text>
      ),
      cell: (info) => (
        <Badge
          variant="solid"
          colorScheme={info.getValue() ? 'green' : 'red'}
          fontSize="sm"
          borderRadius="8px"
        >
          {info.getValue() ? t('doctors.active') : t('doctors.inactive')}
        </Badge>
      ),
    }),
    columnHelper.accessor('creator', {
      id: 'creator',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('doctors.createdBy')}
        </Text>
      ),
      cell: (info) => {
        const creator = info.getValue();
        return (
          <Text color={textColor} fontSize="sm">
            {creator?.name || t('doctors.notAvailable')}
          </Text>
        );
      },
    }),
    columnHelper.accessor('createdAt', {
      id: 'createdAt',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('doctors.createdAt')}
        </Text>
      ),
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
    columnHelper.accessor('row', {
      id: 'actions',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          {t('doctors.actions')}
        </Text>
      ),
      cell: (info) => (
        <Flex align="center">
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="red.500"
            as={FaTrash}
            cursor="pointer"
            onClick={() => handleDeleteDoctor(info.row.original.id)}
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="green.500"
            as={EditIcon}
            cursor="pointer"
            onClick={() => navigate(`/admin/edit/doctor/${info.row.original.id}`)}
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="blue.500"
            as={FaEye}
            cursor="pointer"
            onClick={() => navigate(`/admin/doctor/${info.row.original.id}`)}
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color={textColor}
            as={CgAssign}
            cursor="pointer"
            title={t('doctors.assignToClinic')}
            onClick={() => handleAssignClick(info.row.original.id)}
          />
        </Flex>
      ),
    }),
  ];

  const table = useReactTable({
    data: doctors,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Text>{t('doctors.errorLoadingDoctors')}</Text>
      </Flex>
    );
  }

  return (
    <div className="container" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
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
            {t('doctors.allDoctors')}
          </Text>
          <Button
            variant="darkBrand"
            color="white"
            fontSize="sm"
            fontWeight="500"
            borderRadius="70px"
            px="24px"
            py="5px"
            onClick={() => navigate('/admin/add/doctor')}
            width={'200px'}
          >
            {t('doctors.addNewDoctor')}
          </Button>
        </Flex>

        {/* Search and Filter Section */}
        <Box px="25px" mb="20px">
          <HStack spacing={4} wrap="wrap" align="end">
            {/* Search Bar */}
            <Box flex="1" minW="200px">
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder={t('doctors.searchDoctors')}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  bg={inputBg}
                  color={textColor}
                  borderColor={borderColor}
                  _placeholder={{ color: 'gray.400' }}
                />
              </InputGroup>
            </Box>

            {/* Status Filter */}
            <Box minW="150px">
              <Text color={textColor} fontSize="sm" fontWeight="600" mb={2}>
                {t('doctors.status')}
              </Text>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                bg={inputBg}
                color={textColor}
                borderColor={borderColor}
                placeholder={t('doctors.allStatuses')}
              >
                <option value="true">{t('doctors.active')}</option>
                <option value="false">{t('doctors.inactive')}</option>
              </Select>
            </Box>

            {/* Clear Filters Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              color={textColor}
              borderColor={borderColor}
              _hover={{ bg: searchBg }}
            >
              {t('doctors.clearFilters')}
            </Button>
          </HStack>
        </Box>
        <Box>
          <Table variant="simple" color="gray.500" mb="24px" mt="12px" dir="ltr">
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
              {table.getRowModel().rows.map((row) => {
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
            <Text mr={2}>{t('doctors.rowsPerPage')}:</Text>
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
              {t('doctors.page')} {page} {t('doctors.of')} {pagination.totalPages}
            </Text>
            <Button
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              isDisabled={page === 1}
              mr={2}
            >
              {t('doctors.previous')}
            </Button>
            <Button
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              isDisabled={page === pagination.totalPages}
            >
              {t('doctors.next')}
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Modal for Assigning Clinics */}
      <Modal isOpen={isOpen} onClose={() => {
        onClose();
        setSelectedClinics([]);
      }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('doctors.assignClinicsToDoctor')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {clinics.map((clinic) => (
              <Box key={clinic.id} mb={2}>
                <Checkbox
                  isChecked={selectedClinics.includes(clinic.id)}
                  onChange={() => handleClinicSelection(clinic.id)}
                  colorScheme="brandScheme"
                >
                  {clinic.name}
                </Checkbox>
              </Box>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="darkBrand"
              color="white"
              fontSize="sm"
              fontWeight="500"
              borderRadius="70px"
              px="24px"
              py="5px"
              mr={3}
              onClick={handleAssignClinics}
            >
              {t('doctors.assign')}
            </Button>
            <Button 
              bg='gray.200'
              mr={3} 
              onClick={() => {
                onClose();
                setSelectedClinics([]);
              }}
            >
              {t('doctors.cancel')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Doctors;
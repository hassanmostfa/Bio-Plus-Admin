import {
  Box,
  Flex,
  Icon,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Button,
  Image,
  Badge,
  useToast,
  FormControl,
  FormLabel,
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
import { FaCreativeCommons, FaEye } from 'react-icons/fa6';
import { useGetAppointmentsQuery } from 'api/appointmentSlice';
import { useGetClinicsQuery } from 'api/clinicSlice';
import { useGetDoctorsQuery } from 'api/doctorSlice';
import { BsFillPersonBadgeFill } from 'react-icons/bs';
import { BiBuilding, BiVideo } from 'react-icons/bi';
import { useTranslation } from "react-i18next";
import { useLanguage } from "contexts/LanguageContext";


const columnHelper = createColumnHelper();

const Appointments = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const toast = useToast();

  // State for filters and pagination
  const [filters, setFilters] = useState({
    doctorId: '',
    clinicId: '',
    consultType: '',
    startDate: '',
    endDate: '',
    status: '',
  });
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // API calls
  const { data: clinicsResponse } = useGetClinicsQuery({ page: 1, limit: 100 });
  const { data: doctorsData } = useGetDoctorsQuery({ page: 1, limit: 100 });
  const { data: appointmentsData, refetch } = useGetAppointmentsQuery({
    page,
    limit,
    ...filters,
  });

  // Data extraction
  const clinics = clinicsResponse?.data || [];
  const doctors = doctorsData?.data || [];
  const appointments = appointmentsData?.data || [];
  const pagination = appointmentsData?.pagination || { page: 1, limit: 10, totalItems: 0, totalPages: 1 };

  // Format time from minutes since midnight to HH:MM
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}`;
  };

  // Format appointment date
  const formatAppointmentDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Apply filters (will trigger automatic refetch via RTK Query)
  const applyFilters = () => {
    refetch();
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      doctorId: '',
      clinicId: '',
      consultationType: '',
      startDate: '',
      endDate: '',
    });
  };

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');

  const columns = [
    columnHelper.accessor('appointmentNumber', {
      header: t('appointments.appointmentNumber'),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('patient.name', {
      header: t('appointments.patient'),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('patient.phoneNumber', {
      header: t('appointments.phone'),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('doctor', {
      header: t('appointments.doctor'),
      cell: (info) => (
        <Flex align="center">
          <Image
            src={info.getValue()?.imageUrl || 'https://via.placeholder.com/40'}
            boxSize="40px"
            borderRadius="full"
            mr="2"
            alt={t('appointments.doctor')}
          />
          <Box>
            <Text color={textColor} fontWeight="bold">
              {info.getValue()?.name}
            </Text>
            <Text color="gray.500" fontSize="sm">
              {info.getValue()?.specialization}
            </Text>
          </Box>
        </Flex>
      ),
    }),
    columnHelper.accessor('location.clinicName', {
      header: t('appointments.clinic'),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('consultationType', {
      header: t('appointments.type'),
      cell: (info) => (
        <Badge
          colorScheme={info.getValue() === 'AT_CLINIC' ? 'blue' : 'green'}
          p="5px 10px"
          borderRadius="8px"
        >
          {info.getValue() === 'AT_CLINIC' ? t('appointments.atClinic') : t('appointments.online')}
        </Badge>
      ),
    }),
    columnHelper.accessor('appointmentDate', {
      header: t('appointments.date'),
      cell: (info) => (
        <Text color={textColor}>{formatAppointmentDate(info.getValue())}</Text>
      ),
    }),
    columnHelper.accessor('formattedTime', {
      header: t('appointments.time'),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('status', {
      header: t('appointments.status'),
      cell: (info) => (
        <Badge
          colorScheme={
            info.getValue() === 'CONFIRMED'
              ? 'green'
              : info.getValue() === 'PENDING'
              ? 'yellow'
              : 'red'
          }
          p="5px 10px"
          borderRadius="8px"
        >
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('paymentStatus', {
      header: t('appointments.payment'),
      cell: (info) => (
        <Badge
          colorScheme={info.getValue() === 'PAID' ? 'green' : 'red'}
          p="5px 10px"
          borderRadius="8px"
        >
          {info.getValue()}
        </Badge>
      ),
    }),
    // columnHelper.accessor('actions', {
    //   header: 'Actions',
    //   cell: (info) => (
    //     <Icon
    //       w="18px"
    //       h="18px"
    //       color="blue.500"
    //       as={FaEye}
    //       cursor="pointer"
    //       onClick={() => console.log('View appointment:', info.row.original.id)}
    //     />
    //   ),
    // }),
  ];

  const table = useReactTable({
    data: appointments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  return (
    <div className="container" >
      <Card
        flexDirection="column"
        w="100%"
        px="0px"
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
      >
        <Flex px="25px" mb="20px" justifyContent="space-between" align="center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            lineHeight="100%"
          >
            {t('appointments.title')}
          </Text>
        </Flex>

      {/* Filters */}
      <Box bg={cardBg} boxShadow="sm" mb={4} borderRadius="lg" p={6}>
        <Text fontSize="lg" fontWeight="bold" mb={4} color={textColor}>
          {t('appointments.filterConsultations')}
        </Text>
        <Flex wrap="wrap" gap={4}>
          {/* Doctor Filter */}
          <Box flex="1 1 250px" minW="220px">
            <FormControl>
              <FormLabel color={textColor}>{t('appointments.doctor')}</FormLabel>
              <Select
                value={filters.doctorId}
                onChange={(e) => handleFilterChange('doctorId', e.target.value)}
                bg={inputBg}
                color={textColor}
                // dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
              >
                <option value="">{t('appointments.allDoctors')}</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.fullName}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Box>
          {/* Clinic Filter */}
          <Box flex="1 1 250px" minW="220px">
            <FormControl>
              <FormLabel color={textColor}>{t('appointments.clinic')}</FormLabel>
              <Select
                value={filters.clinicId}
                onChange={(e) => handleFilterChange('clinicId', e.target.value)}
                bg={inputBg}
                color={textColor}
                // dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
              >
                <option value="">{t('appointments.allClinics')}</option>
                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Box>
          {/* Consultation Type Filter */}
          <Box flex="1 1 250px" minW="220px">
            <FormControl>
              <FormLabel color={textColor}>{t('appointments.consultationType')}</FormLabel>
              <Select
                value={filters.consultType}
                onChange={(e) => handleFilterChange('consultType', e.target.value)}
                bg={inputBg}
                color={textColor}
                // dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
              >
                <option value="">{t('appointments.allTypes')}</option>
                <option value="AT_CLINIC">{t('appointments.atClinic')}</option>
                <option value="ONLINE">{t('appointments.online')}</option>
              </Select>
            </FormControl>
          </Box>
          {/* Date Range Filter - Start Date */}
          <Box flex="1 1 200px" minW="180px">
            <FormControl>
              <FormLabel color={textColor}>{t('appointments.fromDate')}</FormLabel>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                bg={inputBg}
                color={textColor}
                dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
              />
            </FormControl>
          </Box>
          {/* Date Range Filter - End Date */}
          <Box flex="1 1 200px" minW="180px">
            <FormControl>
              <FormLabel color={textColor}>{t('appointments.toDate')}</FormLabel>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                bg={inputBg}
                color={textColor}
                dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
              />
            </FormControl>
          </Box>
          {/* Buttons */}
          <Flex align="flex-end" gap={2} minW="200px">
            <Button colorScheme="blue" onClick={applyFilters}>
              {t('appointments.applyFilters')}
            </Button>
            <Button variant="outline" colorScheme="gray" onClick={resetFilters}>
              {t('appointments.reset')}
            </Button>
          </Flex>
        </Flex>
      </Box>

        {/* Table */}
        <Box overflowX="auto">
          <Table
            variant="simple"
            color="gray.500"
            mb="24px"
            mt="12px"
            minWidth="1000px"
          >
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
            <Text mr={2}>{t('common.rowsPerPage')}:</Text>
            <Select
              value={limit}
              onChange={handleLimitChange}
              w="70px"
              size="sm"
              dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Select>
          </Flex>
          <Flex align="center">
            <Text mr={4}>
              {t('common.page')} {page} {t('common.of')} {pagination.totalPages}
            </Text>
            <Button
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              isDisabled={page === 1}
              mr={2}
            >
              {t('common.previous')}
            </Button>
            <Button
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              isDisabled={page === pagination.totalPages}
            >
              {t('common.next')}
            </Button>
          </Flex>
        </Flex>
      </Card>
    </div>
  );
};

export default Appointments;

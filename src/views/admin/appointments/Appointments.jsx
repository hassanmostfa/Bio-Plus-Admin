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


const columnHelper = createColumnHelper();

const Appointments = () => {
  const toast = useToast();

  // State for filters
  const [filters, setFilters] = useState({
    doctorId: '',
    clinicId: '',
    consultType: '',
    startDate: '',
    endDate: '',
    status: '',
  });

  // API calls
  const { data: clinicsResponse } = useGetClinicsQuery({ page: 1, limit: 100 });
  const { data: doctorsData } = useGetDoctorsQuery({ page: 1, limit: 100 });
  const { data: appointmentsData, refetch } = useGetAppointmentsQuery({
    page: 1,
    limit: 10,
    ...filters,
  });

  // Data extraction
  const clinics = clinicsResponse?.data || [];
  const doctors = doctorsData?.data || [];
  const appointments = appointmentsData?.data || [];

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

  const columns = [
    columnHelper.accessor('appointmentNumber', {
      header: 'Appointment #',
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('patient.name', {
      header: 'Patient',
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('patient.phoneNumber', {
      header: 'Phone',
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('doctor', {
      header: 'Doctor',
      cell: (info) => (
        <Flex align="center">
          <Image
            src={info.getValue()?.imageUrl || 'https://via.placeholder.com/40'}
            boxSize="40px"
            borderRadius="full"
            mr="2"
            alt="Doctor"
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
      header: 'Clinic',
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('consultationType', {
      header: 'Type',
      cell: (info) => (
        <Badge
          colorScheme={info.getValue() === 'AT_CLINIC' ? 'blue' : 'green'}
          p="5px 10px"
          borderRadius="8px"
        >
          {info.getValue() === 'AT_CLINIC' ? 'At Clinic' : 'Online'}
        </Badge>
      ),
    }),
    columnHelper.accessor('appointmentDate', {
      header: 'Date',
      cell: (info) => (
        <Text color={textColor}>{formatAppointmentDate(info.getValue())}</Text>
      ),
    }),
    columnHelper.accessor('formattedTime', {
      header: 'Time',
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
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
      header: 'Payment',
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

  return (
    <div className="container">
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
            Appointments
          </Text>
        </Flex>

      {/* Filters */}
<div className="card shadow-sm mb-4">
  <div className="card-body">
    <h5 className="card-title mb-3">
      <i className="bi bi-funnel me-2"></i>
      Filter Consultations
    </h5>
    
    <div className="row g-3">
      {/* Doctor Filter */}
      <div className="col-md-6 col-lg-4">
        <div className="form-group">
          <label htmlFor="doctorFilter" className="form-label">Doctor</label>
          <div className="input-group">
            <span className="input-group-text">
              <BsFillPersonBadgeFill className="bi me-2" />
            </span>
            <select
              id="doctorFilter"
              className="form-select"
              value={filters.doctorId}
              onChange={(e) => handleFilterChange('doctorId', e.target.value)}
            >
              <option value="">All Doctors</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Clinic Filter */}
      <div className="col-md-6 col-lg-4">
        <div className="form-group">
          <label htmlFor="clinicFilter" className="form-label">Clinic</label>
          <div className="input-group">
            <span className="input-group-text">
              <BiBuilding className="bi me-2" />
            </span>
            <select
              id="clinicFilter"
              className="form-select"
              value={filters.clinicId}
              onChange={(e) => handleFilterChange('clinicId', e.target.value)}
            >
              <option value="">All Clinics</option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Consultation Type Filter */}
      <div className="col-md-6 col-lg-4">
        <div className="form-group">
          <label htmlFor="consultTypeFilter" className="form-label">Consultation Type</label>
          <div className="input-group">
            <span className="input-group-text">

                <BiVideo className="bi me-2" />

            </span>
            <select
              id="consultTypeFilter"
              className="form-select"
              value={filters.consultType}
              onChange={(e) => handleFilterChange('consultType', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="AT_CLINIC">At Clinic</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>
        </div>
      </div>

      {/* Date Range Filter - Start Date */}
      <div className="col-md-6 col-lg-4">
        <div className="form-group">
          <label htmlFor="startDateFilter" className="form-label">From Date</label>
          <div className="input-group">
           
            <input
              id="startDateFilter"
              type="date"
              className="form-control"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Date Range Filter - End Date */}
      <div className="col-md-6 col-lg-4">
        <div className="form-group">
          <label htmlFor="endDateFilter" className="form-label">To Date</label>
          <div className="input-group">
           
            <input
              id="endDateFilter" 
              type="date"
              className="form-control"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="col-md-6 col-lg-4 d-flex align-items-end">
        <div className="d-grid gap-2 d-md-flex justify-content-md-end w-100 mt-2">
          <button
            onClick={applyFilters}
            className="btn btn-primary"
            type="button"
          >
            <i className="bi bi-search me-1"></i> Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="btn btn-outline-secondary"
            type="button"
          >
            <i className="bi bi-x-circle me-1"></i> Reset
          </button>
        </div>
      </div>
    </div>

    {/* Active Filters Display (Optional) */}
    <div className="mt-3">
      <div className="d-flex flex-wrap gap-2" id="activeFilters">
        {/* This area can be used to show active filter tags */}
      </div>
    </div>
  </div>
</div>

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
      </Card>
    </div>
  );
};

export default Appointments;

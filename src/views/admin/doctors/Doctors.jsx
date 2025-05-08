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
import Card from 'components/card/Card';
import { EditIcon } from '@chakra-ui/icons';
import { FaEye, FaTrash } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { useGetDoctorsQuery, useDeleteDoctorMutation, useAssignDoctorMutation } from 'api/doctorSlice';
import Swal from 'sweetalert2';
import { useGetClinicsQuery } from 'api/clinicSlice';

const columnHelper = createColumnHelper();

const Doctors = () => {
  const { data: doctorsData, isLoading, isError, refetch } = useGetDoctorsQuery();
  const [deleteDoctor] = useDeleteDoctorMutation();
  const [assignDoctor] = useAssignDoctorMutation();
  const { data: clinicsResponse } = useGetClinicsQuery({});
  const clinics = clinicsResponse?.data || [];
  const toast = useToast();
  
  const doctors = doctorsData?.data || [];
  
  const [selectedDoctorId, setSelectedDoctorId] = React.useState(null);
  const [selectedClinics, setSelectedClinics] = React.useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const [sorting, setSorting] = React.useState([]);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

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
        title: 'Success',
        description: 'Clinics assigned successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      refetch();
      onClose();
      setSelectedClinics([]);
    } catch (err) {
      toast({
        title: 'Error',
        description: err.data?.message || 'Failed to assign clinics',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (result.isConfirmed) {
      try {
        await deleteDoctor(doctorId).unwrap();
        toast({
          title: 'Deleted!',
          description: 'Doctor has been deleted.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        refetch();
      } catch (err) {
        toast({
          title: 'Error',
          description: err.data?.message || 'Failed to delete doctor',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const columns = [
    columnHelper.accessor('id', {
      id: 'id',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          ID
        </Text>
      ),
      cell: (info) => (
        <Flex align="center">
          <Text color={textColor} fontSize="sm">
            {info.getValue().substring(0, 8)}...
          </Text>
        </Flex>
      ),
    }),
    columnHelper.accessor('firstName', {
      id: 'firstName',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          First Name
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
          Last Name
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
          Specialization
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm">
          {info.getValue() || 'N/A'}
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
          Status
        </Text>
      ),
      cell: (info) => (
        <Badge
          variant="solid"
          colorScheme={info.getValue() ? 'green' : 'red'}
          fontSize="sm"
          borderRadius="8px"
        >
          {info.getValue() ? 'Active' : 'Inactive'}
        </Badge>
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
            title="Assign to clinic"
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
        <Text>Error loading doctors. Please try again.</Text>
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
            All Doctors
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
            Add New Doctor
          </Button>
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

      {/* Modal for Assigning Clinics */}
      <Modal isOpen={isOpen} onClose={() => {
        onClose();
        setSelectedClinics([]);
      }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Assign Clinics to Doctor</ModalHeader>
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
              Assign
            </Button>
            <Button 
              bg='gray.200'
              mr={3} 
              onClick={() => {
                onClose();
                setSelectedClinics([]);
              }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Doctors;
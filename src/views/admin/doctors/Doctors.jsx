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

const columnHelper = createColumnHelper();

const Doctors = () => {
  const [data, setData] = React.useState([
    {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      certifications: 'MD, PhD',
      languages: 'English, Arabic',
      about: {
        en: 'Experienced doctor with over 10 years of practice.',
        ar: 'طبيب ذو خبرة تزيد عن 10 سنوات في الممارسة.',
      },
      phones: ['+1234567890', '+0987654321'],
      email: 'john.doe@example.com',
      password: '********', // Masked for security
      fees: 100,
    },
    {
      id: 2,
      first_name: 'Jane',
      last_name: 'Smith',
      certifications: 'MBBS, MS',
      languages: 'English, French',
      about: {
        en: 'Specialist in cardiology and internal medicine.',
        ar: 'أخصائي في أمراض القلب والطب الباطني.',
      },
      phones: ['+1122334455'],
      email: 'jane.smith@example.com',
      password: '********', // Masked for security
      fees: 150,
    },
    {
      id: 3,
      first_name: 'Ahmed',
      last_name: 'Ali',
      certifications: 'BDS, MDS',
      languages: 'Arabic, English',
      about: {
        en: 'Dental surgeon with expertise in orthodontics.',
        ar: 'جراح أسنان متخصص في تقويم الأسنان.',
      },
      phones: ['+9988776655'],
      email: 'ahmed.ali@example.com',
      password: '********', // Masked for security
      fees: 200,
    },
  ]);

  const [selectedDoctorId, setSelectedDoctorId] = React.useState(null); // Track the selected doctor ID
  const [selectedClinics, setSelectedClinics] = React.useState([]); // Track selected clinics for assignment
  const { isOpen, onOpen, onClose } = useDisclosure(); // Modal state
  const navigate = useNavigate();
  const [sorting, setSorting] = React.useState([]);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Example list of clinics
  const clinics = [
    { id: 1, name: 'Clinic A' },
    { id: 2, name: 'Clinic B' },
    { id: 3, name: 'Clinic C' },
  ];

  // Open modal and set the selected doctor ID
  const handleAssignClick = (doctorId) => {
    setSelectedDoctorId(doctorId);
    onOpen();
  };

  // Handle clinic selection
  const handleClinicSelection = (clinicId) => {
    if (selectedClinics.includes(clinicId)) {
      setSelectedClinics(selectedClinics.filter((id) => id !== clinicId)); // Deselect
    } else {
      setSelectedClinics([...selectedClinics, clinicId]); // Select
    }
  };

  // Assign selected clinics to the doctor
  const handleAssignClinics = () => {
    console.log(`Assigning clinics ${selectedClinics.join(', ')} to doctor ${selectedDoctorId}`);
    onClose(); // Close the modal
    setSelectedClinics([]); // Reset selected clinics
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
          <Text color={textColor}>
            {info.getValue()}
          </Text>
        </Flex>
      ),
    }),
    columnHelper.accessor('first_name', {
      id: 'first_name',
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
        <Text color={textColor}>
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('last_name', {
      id: 'last_name',
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
        <Text color={textColor}>
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('certifications', {
      id: 'certifications',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          Certifications
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor}>
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('languages', {
      id: 'languages',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          Languages
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor}>
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('phones', {
      id: 'phones',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          Phones
        </Text>
      ),
      cell: (info) => (
        <Box>
          {info.getValue().map((phone, index) => (
            <Text key={index} color={textColor}>
              {phone}
            </Text>
          ))}
        </Box>
      ),
    }),
    columnHelper.accessor('email', {
      id: 'email',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          Email
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor}>
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('fees', {
      id: 'fees',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          Fees
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor}>
          ${info.getValue()}
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
      cell: (info) => (
        <Flex align="center">
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="red.500"
            as={FaTrash}
            cursor="pointer"
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="green.500"
            as={EditIcon}
            cursor="pointer"
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="blue.500"
            as={FaEye}
            cursor="pointer"
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color={textColor}
            as={CgAssign}
            cursor="pointer"
            title="Assign to clinic"
            onClick={() => handleAssignClick(info.row.original.id)} // Open modal on click
          />
        </Flex>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

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
              {table
                .getRowModel()
                .rows.slice(0, 11)
                .map((row) => {
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
      <Modal isOpen={isOpen} onClose={onClose}>
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
              onClick={handleAssignClinics}>
              Assign
            </Button>
            <Button bg={useColorModeValue('gray.200', 'gray.600')} mr={3} onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Doctors;
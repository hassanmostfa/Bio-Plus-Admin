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
import { EditIcon, SearchIcon } from '@chakra-ui/icons';
import { FaEye, FaTrash } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { CgAssign } from 'react-icons/cg';
import { CiSearch } from "react-icons/ci";
import { useGetDocumentsQuery } from 'api/documentSlice';
import { useAssignDocumentMutation } from 'api/documentSlice';
import { useRejectDocumentMutation } from 'api/documentSlice';
import { useGetPharmaciesQuery } from 'api/pharmacySlice';
const columnHelper = createColumnHelper();

const Presecibtions = () => {
  const {data:documents,refetch} = useGetDocumentsQuery({});
  const [assignDocument] = useAssignDocumentMutation();
  const [rejectDocument] = useRejectDocumentMutation();
   const { data: pharmacyData } = useGetPharmaciesQuery({
      page: 1,
      limit:100000
    });
    console.log(documents, "documents");
    console.log(pharmacyData, "pharmacyData");
    
  React.useEffect(() => {
    refetch();
  }, []);
  const [data, setData] = React.useState([
    {
      user: 'John Doe',
      image: 'https://th.bing.com/th/id/R.55a346616e34a25b0823473b586c94bd?rik=07czPXKi2V2Kpw&pid=ImgRaw&r=0',
      phoneNumber: '+96599123456',
      uploadDate: '2023-10-15',
      status: 'new',
      assignedPharmacy: 'pending',
    },
    {
      user: 'Jane Smith',
      image: 'https://th.bing.com/th/id/R.55a346616e34a25b0823473b586c94bd?rik=07czPXKi2V2Kpw&pid=ImgRaw&r=0',
      phoneNumber: '+96599123457',
      uploadDate: '2023-09-10',
      status: 'assigned',
      assignedPharmacy: 'Al-Shifa Pharmacy',
    },
    {
      user: 'Emily Johnson',
      image: 'https://th.bing.com/th/id/R.55a346616e34a25b0823473b586c94bd?rik=07czPXKi2V2Kpw&pid=ImgRaw&r=0',
      phoneNumber: '+96599123458',
      uploadDate: '2023-08-05',
      status: 'checkout',
      assignedPharmacy: 'Al-Noor Pharmacy',
    },
  ]);

  const navigate = useNavigate();
  const [sorting, setSorting] = React.useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure(); // Modal state
  const [selectedPrescription, setSelectedPrescription] = React.useState(null); // Track selected prescription

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // List of pharmacies for the modal
  const pharmacies = [
    { id: 1, name: 'Al-Shifa Pharmacy' },
    { id: 2, name: 'Al-Noor Pharmacy' },
    { id: 3, name: 'Al-Razi Pharmacy' },
  ];

  const columns = [
    columnHelper.accessor('user', {
      header: 'User',
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('image', {
      header: 'Image',
      cell: (info) => (
        <img
          src={info.getValue()}
          alt="Prescription"
          width={70}
          height={70}
          style={{ borderRadius: '8px' }}
        />
      ),
    }),
    columnHelper.accessor('phoneNumber', {
      header: 'Phone Number',
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('uploadDate', {
      header: 'Upload Date',
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <Text
          fontWeight="bold"
          textAlign={'center'}
          color={
            info.getValue() === 'new'
              ? 'blue.500'
              : info.getValue() === 'assigned'
              ? 'green.500'
              : 'orange.500'
          }
        >
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('assignedPharmacy', {
      header: 'Assigned Pharmacy',
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('actions', {
      header: 'Actions',
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
            onClick={() => navigate('/admin/pharmacy-branches')}
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="black"
            title="Assign"
            as={CgAssign}
            cursor="pointer"
            onClick={() => {
              setSelectedPrescription(info.row.original); // Set selected prescription
              onOpen(); // Open modal
            }}
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

  // Handle assigning a pharmacy
  const handleAssignPharmacy = (pharmacy) => {
    const updatedData = data.map((item) =>
      item.user === selectedPrescription.user
        ? { ...item, assignedPharmacy: pharmacy.name }
        : item
    );
    setData(updatedData);
    console.log('Assigned Pharmacy:', pharmacy.name , "to", selectedPrescription.user);
    
    onClose(); // Close modal
  };

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Search Input */}
          <Box>
              <InputGroup borderRadius="15px" background={"gray.100"} w={{ base: "300", md: "300px" }}>
                  <InputLeftElement pointerEvents="none">
                      <CiSearch color="gray.400" />
                  </InputLeftElement>
                  <Input
                      variant="outline"
                      fontSize="sm"
                      placeholder="Search..."
                      border="1px solid"
                      borderColor="gray.200"
                      _hover={{ borderColor: "gray.400" }}
                      borderRadius={"15px"}
                  />
              </InputGroup>
          </Box>
          <Select
              placeholder="Filter by status"
              width="300px"
              background={"gray.100"}
              onChange={(e) => {
                const statusValue = e.target.value;
                const filteredData = data.filter((item) =>
                  statusValue ? item.status === statusValue : true
                );
                setData(filteredData);
              }}
              variant="outline"
                fontSize="sm"
                border="1px solid"
                borderColor="gray.200"
                _hover={{ borderColor: "gray.400" }}
                borderRadius={"15px"}
            >
              <option value="new">New</option>
              <option value="assigned">Assigned</option>
              <option value="checkout">Checkout</option>
            </Select>
          </div>
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

      {/* Modal for Assigning Pharmacy */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Assign Pharmacy</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb="4">Select a pharmacy to assign:</Text>
            {pharmacies.map((pharmacy) => (
              <Box
                key={pharmacy.id}
                p="2"
                mb="2"
                borderWidth="1px"
                borderRadius="md"
                cursor="pointer"
                _hover={{ bg: 'gray.100' }}
                onClick={() => handleAssignPharmacy(pharmacy)}
              >
                <Text>{pharmacy.name}</Text>
              </Box>
            ))}
          </ModalBody>
          <ModalFooter>
            {/* <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button> */}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Presecibtions;
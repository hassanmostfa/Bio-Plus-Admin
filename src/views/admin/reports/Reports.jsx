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
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getFilteredRowModel,
} from '@tanstack/react-table';
import * as React from 'react';
import Card from 'components/card/Card';
import { EditIcon, SearchIcon } from '@chakra-ui/icons';
import { FaEye, FaTrash, FaDownload } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const columnHelper = createColumnHelper();

const Reports = () => {
  const [activeTab, setActiveTab] = React.useState(0);
  const [tableData, setTableData] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const navigate = useNavigate();
  const [sorting, setSorting] = React.useState([]);
  const toast = useToast();

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Mock data for demonstration - replace with your actual data fetching logic
  const inventoryData = React.useMemo(() => [
    { id: 1, product_name: 'Product A', sku: 'SKU001', variant: 'Variant 1', category: 'Medication', qty: 100, status: 'In Stock' },
    { id: 2, product_name: 'Product B', sku: 'SKU002', variant: 'Variant 2', category: 'Equipment', qty: 50, status: 'Low Stock' },
    { id: 3, product_name: 'Product C', sku: 'SKU003', variant: 'Variant 1', category: 'Supplies', qty: 0, status: 'Out of Stock' },
  ], []);

  const pharmacyData = React.useMemo(() => [
    { id: 1, pharmacy_en_name: 'Pharmacy One', pharmacy_ar_name: 'صيدلية واحد', revenue_share: '15%', created_at: '2023-01-15' },
    { id: 2, pharmacy_en_name: 'Pharmacy Two', pharmacy_ar_name: 'صيدلية اثنان', revenue_share: '20%', created_at: '2023-02-20' },
    { id: 3, pharmacy_en_name: 'Pharmacy Three', pharmacy_ar_name: 'صيدلية ثلاثة', revenue_share: '10%', created_at: '2023-03-10' },
  ], []);

  const clinicData = React.useMemo(() => [
    { id: 1, clinic_en_name: 'Clinic One', clinic_ar_name: 'العيادة الأولى', created_at: '2023-01-10' },
    { id: 2, clinic_en_name: 'Clinic Two', clinic_ar_name: 'العيادة الثانية', created_at: '2023-02-15' },
    { id: 3, clinic_en_name: 'Clinic Three', clinic_ar_name: 'العيادة الثالثة', created_at: '2023-03-20' },
  ], []);

  // Update table data when tab changes
  React.useEffect(() => {
    let newData = [];
    switch(activeTab) {
      case 0:
        newData = inventoryData;
        break;
      case 1:
        newData = pharmacyData;
        break;
      case 2:
        newData = clinicData;
        break;
      default:
        break;
    }
    setTableData(newData);
    setGlobalFilter(''); // Reset search filter when changing tabs
  }, [activeTab, inventoryData, pharmacyData, clinicData]);

  const handleDownload = () => {
    // Combine all data from all tabs
    const allData = {
      inventory: inventoryData,
      pharmacy: pharmacyData,
      clinics: clinicData
    };
    
    // Create a blob with the data
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reports_data.json';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Download Started',
      description: 'All records from all tabs are being downloaded.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const inventoryColumns = [
    columnHelper.accessor('product_name', {
      id: 'product_name',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          Product Name
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('category', {
      id: 'category',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          Category
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('sku', {
      id: 'sku',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          SKU
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('variant', {
      id: 'variant',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          Variant
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('qty', {
      id: 'qty',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          Quantity
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('status', {
      id: 'status',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          Status
        </Text>
      ),
      cell: (info) => (
        <Text 
          color={info.getValue() === 'In Stock' ? 'green.500' : 
                info.getValue() === 'Low Stock' ? 'orange.500' : 'red.500'} 
          fontSize="sm"
        >
          {info.getValue()}
        </Text>
      ),
    }),
  ];

  const pharmacyColumns = [
    columnHelper.accessor('pharmacy_en_name', {
      id: 'pharmacy_en_name',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          Pharmacy (EN)
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('pharmacy_ar_name', {
      id: 'pharmacy_ar_name',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          Pharmacy (AR)
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" dir="rtl">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('revenue_share', {
      id: 'revenue_share',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          Revenue Share
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('created_at', {
      id: 'created_at',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          Created At
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm">
          {info.getValue()}
        </Text>
      ),
    }),
  ];

  const clinicColumns = [
    columnHelper.accessor('clinic_en_name', {
      id: 'clinic_en_name',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          Clinic (EN)
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('clinic_ar_name', {
      id: 'clinic_ar_name',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          Clinic (AR)
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" dir="rtl">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('created_at', {
      id: 'created_at',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          Created At
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm">
          {info.getValue()}
        </Text>
      ),
    }),
  ];

  const getColumns = () => {
    switch(activeTab) {
      case 0: return inventoryColumns;
      case 1: return pharmacyColumns;
      case 2: return clinicColumns;
      default: return inventoryColumns;
    }
  };

  const table = useReactTable({
    data: tableData,
    columns: getColumns(),
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
  });

  return (
    <Box className="container">
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
            Reports
          </Text>
          <IconButton
            aria-label="Download all reports"
            icon={<FaDownload />}
            colorScheme="green"
            variant="outline"
            onClick={handleDownload}
          />
        </Flex>

        <Tabs variant="soft-rounded" my={"20px"} colorScheme="brand" onChange={(index) => setActiveTab(index)}>
          <TabList px="25px">
            <Tab>Inventory</Tab>
            <Tab>Pharmacy</Tab>
            <Tab>Clinics</Tab>
          </TabList>

          <Flex px="25px" my="20px">
            <InputGroup maxW="400px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                borderRadius={"20px"}
                placeholder="Search..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </InputGroup>
          </Flex>

          <TabPanels>
            <TabPanel>
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
                  {table.getRowModel().rows.map((row) => (
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
                  ))}
                </Tbody>
              </Table>
            </TabPanel>
            <TabPanel>
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
                  {table.getRowModel().rows.map((row) => (
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
                  ))}
                </Tbody>
              </Table>
            </TabPanel>
            <TabPanel>
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
                  {table.getRowModel().rows.map((row) => (
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
                  ))}
                </Tbody>
              </Table>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </Box>
  );
};

export default Reports;
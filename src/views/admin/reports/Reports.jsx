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
import {
  useGetProductsStockReportQuery,
  useGetPharmaciesRevenueReportQuery,
  useGetClinicsReportQuery,
} from "../../../api/reportsSlice"; // Import RTK Query hooks
import Pagination from "theme/components/Pagination"; // Assuming you have a Pagination component
import * as XLSX from 'xlsx'; // Import xlsx library

const columnHelper = createColumnHelper();

const Reports = () => {
  const [activeTab, setActiveTab] = React.useState(0);
  const [tableData, setTableData] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const navigate = useNavigate();
  const [sorting, setSorting] = React.useState([]);
  const toast = useToast();

  // Pagination state for Inventory tab
  const [inventoryPage, setInventoryPage] = React.useState(1);
  const [inventoryLimit, setInventoryLimit] = React.useState(10);

  // Pagination state for Pharmacy tab
  const [pharmacyPage, setPharmacyPage] = React.useState(1);
  const [pharmacyLimit, setPharmacyLimit] = React.useState(10);

  // Pagination state for Clinics tab
  const [clinicPage, setClinicPage] = React.useState(1);
  const [clinicLimit, setClinicLimit] = React.useState(10);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Fetch data using RTK Query hooks
  const { data: inventoryData, isLoading: isInventoryLoading, isError: isInventoryError, error: inventoryError } = useGetProductsStockReportQuery({ page: inventoryPage, limit: inventoryLimit });
  const { data: pharmacyData, isLoading: isPharmacyLoading, isError: isPharmacyError, error: pharmacyError } = useGetPharmaciesRevenueReportQuery({ page: pharmacyPage, limit: pharmacyLimit });
  const { data: clinicData, isLoading: isClinicLoading, isError: isClinicError, error: clinicError } = useGetClinicsReportQuery({ page: clinicPage, limit: clinicLimit });

  // Update table data when tab changes or data is fetched
  React.useEffect(() => {
    let newData = [];
    switch(activeTab) {
      case 0:
        newData = inventoryData?.data?.products || []; // Use fetched inventory products
        break;
      case 1:
        newData = pharmacyData?.data?.pharmacies || []; // Use fetched pharmacy data
        console.log(newData);
        
        break;
      case 2:
        newData = clinicData?.data.clinics || []; // Use fetched clinic data
        break;
      default:
        break;
    }
    setTableData(newData);
    setGlobalFilter(''); // Reset search filter when changing tabs
  }, [activeTab, inventoryData, pharmacyData, clinicData]);

  const handleDownload = () => {
    const workbook = XLSX.utils.book_new();
    let fileName = 'report_data.xlsx';
    let sheetData = [];
    let sheetName = '';

    switch (activeTab) {
      case 0: // Inventory Tab
        sheetData = inventoryData?.data?.products?.map(item => ({
          'Product Name': item.name,
          'Category': item.category,
          'SKU': item.sku,
          'Quantity': item.quantity,
          'Stock Status': item.stockStatus,
          'Created At': item.createdAt, // Assuming createdAt exists in inventory data
        })) || [];
        sheetName = 'Inventory Report';
        fileName = 'inventory_report.xlsx';
        break;
      case 1: // Pharmacy Tab
        sheetData = pharmacyData?.data?.pharmacies?.map(item => ({
          'Pharmacy Name': item.name,
          'Revenue Share': item.revenueShare,
          'Created At': item.createdAt,
        })) || [];
        sheetName = 'Pharmacy Report';
        fileName = 'pharmacy_report.xlsx';
        break;
      case 2: // Clinics Tab
        sheetData = clinicData?.data?.clinics?.map(item => ({
          'Clinic Name': item.name,
          'Created At': item.createdAt,
        })) || [];
        sheetName = 'Clinics Report';
        fileName = 'clinics_report.xlsx';
        break;
      default:
        // If no tab is active or an unexpected value, do nothing or show an error
        toast({
          title: 'Export Error',
          description: 'Could not determine which report to export.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
    }

    if (sheetData.length === 0) {
      toast({
        title: 'No Data to Export',
        description: `No data available in the ${sheetName} to export.`, // Use sheetName for clarity
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    XLSX.writeFile(workbook, fileName);

    toast({
      title: 'Download Started',
      description: `${sheetName} is being downloaded as Excel.`, // Use sheetName for clarity
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const inventoryColumns = [
    columnHelper.accessor('name', {
      id: 'name',
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
    columnHelper.accessor('quantity', {
      id: 'quantity',
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
    columnHelper.accessor('stockStatus', {
      id: 'stockStatus',
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
    columnHelper.accessor('name', {
      id: 'name',
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
    columnHelper.accessor('revenueShare', {
      id: 'revenueShare',
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
    columnHelper.accessor('createdAt', {
      id: 'createdAt',
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
    columnHelper.accessor('name', {
      id: 'name',
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
    columnHelper.accessor('createdAt', {
      id: 'createdAt',
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
              {isInventoryLoading ? (
                <Flex justifyContent="center" alignItems="center" height="200px">
                  <Spinner size="xl" />
                </Flex>
              ) : isInventoryError ? (
                <Flex justifyContent="center" alignItems="center" height="200px">
                  <Text color="red.500">Error loading inventory report: {inventoryError.message}</Text>
                </Flex>
              ) : (
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
              )}

              {/* Pagination for Inventory tab */}
              {inventoryData?.data?.pagination?.totalPages > 1 && (
                <Flex justifyContent="center" mt={4} pb={4}>
                  <Pagination
                    currentPage={inventoryPage}
                    totalPages={inventoryData.data.pagination.totalPages}
                    onPageChange={setInventoryPage}
                  />
                </Flex>
              )}
            </TabPanel>
            <TabPanel>
              {isPharmacyLoading ? (
                <Flex justifyContent="center" alignItems="center" height="200px">
                  <Spinner size="xl" />
                </Flex>
              ) : isPharmacyError ? (
                <Flex justifyContent="center" alignItems="center" height="200px">
                  <Text color="red.500">Error loading pharmacy report: {pharmacyError.message}</Text>
                </Flex>
              ) : (
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
              )}

              {/* Pagination for Pharmacy tab */}
              {pharmacyData?.data?.pagination?.totalPages > 1 && (
                <Flex justifyContent="center" mt={4} pb={4}>
                  <Pagination
                    currentPage={pharmacyPage}
                    totalPages={pharmacyData.data.pagination.totalPages}
                    onPageChange={setPharmacyPage}
                  />
                </Flex>
              )}
            </TabPanel>
            <TabPanel>
              {isClinicLoading ? (
                <Flex justifyContent="center" alignItems="center" height="200px">
                  <Spinner size="xl" />
                </Flex>
              ) : isClinicError ? (
                <Flex justifyContent="center" alignItems="center" height="200px">
                  <Text color="red.500">Error loading clinics report: {clinicError.message}</Text>
                </Flex>
              ) : (
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
              )}

              {/* Pagination for Clinics tab */}
              {clinicData?.data?.pagination?.totalPages > 1 && (
                <Flex justifyContent="center" mt={4} pb={4}>
                  <Pagination
                    currentPage={clinicPage}
                    totalPages={clinicData.data.pagination.totalPages}
                    onPageChange={setClinicPage}
                  />
                </Flex>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </Box>
  );
};

export default Reports;
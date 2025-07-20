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
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';
import { MdCancel, MdCheckCircle, MdOutlineError } from 'react-icons/md';
import Card from 'components/card/Card';
import Menu from 'components/menu/MainMenu';
import { EditIcon, PlusSquareIcon } from '@chakra-ui/icons';
import { FaEye, FaTrash } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { useGetAboutQuery } from 'api/aboutSlice';

const columnHelper = createColumnHelper();

const About = () => {
  const { data: aboutResponse, isLoading, refetch } = useGetAboutQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  
  // Use API data if available, otherwise use empty array
  const data = aboutResponse?.data ? [aboutResponse.data] : [];

  const navigate = useNavigate();
  const [sorting, setSorting] = React.useState([]);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const cardBg = useColorModeValue('white', 'navy.700');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const tableRowHoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const tableHeaderHoverBg = useColorModeValue('gray.100', 'gray.600');

  const columns = [
    columnHelper.accessor('phone', {
      id: 'phone',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          Phone
        </Text>
      ),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('location', {
      id: 'location',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
        Location
        </Text>
      ),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor('map_url', {
      id: 'map_url',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          Map Url
        </Text>
      ),
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
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
          <Flex align="center" gap={2}>
            <Icon
              w="20px"
              h="20px"
              color="red.500"
              as={FaTrash}
              cursor="pointer"
              _hover={{ 
                color: 'red.600',
                transform: 'scale(1.1)'
              }}
              transition="all 0.2s"
              title="Delete"
            />
            <Icon
              w="20px"
              h="20px"
              color="green.500"
              as={EditIcon}
              cursor="pointer"
              _hover={{ 
                color: 'green.600',
                transform: 'scale(1.1)'
              }}
              transition="all 0.2s"
              title="Edit"
            />
            <Icon
              w="20px"
              h="20px"
              color="blue.500"
              as={FaEye}
              cursor="pointer"
              _hover={{ 
                color: 'blue.600',
                transform: 'scale(1.1)'
              }}
              transition="all 0.2s"
              title="View"
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

  // Refetch data when component mounts or when navigating back
  React.useEffect(() => {
    refetch();
  }, [refetch]);

  // Refetch data when the component becomes visible (focus)
  React.useEffect(() => {
    const handleFocus = () => {
      refetch();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="container">
        <Card
          flexDirection="column"
          w="100%"
          px="0px"
          overflowX={{ sm: 'scroll', lg: 'hidden' }}
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          boxShadow="lg"
        >
          <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
            <Text
              color={textColor}
              fontSize="22px"
              fontWeight="700"
              lineHeight="100%"
            >
              All About-us
            </Text>
          </Flex>
          <Box p="20px" textAlign="center">
            <Text color={textColor}>Loading...</Text>
          </Box>
        </Card>
      </div>
    );
  }

  return (
    <div className="container">
      <Card
        flexDirection="column"
        w="100%"
        px="0px"
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
        bg={cardBg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        boxShadow="lg"
      >
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            lineHeight="100%"
          >
            All About-us
          </Text>
          <Button
            variant="darkBrand"
            color="white"
            fontSize="sm"
            fontWeight="500"
            borderRadius="70px"
            px="24px"
            py="5px"
            onClick={() => navigate('/admin/cms/add-about')}
            width={'200px'}
            _hover={{ 
              transform: 'translateY(-1px)',
              boxShadow: 'lg'
            }}
            transition="all 0.2s"
          >
            <PlusSquareIcon me="10px" />
            Create New About-us
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
                          bg={tableHeaderBg}
                          _hover={{ bg: tableHeaderHoverBg }}
                          transition="background 0.2s"
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
                    <Tr 
                      key={row.id}
                      _hover={{ bg: tableRowHoverBg }}
                      transition="background 0.2s"
                    >
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <Td
                            key={cell.id}
                            fontSize={{ sm: '14px' }}
                            minW={{ sm: '150px', md: '200px', lg: 'auto' }}
                            borderColor={borderColor}
                            py={3}
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

export default About;

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
  import Card from 'components/card/Card';
  import { EditIcon, PlusSquareIcon } from '@chakra-ui/icons';
  import { FaEye, FaTrash  } from 'react-icons/fa6';
  import { IoIosSend } from "react-icons/io";
  import { useNavigate } from 'react-router-dom';
  
  const columnHelper = createColumnHelper();

const PrivcyAndPolicy = () => {
  const [data, setData] = React.useState([
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
      ar_title: 'مرحبا مستخدم جديد',
      en_title: 'New user registered',
      ar_description: 'مرحبا مستخدم جديد في نظامنا',
      en_description: 'New user registered in our system',
      date: '2023-10-01',
      status: 'Unread',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
      ar_title: 'مرحبا مستخدم جديد',
      en_title: 'New user registered',
      ar_description: 'مرحبا مستخدم جديد في نظامنا',
      en_description: 'New user registered in our system',
      date: '2023-10-01',
      status: 'Read',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
      ar_title: 'مرحبا مستخدم جديد',
      en_title: 'New user registered',
      ar_description: 'مرحبا مستخدم جديد في نظامنا',
      en_description: 'New user registered in our system',
      date: '2023-10-01',
      status: 'Unread',
    },
  ]);

  const navigate = useNavigate();
  const [sorting, setSorting] = React.useState([]);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const cardBg = useColorModeValue('white', 'navy.700');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');
  const tableRowHoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const tableHeaderHoverBg = useColorModeValue('gray.100', 'gray.600');
  
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
            <Text color={textColor} fontWeight="600">
              #{info.getValue()}
            </Text>
          </Flex>
        ),
      }),
      columnHelper.accessor('en_description', {
        id: 'en_description',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            EN Privcy Content
          </Text>
        ),
        cell: (info) => (
          <Text color={textColor} fontSize="sm" lineHeight="1.4">
            {info.getValue().length > 25 ? info.getValue().slice(0, 25) + '...' : info.getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor('ar_description', {
        id: 'ar_description',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            AR Privcy Content
          </Text>
        ),
        cell: (info) => (
          <Text color={textColor} fontSize="sm" lineHeight="1.4" dir="rtl">
            {info.getValue().length > 20 ? info.getValue().slice(0, 20) + '...' : info.getValue()}
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
              Privacies & Policies
            </Text>
            <Button
              variant='darkBrand'
              color='white'
              fontSize='sm'
              fontWeight='500'
              borderRadius='70px'
              px='24px'
              py='5px'
              onClick={() => navigate('/admin/cms/add-privcy')}
              width={'200px'}
              _hover={{ 
                transform: 'translateY(-1px)',
                boxShadow: 'lg'
              }}
              transition="all 0.2s"
            >
              <PlusSquareIcon me="10px" />
              Add New Field
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

export default PrivcyAndPolicy
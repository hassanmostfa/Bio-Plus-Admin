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
  import { FaEye, FaTrash } from 'react-icons/fa6';
  import { useNavigate } from 'react-router-dom';
  
  const columnHelper = createColumnHelper();
  
  const Returns = () => {
    const [data, setData] = React.useState([
      {
        id: 1,
        image:'https://th.bing.com/th/id/OIP.2tLY6p_5ubR3VvBlrP4iyAHaE8?w=254&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',
        en_name:'brand 1',
        ar_name:'العلامة التجارية 1'
      },
      {
        id: 2,
        image:'https://th.bing.com/th/id/OIP.2tLY6p_5ubR3VvBlrP4iyAHaE8?w=254&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',
        en_name:'brand 2',
        ar_name:'العلامة التجارية 2'
      },
      {
        id: 3,
        image:'https://th.bing.com/th/id/OIP.2tLY6p_5ubR3VvBlrP4iyAHaE8?w=254&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',
        en_name:'brand 3',
        ar_name:'العلامة التجارية 3'
      },
    ]);
  
    const navigate = useNavigate();
    const [sorting, setSorting] = React.useState([]);
  
    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  
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
      columnHelper.accessor('en_name', {
        id: 'en_name',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
           En-Content
          </Text>
        ),
        cell: (info) => (
          <Text color={textColor}>
            {info.getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor('ar_name', {
        id: 'ar_name',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
           Ar-Content
          </Text>
        ),
        cell: (info) => (
          <Text color={textColor}>
            {info.getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor('image', {
        id: 'image',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            Icon
          </Text>
        ),
        cell: (info) => (
          <img src={info.getValue()} alt="Brand" width={70} height={70} style={{ borderRadius: '8px' }} />
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
              All Returns
            </Text>
            <Button
              variant='darkBrand'
              color='white'
              fontSize='sm'
              fontWeight='500'
              borderRadius='70px'
              px='24px'
              py='5px'
              onClick={() => navigate('/admin/cms/add-return')}
              width={'200px'}
            >
              <PlusSquareIcon me="10px" />
              Create New Return
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
      </div>
    );
  };

export default Returns
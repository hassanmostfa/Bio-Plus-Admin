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
  import { FaEye, FaTrash  } from 'react-icons/fa6';
  import { IoIosSend } from "react-icons/io";
  import { useNavigate } from 'react-router-dom';
  
  const columnHelper = createColumnHelper();
  
  const Blogs = () => {
    const [data, setData] = React.useState([
      {
        id: 1,
        image:'https://www.example.com/image1.jpg',
        ar_title:'مقالة جديدة',
        en_title: 'New Blog Post',
        ar_description: 'هذه وصف لمقالة جديدة',
        en_description: 'This is a description of a new blog post',
        date: '2023-11-01',
        status: 'Published',
      },
      {
        id: 2,
        image:'https://www.example.com/image2.jpg',
        ar_title:'مقالة قديمة',
        en_title: 'Old Blog Post',
        ar_description: 'هذه وصف لمقالة قديمة',
        en_description: 'This is a description of an old blog post',
        date: '2023-10-15',
        status: 'Draft',
      },
      {
        id: 3,
        image:'https://www.example.com/image3.jpg',
        ar_title:'مقالة مميزة',
        en_title: 'Featured Blog Post',
        ar_description: 'هذه وصف لمقالة مميزة',
        en_description: 'This is a description of a featured blog post',
        date: '2023-09-25',
        status: 'Published',
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
      columnHelper.accessor('ar_title', {
        id: 'ar_title',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            AR Title
          </Text>
        ),
        cell: (info) => (
          <Text color={textColor}>
            {info.getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor('en_title', {
        id: 'en_title',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            EN Title
          </Text>
        ),
        cell: (info) => (
          <Text color={textColor}>
            {info.getValue()}
          </Text>
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
            EN Description
          </Text>
        ),
        cell: (info) => (
          <Text color={textColor}>
            {info.getValue().slice(0, 20) + '...'}
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
            AR Description
          </Text>
        ),
        cell: (info) => (
          <Text color={textColor}>
            {info.getValue().slice(0, 15) + '...'}
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
              as={IoIosSend}
              cursor="pointer"
              title = "Send Notification"
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
              Blogs
            </Text>
            <Button
              variant='darkBrand'
              color='white'
              fontSize='sm'
              fontWeight='500'
              borderRadius='70px'
              px='24px'
              py='5px'
              onClick={() => navigate('/admin/add-blogs')}
              width={'200px'}
            >
              <PlusSquareIcon me="10px" />
              Add Artical
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
  
  export default Blogs;
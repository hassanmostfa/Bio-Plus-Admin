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
const columnHelper = createColumnHelper();

const Admins = () => {
  const [data, setData] = React.useState([
    {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'Super Admin',
      status: 'Active',
    },
    {
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane@example.com',
      password: 'password123',
      role: 'Admin',
      status: 'Inactive',
    },
  ]);

  const navigate = useNavigate();
  const [sorting, setSorting] = React.useState([]);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  const columns = [
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
        <Flex align="center">
          <Text color={textColor}>
            {info.getValue()}
          </Text>
        </Flex>
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
        <Flex align="center">
          <Text color={textColor}>
            {info.getValue()}
          </Text>
        </Flex>
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
          EMAIL
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} >
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('password', {
      id: 'password',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          Password
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor}>
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('role', {
      id: 'role',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          ROLE
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor}>
          {info.getValue()}
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
            Admins
          </Text>
          <Button
            variant='darkBrand'
            color='white'
            fontSize='sm'
            fontWeight='500'
            borderRadius='70px'
            px='24px'
            py='5px'
            onClick={() => navigate('/admin/add-admin')}
            width={'200px'}
            >
              
            <PlusSquareIcon me="10px" />
            Create New Admin
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

export default Admins;

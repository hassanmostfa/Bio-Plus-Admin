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
import { useGetVarientsQuery } from 'api/varientSlice';
import Swal from 'sweetalert2';
import { useDeleteVarientMutation } from 'api/varientSlice';

const columnHelper = createColumnHelper();

const Variants = () => {
  const navigate = useNavigate();
  const { data: variantsResponse, isLoading, isError, refetch } = useGetVarientsQuery();
  const [deleteVariant, { isLoading: isDeleting }] = useDeleteVarientMutation(); // Delete mutation
  const [sorting, setSorting] = React.useState([]);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Transform API data into table data format
  const tableData = React.useMemo(() => {
    if (!variantsResponse?.data) return [];

    return variantsResponse.data.map((variant, index) => ({
      index: index + 1,
      id: variant.id,
      variant_name: variant.name, // Variant name
      no_of_attributes: variant.numberOfAttributes, // Number of attributes
    }));
  }, [variantsResponse]);

  // Handle delete variant
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      });

      if (result.isConfirmed) {
        await deleteVariant(id).unwrap(); // Delete the variant
        refetch(); // Refetch the data
        Swal.fire('Deleted!', 'The variant has been deleted.', 'success');
      }
    } catch (error) {
      console.error('Failed to delete variant:', error);
      Swal.fire('Error!', 'Failed to delete the variant.', 'error');
    }
  };

  const columns = [
    columnHelper.accessor('index', {
      id: 'index',
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
          <Text color={textColor}>{info.getValue()}</Text>
        </Flex>
      ),
    }),
    columnHelper.accessor('variant_name', {
      id: 'variant_name',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          Variant Name
        </Text>
      ),
      cell: (info) => (
        <Flex align="center">
          <Text color={textColor}>{info.getValue()}</Text>
        </Flex>
      ),
    }),
    columnHelper.accessor('no_of_attributes', {
      id: 'no_of_attributes',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          Number of Attributes
        </Text>
      ),
      cell: (info) => (
        <Flex align="center">
          <Text color={textColor}>{info.getValue()}</Text>
        </Flex>
      ),
    }),
    columnHelper.accessor('id', {
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
            onClick={() => handleDelete(info.getValue())} // Delete action
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="green.500"
            as={EditIcon}
            cursor="pointer"
            onClick={() => navigate(`/admin/edit-variant/${info.getValue()}`)} // Edit action
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="blue.500"
            as={FaEye}
            cursor="pointer"
            onClick={() => navigate(`/admin/variant-attributes/${info.getValue()}`)} // View attributes action
          />
        </Flex>
      ),
    }),
  ];

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  if (isLoading) return <Text>Loading...</Text>;
  if (isError) return <Text>Error loading variants.</Text>;

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
            All Variants
          </Text>
          <Button
            variant="darkBrand"
            color="white"
            fontSize="sm"
            fontWeight="500"
            borderRadius="70px"
            px="24px"
            py="5px"
            onClick={() => navigate('/admin/add-variant')}
            width={'230px'}
          >
            <PlusSquareIcon me="10px" />
            Create New Variant
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
    </div>
  );
};

export default Variants;
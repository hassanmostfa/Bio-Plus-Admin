import {
  Box,
  Grid,
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
  Image,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Spinner,
  Tooltip,
  Input,
  Select,
  Skeleton,
  useToast,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React, { useEffect, useMemo, useState } from 'react';
import { MdCheckCircle, MdCancel } from 'react-icons/md';
import Card from 'components/card/Card';
import { EditIcon, PlusSquareIcon } from '@chakra-ui/icons';
import { FaEye, FaTrash, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useGetBannersQuery, useDeleteBannerMutation } from 'api/bannerSlice';
import Swal from 'sweetalert2';
// import { format } from 'date-fns';

const columnHelper = createColumnHelper();

const Banner = () => {
  // State management
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBanner, setSelectedBanner] = useState(null);
  
  // API hooks
  const { 
    data: bannersResponse, 
    isLoading, 
    isFetching,
    error,
    refetch 
  } = useGetBannersQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined
  });
  
  const [deleteBanner] = useDeleteBannerMutation();

  useEffect(()=>{
    refetch();
  },[]);

  const navigate = useNavigate();
  const toast = useToast();
  
  // Colors and styles
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const hoverColor = useColorModeValue('gray.100', 'whiteAlpha.200');

  // Transform and memoize data
  const bannerData = useMemo(() => 
    bannersResponse?.data?.map(banner => ({
      id: banner.id,
      title: banner.title,
      arTitle: banner.translations?.[0]?.title || '',
      imageKey: banner.imageKey,
      link: banner.link,
      linkType: banner.linkType,
      isActive: banner.isActive,
      order: banner.order,
      // createdAt: format(new Date(banner.createdAt), 'PPpp'),
    })) || [],
    [bannersResponse]
  );

  // Handlers
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await deleteBanner(id).unwrap();
        Swal.fire('Deleted!', 'The Banner has been deleted.', 'success');
        refetch();
      }
    } catch (error) {
      Swal.fire('Error!', error.message || 'Failed to delete blog', 'error');
    }
  };

  // const handleStatusChange = async (id, currentStatus) => {
  //   try {
  //     await updateStatus({ id, isActive: !currentStatus }).unwrap();
  //     toast({
  //       title: 'Success',
  //       description: `Banner ${!currentStatus ? 'activated' : 'deactivated'}`,
  //       status: 'success',
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //     refetch();
  //   } catch (error) {
  //     toast({
  //       title: 'Error',
  //       description: error.data?.message || 'Failed to update status',
  //       status: 'error',
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   }
  // };

  const handleView = (banner) => {
    setSelectedBanner(banner);
    onOpen();
  };

  // Table columns
  const columns = useMemo(() => [
    columnHelper.accessor('title', {
      id: 'title',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          Title
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" noOfLines={1}>
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('arTitle', {
      id: 'arTitle',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          Arabic Title
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" dir="rtl" noOfLines={1}>
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('link', {
      id: 'link',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          Link
        </Text>
      ),
      cell: (info) => (
        <Tooltip label={info.getValue()}>
          <Text color={textColor} fontSize="sm" noOfLines={1}>
            {info.getValue() || 'N/A'}
          </Text>
        </Tooltip>
      ),
    }),
    columnHelper.accessor('linkType', {
      id: 'linkType',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          Link Type
        </Text>
      ),
      cell: (info) => (
        <Badge
          colorScheme={info.getValue() === 'PHARMACY' ? 'blue' : 'purple'}
          fontSize="sm"
        >
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('isActive', {
      id: 'isActive',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          Status
        </Text>
      ),
      cell: (info) => (
        <dev
          // size="sm"
          // variant="ghost"
          // colorScheme={info.getValue() ? 'green' : 'red'}
          // onClick={() => handleStatusChange(info.row.original.id, info.getValue())}
          // leftIcon={info.getValue() ? <MdCheckCircle /> : <MdCancel />}
          // isLoading={isFetching}
        >
          {info.getValue() ? 'Active' : 'Inactive'}
        </dev>
      ),
    }),
    columnHelper.accessor('imageKey', {
      id: 'image',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          Image
        </Text>
      ),
      cell: (info) => (
        <Image
          src={info.getValue()?.startsWith('http') ? info.getValue() : 
               `${process.env.REACT_APP_API_URL}/${info.getValue()}`}
          alt="Banner"
          boxSize="50px"
          objectFit="cover"
          borderRadius="md"
          fallbackSrc="https://via.placeholder.com/50"
        />
      ),
    }),
    columnHelper.accessor('actions', {
      id: 'actions',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
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
              onClick={() => handleDelete(info.row.original.id)}
              _hover={{ color: 'red.600' }}
            />
          
          
            <Icon
              w="18px"
              h="18px"
              me="10px"
              color="green.500"
              as={EditIcon}
              cursor="pointer"
              onClick={() => navigate(`/admin/cms/edit-banner/${info.row.original.id}`)}
              _hover={{ color: 'green.600' }}
            />
          
            <Icon
              w="18px"
              h="18px"
              me="10px"
              color="blue.500"
              as={FaEye}
              cursor="pointer"
              onClick={() => navigate(`/admin/cms/edit-banner/${info.row.original.id}`)}
              _hover={{ color: 'blue.600' }}
            />
          
        </Flex>
      ),
    }),
  ], [textColor, isFetching]);

  // Table instance
  const table = useReactTable({
    data: bannerData,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: bannersResponse?.totalPages ?? -1,
  });

  // Loading and error states
  if (isLoading) {
    return (
      <Card p={4}>
        <Skeleton height="40px" mb={4} />
        <Skeleton height="20px" mb={2} />
        <Skeleton height="20px" mb={2} />
        <Skeleton height="20px" mb={2} />
        <Skeleton height="20px" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card p={4}>
        <Text color="red.500">Error loading banners: {error.data?.message || error.message}</Text>
        <Button mt={4} onClick={refetch}>Retry</Button>
      </Card>
    );
  }

  return (
    <Box className="container">
      <Card
        flexDirection="column"
        w="100%"
        px="0px"
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
      >
        <Flex px="25px" mb="8px" justify="space-between" align="center" wrap="wrap">
          <Text color={textColor} fontSize="22px" fontWeight="700" mb={{ base: 2, md: 0 }}>
            Banners Management
          </Text>
          
          <Flex gap={4} wrap="wrap">
            {/* <Input
              placeholder="Search banners..."
              size="sm"
              maxW="300px"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<FaSearch />}
            />
            
            <Select
              size="sm"
              maxW="200px"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select> */}
            
            <Button
              variant="darkBrand"
              color="white"
              onClick={() => navigate('/admin/cms/add-banner')}
              leftIcon={<PlusSquareIcon />}
              size="sm"
            >
              Add Banner
            </Button>
          </Flex>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple" color="gray.500" mb="24px">
            <Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th
                      key={header.id}
                      colSpan={header.colSpan}
                      borderColor={borderColor}
                      cursor={header.column.getCanSort() ? 'pointer' : 'default'}
                      onClick={header.column.getToggleSortingHandler()}
                      _hover={{
                        bg: header.column.getCanSort() ? hoverColor : 'inherit',
                      }}
                    >
                      <Flex align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted()] ?? null}
                      </Flex>
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {table.getRowModel().rows.map((row) => (
                <Tr key={row.id} _hover={{ bg: hoverColor }}>
                  {row.getVisibleCells().map((cell) => (
                    <Td
                      key={cell.id}
                      fontSize="sm"
                      borderColor="transparent"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Pagination */}
        <Flex
          justify="space-between"
          align="center"
          px="25px"
          pb="15px"
          wrap="wrap"
          gap={4}
        >
          <Text fontSize="sm">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              bannersResponse?.totalCount || 0
            )}{' '}
            of {bannersResponse?.totalCount || 0} entries
          </Text>
          
          <Flex gap={2}>
            <Button
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              isLoading={isFetching}
            >
              Previous
            </Button>
            <Button
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              isLoading={isFetching}
            >
              Next
            </Button>
          </Flex>
        </Flex>
      </Card>

     
    </Box>
  );
};

export default Banner;
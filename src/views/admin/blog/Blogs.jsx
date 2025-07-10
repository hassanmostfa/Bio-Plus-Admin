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
  Input,
  Select,
  Checkbox,
  Tooltip,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React, { useEffect, useState } from 'react';
import { MdCancel, MdCheckCircle } from 'react-icons/md';
import Card from 'components/card/Card';
import { EditIcon, PlusSquareIcon } from '@chakra-ui/icons';
import { FaEye, FaTrash } from 'react-icons/fa6';
import { IoIosSend } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { useGetBlogsQuery, useDeleteBlogMutation } from 'api/blogSlice';
import Swal from 'sweetalert2';

import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const columnHelper = createColumnHelper();

const Blogs = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  // State management
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBlog, setSelectedBlog] = useState(null);

  // API hooks
  const {
    data: blogs,
    isLoading,
    refetch,
  } = useGetBlogsQuery({
    limit: pagination.pageSize,
    page: pagination.pageIndex + 1,
    // search: searchTerm,
    // status: statusFilter !== 'all' ? statusFilter : undefined
  });
  useEffect(() => {
    refetch();
  }, []);
  const [deleteBlog] = useDeleteBlogMutation();
  // const [bulkDeleteBlogs] = useBulkDeleteBlogsMutation();

  const navigate = useNavigate();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Action handlers
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: t('blogs.deleteConfirmTitle'),
        text: t('blogs.deleteConfirmText'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: t('blogs.deleteConfirmButton'),
      });

      if (result.isConfirmed) {
        await deleteBlog(id).unwrap();
        refetch();
        Swal.fire(t('blogs.deleteSuccessTitle'), t('blogs.deleteSuccessText'), 'success');
      }
    } catch (error) {
      Swal.fire(t('blogs.deleteErrorTitle'), error.message || t('blogs.deleteErrorText'), 'error');
    }
  };

  const handleBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection).map(
      (idx) => table.getRowModel().rows[parseInt(idx)].original.id,
    );

    if (selectedIds.length === 0) {
      Swal.fire(t('blogs.infoTitle'), t('blogs.selectAtLeastOne'), 'info');
      return;
    }

    try {
      const result = await Swal.fire({
        title: t('blogs.deleteConfirmTitle'),
        text: t('blogs.bulkDeleteConfirmText', { count: selectedIds.length }),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: t('blogs.bulkDeleteConfirmButton'),
      });

      if (result.isConfirmed) {
        // await bulkDeleteBlogs({ ids: selectedIds }).unwrap();
        setRowSelection({});
        refetch();
        Swal.fire(
          t('blogs.bulkDeleteSuccessTitle'),
          t('blogs.bulkDeleteSuccessText'),
          'success',
        );
      }
    } catch (error) {
      Swal.fire(t('blogs.deleteErrorTitle'), error.message || t('blogs.bulkDeleteErrorText'), 'error');
    }
  };

  const handleView = (blog) => {
    setSelectedBlog(blog);
    onOpen();
  };

  const handleSendNotification = (blogId) => {
    Swal.fire(
      t('blogs.notificationSentTitle'),
      t('blogs.notificationSentText', { blogId }),
      'success',
    );
  };

  // Table columns configuration
  const columns = [
    // columnHelper.display({
    //   id: 'select',
    //   header: ({ table }) => (
    //     <Checkbox
    //       isChecked={table.getIsAllRowsSelected()}
    //       isIndeterminate={table.getIsSomeRowsSelected()}
    //       onChange={table.getToggleAllRowsSelectedHandler()}
    //     />
    //   ),
    //   cell: ({ row }) => (
    //     <Checkbox
    //       isChecked={row.getIsSelected()}
    //       isDisabled={!row.getCanSelect()}
    //       isIndeterminate={row.getIsSomeSelected()}
    //       onChange={row.getToggleSelectedHandler()}
    //     />
    //   ),
    // }),
    columnHelper.accessor('id', {
      id: 'id',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          {t('blogs.table.id')}
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('imageKey', {
      id: 'image',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          {t('blogs.table.image')}
        </Text>
      ),
      cell: (info) => (
        <Image
          src={info.getValue()}
          alt="Blog"
          boxSize="50px"
          objectFit="cover"
          borderRadius="md"
        />
      ),
    }),
    columnHelper.accessor('title', {
      id: 'title',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          {t('blogs.table.enTitle')}
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('title', {
      id: 'title',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          {t('blogs.table.arTitle')}
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" dir="rtl">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('isActive', {
      id: 'status',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          {t('blogs.table.status')}
        </Text>
      ),
      cell: (info) => (
        <Badge colorScheme={info.getValue() ? 'green' : 'orange'} fontSize="sm">
          {info.getValue() ? t('blogs.active') : t('blogs.inactive')}
        </Badge>
      ),
    }),
    columnHelper.accessor('createdAt', {
      id: 'date',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          {t('blogs.table.date')}
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm">
          {new Date(info.getValue()).toLocaleDateString()}
        </Text>
      ),
    }),
    columnHelper.accessor('actions', {
      id: 'actions',
      header: () => (
        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          {t('blogs.table.actions')}
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
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="green.500"
            as={EditIcon}
            cursor="pointer"
            onClick={() =>
              navigate(`/admin/edit-blogs/${info.row.original.id}`)
            }
          />
          <Icon
            w="18px"
            h="18px"
            me="10px"
            color="blue.500"
            as={FaEye}
            cursor="pointer"
            onClick={() =>
              navigate(`/admin/edit-blogs/${info.row.original.id}`)
            }
          />
        </Flex>
      ),
    }),
  ];

  // Table initialization
  const table = useReactTable({
    data: blogs?.data || [],
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: blogs?.totalPages ?? -1,
    enableRowSelection: true,
  });

  if (isLoading) {
    return <Box>{t('blogs.loading')}</Box>;
  }

  return (
    <div className="container">
      <Card
        flexDirection="column"
        w="100%"
        px="0px"
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
      >
        <Flex px="25px" mb="8px" justify="space-between" align="center">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            {t('blogs.title')}
          </Text>
          <Button
            variant="darkBrand"
            color="white"
            onClick={() => navigate('/admin/add-blogs')}
            leftIcon={<PlusSquareIcon />}
          >
            {t('blogs.addBlog')}
          </Button>
        </Flex>

        {/* Search and Filter Controls
        <Flex px="25px" mb="4" gap={4} wrap="wrap">
          <Input
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxW="300px"
          />
          <Select
            placeholder="Filter by status"
            maxW="200px"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </Select>
          {Object.keys(rowSelection).length > 0 && (
            <Button
              colorScheme="red"
              variant="outline"
              onClick={handleBulkDelete}
              leftIcon={<FaTrash />}
            >
              Delete Selected ({Object.keys(rowSelection).length})
            </Button>
          )}
        </Flex> */}

        {/* Blog Table */}
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
                      cursor={
                        header.column.getCanSort() ? 'pointer' : 'default'
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <Flex
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
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {table.getRowModel().rows.map((row) => (
                <Tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Td key={cell.id} fontSize="sm" borderColor="transparent">
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
        </Box>

        {/* Pagination Controls */}
        <Flex
          justify="space-between"
          mt={4}
          px="25px"
          align="center"
          wrap="wrap"
          gap={4}
        >
          <Flex align="center" gap={2}>
            <Text fontSize="sm">
              {t('blogs.showing')}{' '}
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}{' '}
              {t('blogs.to')}{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                blogs?.totalCount || 0,
              )}{' '}
              {t('blogs.of')} {blogs?.totalCount || 0} {t('blogs.entries')}
            </Text>
          </Flex>
          <Flex gap={2}>
            <Button
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {t('blogs.previous')}
            </Button>
            <Button
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {t('blogs.next')}
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Blog Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('blogs.modal.title')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedBlog && (
              <>
                <Flex mb={4} justify="center">
                  <Image
                    src={selectedBlog.image}
                    alt={selectedBlog.translations.en.title}
                    maxH="300px"
                    objectFit="contain"
                  />
                </Flex>
                <Text fontWeight="bold" mb={2}>
                  {t('blogs.modal.englishTitle')}:
                </Text>
                <Text mb={4}>{selectedBlog.translations.en.title}</Text>

                <Text fontWeight="bold" mb={2}>
                  {t('blogs.modal.arabicTitle')}:
                </Text>
                <Text mb={4} dir="rtl">
                  {selectedBlog.translations.ar.title}
                </Text>

                <Text fontWeight="bold" mb={2}>
                  {t('blogs.modal.englishContent')}:
                </Text>
                <Text mb={4} whiteSpace="pre-wrap">
                  {selectedBlog.translations.en.content}
                </Text>

                <Text fontWeight="bold" mb={2}>
                  {t('blogs.modal.arabicContent')}:
                </Text>
                <Text mb={4} dir="rtl" whiteSpace="pre-wrap">
                  {selectedBlog.translations.ar.content}
                </Text>

                <Flex gap={4}>
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      {t('blogs.modal.status')}:
                    </Text>
                    <Badge
                      colorScheme={
                        selectedBlog.status === 'published' ? 'green' : 'orange'
                      }
                      mb={4}
                    >
                      {selectedBlog.status}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      {t('blogs.modal.createdAt')}:
                    </Text>
                    <Text>
                      {new Date(selectedBlog.created_at).toLocaleString()}
                    </Text>
                  </Box>
                </Flex>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              {t('blogs.modal.close')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Blogs;

import {
    Box,
    Button,
    Flex,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useColorModeValue,
    Select,
    Spinner,
    Badge,
    Icon,
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
  import { PlusSquareIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
  import { useNavigate } from 'react-router-dom';
  import { useGetNotificationsQuery } from 'api/notificationsSlice';
  import { useTranslation } from 'react-i18next';
  
  const columnHelper = createColumnHelper();
  
  const AllNotification = () => {
    const navigate = useNavigate();
    const [sorting, setSorting] = React.useState([]);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

    // Fetch notifications with pagination
    const { data: notificationsData, isLoading, error } = useGetNotificationsQuery({
      page: currentPage,
      limit: pageSize,
    });

    const notifications = notificationsData?.data?.items || [];
    const pagination = notificationsData?.data?.pagination || {};
  
    const columns = [
      columnHelper.accessor('title', {
        id: 'title',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            {t('notificationTable.title')}
          </Text>
        ),
        cell: (info) => (
          <Text color={textColor}>
            {info.getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor('body', {
        id: 'body',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            {t('notificationTable.description')}
          </Text>
        ),
        cell: (info) => (
          <Text color={textColor}>
            {info.getValue().slice(0, 30) + '...'}
          </Text>
        ),
      }),
      columnHelper.accessor('type', {
        id: 'type',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            {t('notificationTable.type')}
          </Text>
        ),
        cell: (info) => (
          <Badge
            colorScheme={info.getValue() === 'SYSTEM_NOTIFICATION' ? 'blue' : 'green'}
            variant="subtle"
            fontSize="xs"
          >
            {info.getValue() === 'SYSTEM_NOTIFICATION' ? t('notificationTable.systemNotification') : info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor('isRead', {
        id: 'isRead',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            {t('notificationTable.status')}
          </Text>
        ),
        cell: (info) => (
          <Badge
            colorScheme={info.getValue() ? 'green' : 'red'}
            variant="subtle"
            fontSize="xs"
          >
            {info.getValue() ? t('notificationTable.read') : t('notificationTable.unread')}
          </Badge>
        ),
      }),
      columnHelper.accessor('createdAt', {
        id: 'createdAt',
        header: () => (
          <Text
            justifyContent="space-between"
            align="center"
            fontSize={{ sm: '10px', lg: '12px' }}
            color="gray.400"
          >
            {t('notificationTable.createdAt')}
          </Text>
        ),
        cell: (info) => (
          <Text color={textColor} fontSize="sm">
            {new Date(info.getValue()).toLocaleDateString()}
          </Text>
        ),
      }),
    ];
  
    const table = useReactTable({
      data: notifications,
      columns,
      state: {
        sorting,
      },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      debugTable: true,
    });

    // Pagination handlers
    const handleNextPage = () => {
      if (currentPage < pagination.totalPages) {
        setCurrentPage(currentPage + 1);
      }
    };

    const handlePreviousPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };

    const handlePageSizeChange = (e) => {
      setPageSize(Number(e.target.value));
      setCurrentPage(1); // Reset to the first page when changing the limit
    };
  
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
               textAlign={isRTL ? 'right' : 'left'}
             >
               {t('notificationTable.allNotifications')}
             </Text>
            <Button
              variant='darkBrand'
              color='white'
              fontSize='sm'
              fontWeight='500'
              borderRadius='70px'
              px='24px'
              py='5px'
              onClick={() => navigate('/admin/add-notification')}
              width={'200px'}
            >
              <PlusSquareIcon me="10px" />
              {t('notificationTable.sendNotification')}
            </Button>
          </Flex>


          <Box>
            {isLoading ? (
              <Flex justify="center" align="center" py="50px">
                <Spinner size="lg" />
              </Flex>
                         ) : error ? (
               <Flex justify="center" align="center" py="50px">
                 <Text color="red.500">{t('notificationTable.errorLoadingNotifications')}</Text>
               </Flex>
            ) : (
              <>
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

                                 {/* Pagination Controls */}
                 <Flex justifyContent="space-between" alignItems="center" px="25px" py="10px">
                   <Flex alignItems="center">
                     <Text color={textColor} fontSize="sm" mr="10px">
                       {t('notificationTable.rowsPerPage')}
                     </Text>
                     <Select
                       value={pageSize}
                       onChange={handlePageSizeChange}
                       width="100px"
                       size="sm"
                       variant="outline"
                       borderRadius="md"
                       borderColor="gray.200"
                       _hover={{ borderColor: 'gray.300' }}
                       _focus={{ borderColor: 'blue.500', boxShadow: 'outline' }}
                       dir="ltr"
                     >
                       <option value={10}>10</option>
                       <option value={20}>20</option>
                       <option value={50}>50</option>
                     </Select>
                   </Flex>
                   <Text color={textColor} fontSize="sm">
                     {t('notificationTable.pageOf', { page: pagination.page, totalPages: pagination.totalPages })}
                   </Text>
                   <Flex>
                     <Button
                       onClick={handlePreviousPage}
                       disabled={currentPage === 1}
                       variant="outline"
                       size="sm"
                       mr="10px"
                     >
                       <Icon as={ChevronLeftIcon} mr="5px" />
                       {t('notificationTable.previous')}
                     </Button>
                     <Button
                       onClick={handleNextPage}
                       disabled={currentPage === pagination.totalPages}
                       variant="outline"
                       size="sm"
                     >
                       {t('notificationTable.next')}
                       <Icon as={ChevronRightIcon} ml="5px" />
                     </Button>
                   </Flex>
                 </Flex>
              </>
            )}
          </Box>
        </Card>
      </div>
    );
  };
  
  export default AllNotification;
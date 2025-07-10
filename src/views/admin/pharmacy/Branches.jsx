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
  import { useTranslation } from 'react-i18next';
  import { useLanguage } from '../../../contexts/LanguageContext';
  
  const columnHelper = createColumnHelper();
  
  const Branches = () => {
    const [data, setData] = React.useState([
        {
        name: "Branch Downtown2",
        address: "123 Main Street, Downtown Area2",
        imageKey: "https://th.bing.com/th/id/OIP.2tLY6p_5ubR3VvBlrP4iyAHaE8?w=254&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7",
        pharmacyId: "2708118c-a462-4a4e-9371-6529df890a2a",
        isActive: true
          },
        {
        name: "Branch Downtown2",
        address: "123 Main Street, Downtown Area2",
        imageKey: "https://th.bing.com/th/id/OIP.2tLY6p_5ubR3VvBlrP4iyAHaE8?w=254&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7",
        pharmacyId: "2708118c-a462-4a4e-9371-6529df890a2a",
        isActive: true
          },
        {
        name: "Branch Downtown2",
        address: "123 Main Street, Downtown Area2",
        imageKey: "https://th.bing.com/th/id/OIP.2tLY6p_5ubR3VvBlrP4iyAHaE8?w=254&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7",
        pharmacyId: "2708118c-a462-4a4e-9371-6529df890a2a",
        isActive: true
          },
    ]);
  
    const navigate = useNavigate();
    const [sorting, setSorting] = React.useState([]);
  
    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  
    const { t } = useTranslation();
    const { currentLanguage } = useLanguage();
  
    const columns = [
        columnHelper.accessor('name', {
          header: t('branches.name'),
          cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
        }),
        columnHelper.accessor('imageKey', {
          header: t('branches.image'),
          cell: (info) => (
            <img
              src={info.getValue()}
              alt={t('branches.image')}
              width={70}
              height={70}
              style={{ borderRadius: '8px' }}
            />
          ),
        }),
        columnHelper.accessor('address', {
          header: t('branches.address'),
          cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
        }),
        columnHelper.accessor('isActive', {
          header: t('branches.active'),
          cell: (info) =>
            info.getValue() ? (
              <Text color="green.500">{t('branches.active')}</Text>
            ) : (
              <Text color="red.500">{t('branches.inactive')}</Text>
            ),
        }),
        columnHelper.accessor('actions', {
          header: t('branches.actions'),
          cell: () => (
            <Flex align="center">
              <Icon w="18px" h="18px" me="10px" color="red.500" as={FaTrash} cursor="pointer" />
              <Icon w="18px" h="18px" me="10px" color="green.500" as={EditIcon} cursor="pointer" />
              <Icon w="18px" h="18px" me="10px" color="blue.500" as={FaEye} cursor="pointer"/>
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
              {t('branches.title')}
            </Text>
            <Button
              variant='darkBrand'
              color='white'
              fontSize='sm'
              fontWeight='500'
              borderRadius='70px'
              px='24px'
              py='5px'
              onClick={() => navigate('/admin/add-branch')}
              width={'200px'}
            >
              <PlusSquareIcon me="10px" />
              {t('branches.addBranch')}
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
  
  export default Branches;
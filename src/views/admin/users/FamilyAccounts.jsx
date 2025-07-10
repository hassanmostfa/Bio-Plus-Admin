import React, { useState } from "react";
import {
  Box,
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
  Button,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { IoMdArrowBack } from 'react-icons/io';
import { FaSearch } from 'react-icons/fa';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Card from "components/card/Card";
import { useNavigate, useParams } from "react-router-dom";
import { useGetUserFamilyQuery } from "api/clientSlice";
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper();

const FamilyAccounts = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: familyData } = useGetUserFamilyQuery(id);
  const [searchTerm, setSearchTerm] = useState("");
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const family = familyData?.data || [];
  const filteredData = family.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  const columns = [
    columnHelper.accessor("name", {
      id: "name",
      header: () => <Text color="gray.400">{t('common.name')}</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("age", {
      id: "age",
      header: () => <Text color="gray.400">{t('user.age')}</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("gender", {
      id: "gender",
      header: () => <Text color="gray.400">{t('user.gender')}</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("relationship", {
      id: "relationship",
      header: () => <Text color="gray.400">{t('user.relationship')}</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="container" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card flexDirection="column" w="100%" px="0px" overflowX="auto">
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text color={textColor} fontSize="22px" fontWeight="700" textAlign={isRTL ? 'right' : 'left'}>{t('user.familyAccounts')}</Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('common.back')}
          </Button>
        </Flex>
        {/* <InputGroup mb="4">
          <InputLeftElement pointerEvents="none" children={<FaSearch color="gray.300" />} />
          <Input
            type="text"
            placeholder={t('common.searchByName')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup> */}
        <Box>
          <Table variant="simple" color="gray.500" mb="24px" mt="12px">
            <Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th key={header.id} borderColor={borderColor}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {table.getRowModel().rows.map((row) => (
                <Tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Td key={cell.id} borderColor="transparent">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>
    </div>
  );
};

export default FamilyAccounts;


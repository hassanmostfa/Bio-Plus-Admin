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
  Switch,
} from "@chakra-ui/react";
import { IoMdArrowBack } from 'react-icons/io';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FaEye, FaTrash } from "react-icons/fa6";
import { EditIcon } from "@chakra-ui/icons";
import Card from "components/card/Card";
import { useNavigate, useParams } from "react-router-dom";
import { useGetUserFamilyQuery } from "api/clientSlice";
const columnHelper = createColumnHelper();

const FamilyAccounts = () => {
  const navigate = useNavigate();
  const {id} = useParams();
  const {data:familyData} = useGetUserFamilyQuery(id);
  const family = familyData?.data || [];
  console.log(family);
  
  const [data, setData] = useState([
    {
      name: "John Doe",
      age: 30,
      gender: "Male",
      relationship: "Father",
    },
    {
      name: "John Doe",
      age: 30,
      gender: "Male",
      relationship: "Father",
    },
  ]);

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  // Function to toggle status
  const toggleStatus = (id) => {
    setData((prevData) =>
      prevData.map((user) =>
        user.id === id
          ? { ...user, status: user.status === "Active" ? "Inactive" : "Active" }
          : user
      )
    );
  };

  const columns = [
    columnHelper.accessor("name", {
      id: "name",
      header: () => <Text color="gray.400">Name</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("age", {
      id: "age",
      header: () => <Text color="gray.400">Age</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("gender", {
      id: "gender",
      header: () => <Text color="gray.400">Gender</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("relationship", {
      id: "relationship",
      header: () => <Text color="gray.400">Relationship</Text>,
      cell: (info) => <Text color={textColor}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("actions", {
      id: "actions",
      header: () => <Text color="gray.400">Actions</Text>,
      cell: (info) => (
        <Flex>
          <Icon w="18px" h="18px" me="10px" color="red.500" as={FaTrash} cursor="pointer" />
          <Icon w="18px" h="18px" me="10px" color="green.500" as={EditIcon} cursor="pointer" />
          <Icon w="18px" h="18px" me="10px" color="blue.500" as={FaEye} cursor="pointer" />
        </Flex>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="container">
      <Card flexDirection="column" w="100%" px="0px" overflowX="auto">
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text color={textColor} fontSize="22px" fontWeight="700">Family Accounts</Text>
          <Button
                    type="button"
                    onClick={() => navigate(-1)}
                    colorScheme="teal"
                    size="sm"
                    // mt="20px"
                    leftIcon={<IoMdArrowBack />}
                >
                    Back
                </Button>
        </Flex>
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

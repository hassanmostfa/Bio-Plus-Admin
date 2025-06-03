import {
  Box,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Spinner,
  Center,
} from '@chakra-ui/react';
import * as React from 'react';
import Card from 'components/card/Card';
import { useGetActivityLogsQuery } from '../../../api/userSlice';

const ActivityLog = () => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const { data, isLoading, error } = useGetActivityLogsQuery();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
  };

  const formatAction = (action) => {
    return action
      .split('.')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh">
        <Text color="red.500">Error loading activity logs</Text>
      </Center>
    );
  }

  const logs = data?.data?.data || [];

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
            Admin Actions Log
          </Text>
        </Flex>
        <Box>
          <Table variant="simple" color="gray.500" mb="24px" mt="12px">
            <Thead>
              <Tr>
                <Th borderColor={borderColor}>
                  <Text color="gray.400" fontSize="12px">Action</Text>
                </Th>
                <Th borderColor={borderColor}>
                  <Text color="gray.400" fontSize="12px">IP Address</Text>
                </Th>
                <Th borderColor={borderColor}>
                  <Text color="gray.400" fontSize="12px">User Agent</Text>
                </Th>
                <Th borderColor={borderColor}>
                  <Text color="gray.400" fontSize="12px">Date</Text>
                </Th>
                <Th borderColor={borderColor}>
                  <Text color="gray.400" fontSize="12px">Time</Text>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {logs.map((log) => {
                const { date, time } = formatDate(log.createdAt);
                return (
                  <Tr key={log.id}>
                    <Td borderColor="transparent" fontSize="14px">
                      {formatAction(log.action)}
                    </Td>
                    <Td borderColor="transparent" fontSize="14px">
                      {log.ipAddress}
                    </Td>
                    <Td borderColor="transparent" fontSize="14px">
                      {log.userAgent}
                    </Td>
                    <Td borderColor="transparent" fontSize="14px">
                      {date}
                    </Td>
                    <Td borderColor="transparent" fontSize="14px">
                      {time}
                    </Td>
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

export default ActivityLog;

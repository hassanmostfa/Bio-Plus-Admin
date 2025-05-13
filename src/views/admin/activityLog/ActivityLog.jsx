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
} from '@chakra-ui/react';
import * as React from 'react';
import Card from 'components/card/Card';

const ActvityLog = () => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Default data
  const logData = [
    {
      name: 'John Doe',
      action: 'Created a new admin',
      date: '2025-05-12',
      time: '10:30 AM',
    },
    {
      name: 'Jane Smith',
      action: 'Deleted a user',
      date: '2025-05-11',
      time: '2:15 PM',
    },
    {
      name: 'Ahmed Ali',
      action: 'Updated admin role',
      date: '2025-05-10',
      time: '4:45 PM',
    },
    {
      name: 'Sara Hassan',
      action: 'Viewed admin details',
      date: '2025-05-09',
      time: '11:20 AM',
    },
  ];

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
                  <Text color="gray.400" fontSize="12px">Admin Name</Text>
                </Th>
                <Th borderColor={borderColor}>
                  <Text color="gray.400" fontSize="12px">Action</Text>
                </Th>
                <Th borderColor={borderColor}>
                  <Text color="gray.400" fontSize="12px">Action Date</Text>
                </Th>
                <Th borderColor={borderColor}>
                  <Text color="gray.400" fontSize="12px">Action Time</Text>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {logData.map((log, index) => (
                <Tr key={index}>
                  <Td borderColor="transparent" fontSize="14px">{log.name}</Td>
                  <Td borderColor="transparent" fontSize="14px">{log.action}</Td>
                  <Td borderColor="transparent" fontSize="14px">{log.date}</Td>
                  <Td borderColor="transparent" fontSize="14px">{log.time}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>
    </div>
  );
};

export default ActvityLog;

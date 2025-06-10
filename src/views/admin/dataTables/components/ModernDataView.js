import {
  Box,
  SimpleGrid,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Flex,
  Icon,
  Progress,
} from '@chakra-ui/react';
import Card from 'components/card/Card';
import { MdBarChart, MdAttachMoney } from 'react-icons/md';
import * as React from 'react';

export default function ModernDataView(props) {
  const { tableData } = props;
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const cardShadow = useColorModeValue('0px 18px 40px rgba(112, 144, 176, 0.12)', 'none');

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      {tableData.map((item, index) => (
        <Card
          key={index}
          bg={cardBg}
          boxShadow={cardShadow}
          borderRadius="xl"
          p="20px"
          _hover={{ transform: 'translateY(-5px)', transition: 'all 0.3s ease' }}
        >
          <Flex direction="column" h="100%">
            <Flex justify="space-between" align="center" mb="20px">
              <Box>
                <Text color={textColor} fontSize="lg" fontWeight="bold">
                  {item.name}
                </Text>
                <Text color="gray.500" fontSize="sm">
                  {item.date}
                </Text>
              </Box>
              <Icon
                as={item.progress > 50 ? MdBarChart : MdAttachMoney}
                w="24px"
                h="24px"
                color={item.progress > 50 ? 'green.500' : 'blue.500'}
              />
            </Flex>

            <Stat mt="auto">
              <StatLabel color="gray.500">Progress</StatLabel>
              <StatNumber color={textColor} fontSize="2xl">
                {item.progress}%
              </StatNumber>
              <StatHelpText>
                <StatArrow type={item.progress > 50 ? 'increase' : 'decrease'} />
                {item.quantity} units
              </StatHelpText>
            </Stat>

            <Progress
              value={item.progress}
              colorScheme={item.progress > 50 ? 'green' : 'blue'}
              size="sm"
              mt="15px"
              borderRadius="full"
            />
          </Flex>
        </Card>
      ))}
    </SimpleGrid>
  );
} 
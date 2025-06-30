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
  Button,
  Select,
} from '@chakra-ui/react';
import * as React from 'react';
import Card from 'components/card/Card';
import { useGetActivityLogsQuery } from '../../../api/userSlice';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../contexts/LanguageContext';

const ActivityLog = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const { data, isLoading, error } = useGetActivityLogsQuery({ page, limit });

  // Conditional styling for RTL
  const isRTL = language === 'ar';
  const textAlign = isRTL ? 'right' : 'left';
  const direction = isRTL ? 'rtl' : 'ltr';

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

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
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
        <Text color="red.500">{t('activityLog.error')}</Text>
      </Center>
    );
  }

  const logs = data?.data?.data || [];
  const pagination = data?.data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

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
            {t('activityLog.title')}
          </Text>
        </Flex>
        <Box>
          <Table variant="simple" color="gray.500" mb="24px" mt="12px">
            <Thead>
              <Tr>
                <Th borderColor={borderColor}>
                  <Text color="gray.400" fontSize="12px" textAlign={textAlign}>{t('activityLog.action')}</Text>
                </Th>
                <Th borderColor={borderColor}>
                  <Text color="gray.400" fontSize="12px" textAlign={textAlign}>{t('activityLog.ipAddress')}</Text>
                </Th>
                <Th borderColor={borderColor}>
                  <Text color="gray.400" fontSize="12px" textAlign={textAlign}>{t('activityLog.userAgent')}</Text>
                </Th>
                <Th borderColor={borderColor}>
                  <Text color="gray.400" fontSize="12px" textAlign={textAlign}>{t('activityLog.date')}</Text>
                </Th>
                <Th borderColor={borderColor}>
                  <Text color="gray.400" fontSize="12px" textAlign={textAlign}>{t('activityLog.time')}</Text>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {logs.map((log) => {
                const { date, time } = formatDate(log.createdAt);
                return (
                  <Tr key={log.id}>
                    <Td borderColor="transparent" fontSize="14px" textAlign={textAlign}>
                      {formatAction(log.action)}
                    </Td>
                    <Td borderColor="transparent" fontSize="14px" textAlign={textAlign}>
                      {log.ipAddress}
                    </Td>
                    <Td borderColor="transparent" fontSize="14px" textAlign={textAlign}>
                      {log.userAgent}
                    </Td>
                    <Td borderColor="transparent" fontSize="14px" textAlign={textAlign}>
                      {date}
                    </Td>
                    <Td borderColor="transparent" fontSize="14px" textAlign={textAlign}>
                      {time}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
        {/* Pagination Controls */}
        <Flex justify="space-between" align="center" px="25px" py="15px">
          <Flex align="center">
            <Text mr={2} textAlign={textAlign}>{t('activityLog.rowsPerPage')}</Text>
            <Select
              value={limit}
              onChange={handleLimitChange}
              w="70px"
              size="sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Select>
          </Flex>
          <Flex align="center">
            <Text mr={4} textAlign={textAlign}>
              {t('activityLog.pageOf', { page, totalPages: pagination.totalPages })}
            </Text>
            <Button
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              isDisabled={page === 1}
              mr={2}
            >
              {t('activityLog.previous')}
            </Button>
            <Button
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              isDisabled={page === pagination.totalPages}
            >
              {t('activityLog.next')}
            </Button>
          </Flex>
        </Flex>
      </Card>
    </div>
  );
};

export default ActivityLog;

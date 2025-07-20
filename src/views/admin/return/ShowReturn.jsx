import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  useColorModeValue,
  Image,
  Flex,
  Icon
} from '@chakra-ui/react';
import { IoMdArrowBack } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetReturnQuery } from 'api/returnSlice';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const ShowReturn = () => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const contentBg = useColorModeValue('gray.50', 'gray.700');
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const { language } = useLanguage();

  // API hook to fetch data
  const { data: returnData, isLoading: isFetching, error } = useGetReturnQuery(id);

  useEffect(() => {
    if (error) {
      Swal.fire({
        title: t('returns.loadErrorTitle'),
        text: error.data?.message || t('returns.loadErrorText'),
        icon: 'error',
        confirmButtonText: t('returns.ok')
      });
    }
  }, [error, t]);

  if (isFetching) {
    return <Box>{t('returns.loading')}</Box>;
  }

  if (!returnData?.data) {
    return <Box>{t('returns.noDataFound')}</Box>;
  }

  return (
    <Box w="100%" className="container add-admin-container w-100" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Box 
        bg={cardBg} 
        className="add-admin-card shadow p-4 w-100"
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        boxShadow="lg"
      >
        <Flex mb={6} justifyContent="space-between" alignItems="center">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            {t('returns.viewReturnPolicy')}
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<Icon as={IoMdArrowBack} />}
            _hover={{ transform: 'translateY(-1px)' }}
            transition="all 0.2s"
          >
            {t('returns.back')}
          </Button>
        </Flex>

        {/* English Content */}
        <Box mt={6}>
          <Text color={textColor} fontSize="lg" fontWeight="700" mb={3}>
            {t('returns.englishContent')}
          </Text>
          <Box 
            p={6}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            bg={contentBg}
            color={textColor}
            minH="120px"
            boxShadow="sm"
          >
            <Text lineHeight="1.6" fontSize="md">
              {returnData.data.contentEn || t('returns.noContentAvailable')}
            </Text>
          </Box>
        </Box>

        {/* Arabic Content */}
        <Box mt={6}>
          <Text color={textColor} fontSize="lg" fontWeight="700" mb={3}>
            {t('returns.arabicContent')}
          </Text>
          <Box 
            p={6}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            bg={contentBg}
            color={textColor}
            dir="rtl"
            minH="120px"
            boxShadow="sm"
          >
            <Text lineHeight="1.6" fontSize="md">
              {returnData.data.contentAr || t('returns.noContentAvailableAr')}
            </Text>
          </Box>
        </Box>

        {/* Image Display */}
        {returnData.data.image && (
          <Box mt={6}>
            <Text color={textColor} fontSize="lg" fontWeight="700" mb={3}>
              {t('returns.image')}
            </Text>
            <Flex
              p={6}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              bg={contentBg}
              justify="center"
              align="center"
              minH="200px"
              boxShadow="sm"
            >
              <Image
                src={`${returnData.data.image}`}
                alt={t('returns.returnPolicy')}
                maxH="300px"
                maxW="100%"
                objectFit="contain"
                borderRadius="md"
                boxShadow="md"
              />
            </Flex>
          </Box>
        )}

        {/* Back Button */}
        <Flex justify="center" mt={8}>
          <Button 
            variant="outline" 
            colorScheme="teal" 
            onClick={() => navigate(-1)}
            size="lg"
            px={8}
            _hover={{ 
              transform: 'translateY(-2px)',
              boxShadow: 'lg'
            }}
            transition="all 0.2s"
          >
            {t('returns.backToList')}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default ShowReturn;
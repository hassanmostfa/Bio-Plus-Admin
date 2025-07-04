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
      <Box bg={cardBg} className="add-admin-card shadow p-4 w-100">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            {t('returns.viewReturnPolicy')}
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<Icon as={IoMdArrowBack} />}
          >
            {t('returns.back')}
          </Button>
        </div>

        {/* English Content */}
        <Box mt={4}>
          <Text color={textColor} fontSize="sm" fontWeight="700">
            {t('returns.englishContent')}
          </Text>
          <Box 
            mt={2}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            bg="gray.50"
            color={textColor}
          >
            {returnData.data.contentEn || t('returns.noContentAvailable')}
          </Box>
        </Box>

        {/* Arabic Content */}
        <Box mt={4}>
          <Text color={textColor} fontSize="sm" fontWeight="700">
            {t('returns.arabicContent')}
          </Text>
          <Box 
            mt={2}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            bg="gray.50"
            color={textColor}
            dir="rtl"
          >
            {returnData.data.contentAr || t('returns.noContentAvailableAr')}
          </Box>
        </Box>

        {/* Image Display */}
        {returnData.data.image && (
          <Box mt={4}>
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('returns.image')}
            </Text>
            <Flex
              mt={2}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              bg="gray.50"
              justify="center"
            >
              <Image
                src={`${returnData.data.image}`}
                alt={t('returns.returnPolicy')}
                maxH="300px"
                objectFit="contain"
              />
            </Flex>
          </Box>
        )}

        {/* Back Button */}
        <Flex justify="center" mt={6}>
          <Button 
            variant="outline" 
            colorScheme="teal" 
            onClick={() => navigate(-1)}
          >
            {t('returns.backToList')}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default ShowReturn;
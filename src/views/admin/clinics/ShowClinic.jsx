import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Text,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { IoMdArrowBack } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetClinicQuery } from 'api/clinicSlice';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../contexts/LanguageContext';

const ShowClinic = () => {
  const { id } = useParams();
  const { data, isLoading } = useGetClinicQuery(id);
  const clinic = data?.data || {};
  
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // Get Arabic translation
  const arabicTranslation = clinic.translations?.find(t => t.languageId === 'ar');

  if (isLoading) {
    return <div>{t('clinics.loading')}</div>;
  }

  return (
    <div className="container add-admin-container w-100" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <div className="add-admin-card shadow p-4 bg-white w-100">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            mb="20px !important"
            lineHeight="100%"
          >
            {t('clinics.clinicDetails')}
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('clinics.back')}
          </Button>
        </div>

        <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={8}>
          {/* Basic Info */}
          <Box>
            <Text fontSize="lg" fontWeight="600" mb={4}>{t('clinics.basicInformation')}</Text>
            
            <Box mb={3}>
              <Text color="gray.500" fontSize="sm">{t('clinics.englishName')}</Text>
              <Text fontSize="md">{clinic.name}</Text>
            </Box>
            
            <Box mb={3}>
              <Text color="gray.500" fontSize="sm">{t('clinics.arabicName')}</Text>
              <Text fontSize="md" dir="rtl">{arabicTranslation?.name || t('clinics.notAvailable')}</Text>
            </Box>
            
            <Box mb={3}>
              <Text color="gray.500" fontSize="sm">{t('clinics.email')}</Text>
              <Text fontSize="md">{clinic.email}</Text>
            </Box>
            
            <Box mb={3}>
              <Text color="gray.500" fontSize="sm">{t('clinics.status')}</Text>
              <Badge 
                colorScheme={clinic.isActive ? 'green' : 'red'} 
                fontSize="sm"
                p={1}
                borderRadius="md"
              >
                {clinic.isActive ? t('clinics.active') : t('clinics.inactive')}
              </Badge>
            </Box>
          </Box>

          {/* Working Hours */}
          <Box>
            <Text fontSize="lg" fontWeight="600" mb={4}>{t('clinics.workingHours')}</Text>
            
            <Box mb={3}>
              <Text color="gray.500" fontSize="sm">{t('clinics.openingTime')}</Text>
              <Text fontSize="md">{clinic.fromTime}</Text>
            </Box>
            
            <Box mb={3}>
              <Text color="gray.500" fontSize="sm">{t('clinics.closingTime')}</Text>
              <Text fontSize="md">{clinic.toTime}</Text>
            </Box>
          </Box>

          {/* Locations */}
          <Box gridColumn="1 / -1">
            <Text fontSize="lg" fontWeight="600" mb={4}>{t('clinics.locations')}</Text>
            
            {clinic.locations?.map((location, index) => {
              const locationArabicName = location.translations?.find(t => t.languageId === 'ar')?.name;
              
              return (
                <Box 
                  key={index} 
                  mb={4} 
                  p={4} 
                  border="1px solid" 
                  borderColor={borderColor}
                  borderRadius="md"
                >
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <Box>
                      <Text color="gray.500" fontSize="sm">{t('clinics.englishName')}</Text>
                      <Text fontSize="md">{location.name}</Text>
                    </Box>
                    
                    <Box>
                      <Text color="gray.500" fontSize="sm">{t('clinics.arabicName')}</Text>
                      <Text fontSize="md" dir="rtl">{locationArabicName || t('clinics.notAvailable')}</Text>
                    </Box>
                  </Grid>
                </Box>
              );
            })}
          </Box>
        </Grid>

        <Flex justify="center" mt={6}>
          <Button
            variant="outline"
            colorScheme="teal"
            onClick={() => navigate(-1)}
            width="120px"
          >
            {t('clinics.backToList')}
          </Button>
        </Flex>
      </div>
    </div>
  );
};

export default ShowClinic;
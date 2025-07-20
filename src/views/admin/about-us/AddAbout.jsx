import React, { useState, useEffect } from "react";
import {
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
  Spinner,
  Textarea,
} from "@chakra-ui/react";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useGetAboutQuery } from "api/aboutSlice";
import { useAddAboutMutation } from "api/aboutSlice";
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const AboutPage = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { data: aboutData, isLoading: isFetching, refetch } = useGetAboutQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const [updateAbout, { isLoading: isUpdating }] = useAddAboutMutation();
  const navigate = useNavigate();
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const cardBg = useColorModeValue("white", "navy.700");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const inputBg = useColorModeValue("white", "gray.700");
  const inputBorderColor = useColorModeValue("gray.300", "whiteAlpha.200");
  const inputHoverBorderColor = useColorModeValue("gray.400", "whiteAlpha.300");

  const [formData, setFormData] = useState({
    phone: "",
    location: "",
    mapUrl: "",
    // Add other fields as needed
  });

  // Initialize form with existing data
  useEffect(() => {
    if (aboutData?.data) {
      setFormData({
        phone: aboutData.data.phone || "",
        location: aboutData.data.location || "",
        mapUrl: aboutData.data.mapUrl || "",
        // Initialize other fields
      });
    }
  }, [aboutData]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For phone number, only allow numeric characters
    if (name === 'phone') {
      const numericValue = value.replace(/[^\d]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updateAbout(formData).unwrap();
      
      // Show success message
      Swal.fire({
        title: t('about.success'),
        text: t('about.savedSuccessfully'),
        icon: 'success',
        timer: 2000,
        showConfirmButton: true,
      });
      
      // Refetch data to get the latest updates
      await refetch();
      
      // Navigate back to the list after a short delay
      setTimeout(() => {
        navigate('/admin/undefined/cms/about-us');
      }, 1000);
      
    } catch (error) {
      console.error('Failed to save about:', error);
      Swal.fire(
        t('about.error'),
        error.data?.message || t('about.failedToSave'),
        'error'
      );
    }
  };

  if (isFetching) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <div className="container add-admin-container w-100" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div 
        className="add-admin-card shadow p-4 w-100"
        style={{
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      >
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            mb="20px !important"
            lineHeight="100%"
          >
            {aboutData ? t('about.editTitle') : t('about.addTitle')}
          </Text>
          
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Phone Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('about.phone')}
              <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              color={textColor}
              type="tel"
              name="phone"
              placeholder={t('about.enterPhone')}
              value={formData.phone}
              onChange={handleInputChange}
              required
              mt="8px"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              pattern="[0-9]*"
              bg={inputBg}
              borderColor={inputBorderColor}
              _hover={{ borderColor: inputHoverBorderColor }}
              _focus={{ 
                borderColor: 'blue.500',
                boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
              }}
              borderRadius="md"
            />
          </div>

          {/* Location Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('about.location')}
              <span className="text-danger mx-1">*</span>
            </Text>
            <Textarea
              color={textColor}
              name="location"
              placeholder={t('about.enterLocation')}
              value={formData.location}
              onChange={handleInputChange}
              required
              mt="8px"
              rows={3}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              bg={inputBg}
              borderColor={inputBorderColor}
              _hover={{ borderColor: inputHoverBorderColor }}
              _focus={{ 
                borderColor: 'blue.500',
                boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
              }}
              borderRadius="md"
            />
          </div>

          {/* Map URL Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('about.mapUrl')}
              <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              color={textColor}
              type="text"
              name="mapUrl"
              placeholder={t('about.enterMapUrl')}
              value={formData.mapUrl}
              onChange={handleInputChange}
              required
              mt="8px"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              bg={inputBg}
              borderColor={inputBorderColor}
              _hover={{ borderColor: inputHoverBorderColor }}
              _focus={{ 
                borderColor: 'blue.500',
                boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
              }}
              borderRadius="md"
            />
          </div>

          {/* Action Buttons */}
          <Flex justify="flex-start" mt={6}>
            <Button
              variant='darkBrand'
              color='white'
              fontSize='sm'
              fontWeight='500'
              borderRadius='70px'
              px='24px'
              py='5px'
              type="submit"
              isLoading={isUpdating}
              loadingText={t('about.saving')}
              mt='30px'
              _hover={{ 
                transform: 'translateY(-1px)',
                boxShadow: 'lg'
              }}
              transition="all 0.2s"
            >
              {aboutData ? t('about.update') : t('about.save')}
            </Button>
          </Flex>
        </form>
      </div>
    </div>
  );
};

export default AboutPage;
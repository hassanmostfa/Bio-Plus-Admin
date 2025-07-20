import React, { useState, useEffect } from "react";
import {
  Button,
  Flex,
  Textarea,
  Text,
  useColorModeValue,
  Spinner,
  Box
} from "@chakra-ui/react";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useGetPrivacyQuery } from "api/privacySlice";
import { useAddPrivacyMutation } from "api/privacySlice";
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const AddPrivcy = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { data: privacyData, isLoading: isFetching , refetch } = useGetPrivacyQuery();
  const [updatePrivacyPolicy, { isLoading: isUpdating }] = useAddPrivacyMutation();
  const navigate = useNavigate();
  const textColor = useColorModeValue("secondaryGray.900", "white");

  const [formData, setFormData] = useState({
    contentEn: "",
    contentAr: ""
  });

  // Initialize form with existing data
  useEffect(() => {
    if (privacyData?.data) {
      setFormData({
        contentEn: privacyData.data.contentEn || "",
        contentAr: privacyData.data.contentAr || ""
      });
    }
  }, [privacyData]);
  useEffect(() => {
    refetch();
  }, [refetch]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updatePrivacyPolicy({
        contentEn: formData.contentEn,
        contentAr: formData.contentAr
      }).unwrap();
      
      Swal.fire(t('privacy.success'), t('privacy.savedSuccessfully'), 'success');
    } catch (error) {
      console.error('Failed to save privacy policy:', error);
      Swal.fire(
        t('privacy.error'),
        error.data?.message || t('privacy.failedToSave'),
        'error'
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      <div className="add-admin-card shadow p-4 w-100">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            mb="20px !important"
            lineHeight="100%"
          >
            {privacyData ? t('privacy.editTitle') : t('privacy.addTitle')}
          </Text>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Flex direction={{ base: "column", md: "row" }} gap={6}>
            {/* English Content */}
            <Box flex={1}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('privacy.englishContent')}
                <span className="text-danger mx-1">*</span>
              </Text>
              <Textarea
                name="contentEn"
                placeholder={t('privacy.enterEnglishContent')}
                value={formData.contentEn}
                onChange={handleInputChange}
                required
                mt={"8px"}
                height="400px"
                fontFamily="monospace"
                whiteSpace="pre-wrap"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
            </Box>

            {/* Arabic Content */}
            <Box flex={1}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('privacy.arabicContent')}
                <span className="text-danger mx-1">*</span>
              </Text>
              <Textarea
                name="contentAr"
                placeholder={t('privacy.enterArabicContent')}
                value={formData.contentAr}
                onChange={handleInputChange}
                required
                mt={"8px"}
                dir="rtl"
                height="400px"
                fontFamily="monospace"
                whiteSpace="pre-wrap"
              />
            </Box>
          </Flex>

          {/* Action Buttons */}
          <Flex justify="center" mt={6} gap={4}>
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
              loadingText={t('privacy.saving')}
              width="120px"
            >
              {privacyData ? t('privacy.update') : t('privacy.save')}
            </Button>
          </Flex>
        </form>
      </div>
    </div>
  );
};

export default AddPrivcy;
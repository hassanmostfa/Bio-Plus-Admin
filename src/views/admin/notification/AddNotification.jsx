import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Input,
  Textarea,
  Text,
  useColorModeValue,
  Icon,
  useToast,
} from "@chakra-ui/react";
import "./notification.css";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { usePostNotificationMutation } from "api/notificationsSlice";
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const AddNotification = () => {
  const [englishTitle, setEnglishTitle] = useState("");
  const [arabicTitle, setArabicTitle] = useState("");
  const [englishDescription, setEnglishDescription] = useState("");
  const [arabicDescription, setArabicDescription] = useState("");
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  
  const [postNotification] = usePostNotificationMutation();

  const handleCancel = () => {
    setEnglishTitle("");
    setArabicTitle("");
    setEnglishDescription("");
    setArabicDescription("");
    setImage(null);
  };

  const handleSend = async () => {
    // Validate required fields
    if (!englishTitle || !arabicTitle || !englishDescription || !arabicDescription) {
      toast({
        title: t('addNotification.validationError'),
        description: t('addNotification.allFieldsRequired'),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const notificationData = {
        title: englishTitle,
        body: englishDescription,
        isActive: true,
        translations: [
          {
            languageId: "ar",
            title: arabicTitle,
            body: arabicDescription,
          },
        ],
      };

      // If you have image handling
      if (image) {
        notificationData.image = image;
      }

      const response = await postNotification(notificationData).unwrap();
      
      toast({
        title: t('addNotification.success'),
        description: t('addNotification.notificationSentSuccessfully'),
        status: "success",
        position: "top-right",
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form after successful submission
      handleCancel();
      
      // Optionally navigate away or refresh notifications list
      // navigate('/notifications');
      
    } catch (error) {
      console.error("Failed to send notification:", error);
      toast({
        title: t('addNotification.error'),
        description: error.data?.message || t('addNotification.failedToSendNotification'),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="container add-admin-container w-100" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <Box bg={cardBg} className="add-admin-card shadow p-4 w-100" borderRadius="lg">
        <div className="mb-3 d-flex justify-content-between align-items-center">
            <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            mb="20px !important"
            lineHeight="100%"
            >
            {t('addNotification.sendNotification')}
            </Text>
            <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
            >
            {t('addNotification.back')}
            </Button>
        </div>
        <form>
          {/* English Title and Arabic Title Fields */}
          <div className="row col-md-12">
            <div className="mb-3 col-md-6">
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('addNotification.englishTitle')}
                <span className="text-danger mx-1">*</span>
              </Text> 
              <Input
                type="text"
                id="englishTitle"
                placeholder={t('addNotification.enterEnglishTitle')}
                value={englishTitle}
                onChange={(e) => setEnglishTitle(e.target.value)}
                required
                mt={"8px"}
                color={textColor}
                bg={inputBg}
                dir="ltr"
              />
            </div>
            <div className="mb-3 col-md-6 pr-0" style={{ paddingRight: "0 !important" }}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('addNotification.arabicTitle')}
                <span className="text-danger mx-1">*</span>
              </Text> 
              <Input
                type="text"
                id="arabicTitle"
                placeholder={t('addNotification.enterArabicTitle')}
                value={arabicTitle}
                onChange={(e) => setArabicTitle(e.target.value)}
                dir="rtl"
                required
                mt={"8px"}
                color={textColor}
                bg={inputBg}
              />
            </div>
          </div>

          {/* English Description and Arabic Description Fields */}
          <div className="row col-md-12">
            <div className="mb-3 col-md-12">
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('addNotification.englishDescription')}
                <span className="text-danger mx-1">*</span>
              </Text> 
              <Textarea
                id="englishDescription"
                placeholder={t('addNotification.enterEnglishDescription')}
                value={englishDescription}
                onChange={(e) => setEnglishDescription(e.target.value)}
                required
                rows={4}
                mt={"8px"}
                color={textColor}
                bg={inputBg}
                dir="ltr"
              />
            </div>
            <div className="mb-3 col-md-12 pr-0">
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('addNotification.arabicDescription')}
                <span className="text-danger mx-1">*</span>
              </Text> 
              <Textarea
                id="arabicDescription"
                placeholder={t('addNotification.enterArabicDescription')}
                value={arabicDescription}
                onChange={(e) => setArabicDescription(e.target.value)}
                dir="rtl"
                required
                rows={4}
                mt={"8px"}
                color={textColor}
                bg={inputBg}
              />
            </div>
          </div>

          {/* Image Upload (if needed) */}
          {/* <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('addNotification.notificationImage')}
            </Text>
            <Input
              type="file"
              id="image"
              onChange={(e) => setImage(e.target.files[0])}
              mt={"8px"}
            />
          </div> */}

          {/* Action Buttons */}
          <Flex justify="center" mt={4}>
            <Button 
              variant="outline" 
              colorScheme="red" 
              onClick={handleCancel} 
              mr={2}
              disabled={isLoading}
            >
              {t('addNotification.cancel')}
            </Button>
            <Button 
              variant='darkBrand' 
              color='white' 
              fontSize='sm' 
              fontWeight='500' 
              borderRadius='70px' 
              px='24px' 
              py='5px' 
              onClick={handleSend}
              isLoading={isLoading}
              loadingText={t('addNotification.sending')}
            >
              {t('addNotification.send')}
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default AddNotification;
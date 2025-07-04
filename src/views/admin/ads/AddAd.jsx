import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
  Icon,
  useToast,
  Select,
  Switch,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import "./ad.css";
import { FaUpload } from "react-icons/fa6";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useAddAdMutation } from "api/adsSlice";
import { useAddFileMutation } from "api/filesSlice";
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';


const AddAd = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [addAd] = useAddAdMutation();
  const [addFile] = useAddFileMutation();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [linkType, setLinkType] = useState("EXTERNAL");
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(1);
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const navigate = useNavigate();
  const toast = useToast();

  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setImage(file);
      } else {
        toast({
          title: t('ads.add.invalidFileType'),
          description: t('ads.add.uploadImageFile'),
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    handleImageUpload(files);
  };

  const handleReset = () => {
    setTitle("");
    setLink("");
    setLinkType("EXTERNAL");
    setIsActive(true);
    setOrder(1);
    setImage(null);
  };

  const handleSubmit = async () => {
    if (!title || !link || !image) {
      toast({
        title: t('ads.add.missingFields'),
        description: t('ads.add.fillRequiredFields'),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First upload the image
      const formDataToSend = new FormData();
      formDataToSend.append("file", image);

      const uploadResponse = await addFile(formDataToSend).unwrap();
      
      if (!uploadResponse.success || !uploadResponse.data.uploadedFiles[0]?.url) {
        throw new Error('Failed to upload image');
      }

      const imageKey = uploadResponse.data.uploadedFiles[0].url;
    

      // Then create the ad
      const adData = {
        title,
        imageKey,
        link,
        linkType,
        isActive,
        order: Number(order),
        translations: [] // Add translations if needed
      };

      const response = await addAd(adData).unwrap();

      if (response.success) {
        await Swal.fire({
          title: t('ads.add.success'),
          text: t('ads.add.createdSuccessfully'),
          icon: 'success',
          confirmButtonText: t('ads.add.ok')
        });
        navigate('/admin/undefined/cms/ads');
      } else {
        throw new Error(response.message || t('ads.add.failedToCreate'));
      }
    } catch (error) {
      toast({
        title: t('ads.add.error'),
        description: error.message || t('ads.add.somethingWentWrong'),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="container add-admin-container w-100" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Box bg={cardBg} className="add-admin-card shadow p-4 w-100" borderRadius="lg">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            mb="20px !important"
            lineHeight="100%"
          >
            {t('ads.add.title')}
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('ads.add.back')}
          </Button>
        </div>
        <form>
          {/* Title Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('ads.add.title')}
              <span className="text-danger mx-1">*</span>
            </Text> 
            <Input
              type="text"
              id="title"
              placeholder={t('ads.add.enterTitle')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              mt="8px"
              color={textColor}
              bg={inputBg}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Link Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('ads.add.link')}
              <span className="text-danger mx-1">*</span>
            </Text> 
            <Input
              type="url"
              id="link"
              placeholder={t('ads.add.enterLinkUrl')}
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
              mt="8px"
              color={textColor}
              bg={inputBg}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Link Type Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('ads.add.linkType')}
              <span className="text-danger mx-1">*</span>
            </Text>
            <Select
              value={linkType}
              onChange={(e) => setLinkType(e.target.value)}
              mt="8px"
              color={textColor}
              bg={inputBg}
            >
              <option value="EXTERNAL">{t('ads.add.external')}</option>
              {/* <option value="PRODUCT">PRODUCT</option>
              <option value="PHARMACY">PHARMACY</option>
              <option value="DOCTOR">DOCTOR</option> */}
            </Select>
          </div>

          {/* Order Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('ads.add.order')}
            </Text>
            <Input
              type="number"
              id="order"
              placeholder={t('ads.add.enterDisplayOrder')}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              min="1"
              mt="8px"
              color={textColor}
              bg={inputBg}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Active Status */}
          <FormControl display="flex" alignItems="center" mb={4}>
            <FormLabel htmlFor="is-active" mb="0">
              {t('ads.add.active')}
            </FormLabel>
            <Switch
              id="is-active"
              isChecked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              colorScheme="green"
            />
          </FormControl>

          {/* Image Upload Section */}
          <Box
            border="1px dashed"
            borderColor={isDragging ? "brand.500" : borderColor}
            borderRadius="md"
            p={4}
            textAlign="center"
            backgroundColor={isDragging ? "brand.50" : inputBg}
            cursor="pointer"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            mb={4}
          >
            <Icon as={FaUpload} w={8} h={8} color="#422afb" mb={2} />
            <Text color="gray.500" mb={2}>
              {t('ads.add.dragDropImage')}
            </Text>
            <Text color="gray.500" mb={2}>
              {t('ads.add.or')}
            </Text>
            <Button
              variant="outline"
              color="#422afb"
              border="none"
              onClick={() => document.getElementById('fileInput').click()}
            >
              {t('ads.add.uploadImage')}
              <input
                type="file"
                id="fileInput"
                hidden
                accept="image/*"
                onChange={handleFileInputChange}
              />
            </Button>
            {image && (
              <Box
                mt={4}
                display={'flex'}
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
              >
                <img
                  src={URL.createObjectURL(image)}
                  alt={image.name}
                  width={150}
                  height={150}
                  style={{ borderRadius: "md", maxHeight: "150px" }}
                />
                <Text mt={2} fontSize="sm">
                  {image.name}
                </Text>
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <Flex justify="center" mt={4}>
            <Button 
              variant="outline" 
              colorScheme="red" 
              onClick={handleReset} 
              mr={2}
              isDisabled={isSubmitting}
            >
              {t('ads.add.reset')}
            </Button>
            <Button
              variant='darkBrand'
              color='white'
              fontSize='sm'
              fontWeight='500'
              borderRadius='70px'
              px='24px'
              py='5px'
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText={t('ads.add.submitting')}
            >
              {t('ads.add.saveAd')}
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default AddAd;
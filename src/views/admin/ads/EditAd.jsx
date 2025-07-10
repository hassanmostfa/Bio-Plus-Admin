import React, { useState, useEffect } from "react";
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
import { useNavigate, useParams } from "react-router-dom";
import { useEditAdMutation, useGetAdByIdQuery } from "api/adsSlice";
import { useAddFileMutation } from "api/filesSlice";
import Swal from 'sweetalert2';
import { useGetAdsQuery } from "api/adsSlice";
import { useUpdateAdMutation } from "api/adsSlice";
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';


const EditAd = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { id } = useParams();
  const { data: adsResponse, isLoading: isAdLoading, refetch } = useGetAdsQuery({ page: 1, limit: 1000 });

  React.useEffect(() => {
    refetch();
  }, []);
  
  const adData = React.useMemo(() => {
    return adsResponse?.data?.find(ad => ad.id === id) || {};
  }, [adsResponse, id]);
  console.log("adData", adData);
  
  const [editAd] = useUpdateAdMutation();
  const [addFile] = useAddFileMutation();
  
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [linkType, setLinkType] = useState("EXTERNAL");
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(1);
  const [image, setImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const navigate = useNavigate();
  const toast = useToast();

  // Load ad data when component mounts or adData changes
  useEffect(() => {
    if (adData) {
      const ad = adData;
      setTitle(ad.title);
      setLink(ad.link);
      setLinkType(ad.linkType);
      setIsActive(ad.isActive);
      setOrder(ad.order);
      setCurrentImageUrl(ad.imageKey); // Assuming imageKey contains the URL
    }
  }, [adData]);

  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setImage(file);
        setCurrentImageUrl(URL.createObjectURL(file));
      } else {
        toast({
          title: t('ads.edit.invalidFileType'),
          description: t('ads.edit.uploadImageFile'),
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
    if (adData) {
      const ad = adData;
      setTitle(ad.title);
      setLink(ad.link);
      setLinkType(ad.linkType);
      setIsActive(ad.isActive);
      setOrder(ad.order);
      setImage(null);
      setCurrentImageUrl(ad.imageKey);
    }
  };

  const handleSubmit = async () => {
    if (!title || !link) {
      toast({
        title: t('ads.edit.missingFields'),
        description: t('ads.edit.fillRequiredFields'),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageKey = currentImageUrl; // Use existing image if no new one uploaded

      // Upload new image if provided
      if (image) {
        const formDataToSend = new FormData();
        formDataToSend.append("file", image);

        const uploadResponse = await addFile(formDataToSend).unwrap();
        
        if (!uploadResponse.success || !uploadResponse.data.uploadedFiles[0]?.url) {
          throw new Error('Failed to upload image');
        }

        imageKey = uploadResponse.data.uploadedFiles[0].url;
      }

      // Prepare the ad data for update
      const updatedAdData = {
        title,
        imageKey,
        link,
        linkType,
        isActive,
        order: Number(order),
        translations: [] // Add translations if needed
      };

      const response = await editAd({id,Ad:updatedAdData}).unwrap();

      if (response.success) {
        await Swal.fire({
          title: t('ads.edit.success'),
          text: t('ads.edit.updatedSuccessfully'),
          icon: 'success',
          confirmButtonText: t('ads.edit.ok')
        });
        navigate('/admin/undefined/cms/ads');
      } else {
        throw new Error(response.message || t('ads.edit.failedToUpdate'));
      }
    } catch (error) {
      toast({
        title: t('ads.edit.error'),
        description: error.message || t('ads.edit.somethingWentWrong'),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAdLoading) {
    return <div>{t('ads.edit.loading')}</div>;
  }

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
            {t('ads.edit.title')}
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('ads.edit.back')}
          </Button>
        </div>
        <form>
          {/* Title Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('ads.edit.title')}
              <span className="text-danger mx-1">*</span>
            </Text> 
            <Input
              type="text"
              id="title"
              placeholder={t('ads.edit.enterTitle')}
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
              {t('ads.edit.link')}
              <span className="text-danger mx-1">*</span>
            </Text> 
            <Input
              type="url"
              id="link"
              placeholder={t('ads.edit.enterLinkUrl')}
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
              {t('ads.edit.linkType')}
              <span className="text-danger mx-1">*</span>
            </Text>
            <Select
              value={linkType}
              onChange={(e) => setLinkType(e.target.value)}
              mt="8px"
              color={textColor}
              bg={inputBg}
            >
              <option value="EXTERNAL">{t('ads.edit.external')}</option>
              <option value="INTERNAL">{t('ads.edit.internal')}</option>
            </Select>
          </div>

          {/* Order Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('ads.edit.order')}
            </Text>
            <Input
              type="number"
              id="order"
              placeholder={t('ads.edit.enterDisplayOrder')}
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
              {t('ads.edit.active')}
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
              {t('ads.edit.dragDropImage')}
            </Text>
            <Text color="gray.500" mb={2}>
              {t('ads.edit.or')}
            </Text>
            <Button
              variant="outline"
              color="#422afb"
              border="none"
              onClick={() => document.getElementById('fileInput').click()}
            >
              {t('ads.edit.uploadImage')}
              <input
                type="file"
                id="fileInput"
                hidden
                accept="image/*"
                onChange={handleFileInputChange}
              />
            </Button>
            {currentImageUrl && (
              <Box
                mt={4}
                display={'flex'}
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
              >
                <img
                  src={currentImageUrl}
                  alt="Current Ad"
                  width={150}
                  height={150}
                  style={{ borderRadius: "md", maxHeight: "150px" }}
                />
                <Text mt={2} fontSize="sm">
                  {image ? image.name : t('ads.edit.currentAdImage')}
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
              {t('ads.edit.reset')}
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
              loadingText={t('ads.edit.submitting')}
            >
              {t('ads.edit.updateAd')}
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default EditAd;
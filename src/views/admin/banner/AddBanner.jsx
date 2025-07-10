import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
  Icon,
  Select,
  Switch,
  FormControl,
  FormLabel,
  useToast,
  Image,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import { FaUpload, FaTrash } from "react-icons/fa6";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useAddBannerMutation } from "api/bannerSlice";
import { useAddFileMutation } from "api/filesSlice";
import Swal from "sweetalert2";
import { useGetPharmaciesQuery } from "../../../api/pharmacySlice";
import { useGetProductsQuery } from "../../../api/productSlice";
import { useGetDoctorsQuery } from "../../../api/doctorSlice";
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const AddBanner = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    title: "",
    arTitle: "",
    link: "",
    linkType: "PHARMACY",
    linkId: "",
    order: 1,
    isActive: true,
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const navigate = useNavigate();
  const toast = useToast();
  const [createBanner] = useAddBannerMutation();
  const [addFile] = useAddFileMutation();

  // Fetch data for dropdowns
  const { data: pharmaciesData, isLoading: isPharmaciesLoading } = useGetPharmaciesQuery({});
  
  const { data: productsData, isLoading: isProductsLoading } = useGetProductsQuery({});
  const { data: doctorsData, isLoading: isDoctorsLoading } = useGetDoctorsQuery({});

  const pharmacies = pharmaciesData?.data?.items || [];
  const products = productsData?.data || []; // Assuming products are nested under 'products' in the response
  const doctors = doctorsData?.data || []; // Assuming doctors are nested under 'doctors' in the response

  // Clean up object URLs when component unmounts
  React.useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('banners.add.invalidFileType'),
          description: t('banners.add.uploadImageFile'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Validate file size (e.g., 5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('banners.add.fileTooLarge'),
          description: t('banners.add.maxFileSize'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImage(null);
    setImagePreview("");
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
    handleImageUpload(e.dataTransfer.files);
  };

  const handleFileInputChange = (e) => {
    handleImageUpload(e.target.files);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e) => {
    setFormData(prev => ({
      ...prev,
      isActive: e.target.checked
    }));
  };

  const handleCancel = () => {
    Swal.fire({
      title: t('banners.add.discardConfirmTitle'),
      text: t('banners.add.discardConfirmText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('banners.add.discardConfirmButton'),
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/admin/undefined/cms/banners");
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Adjust validation based on link type
    if (!formData.title || !formData.arTitle || (formData.linkType === "EXTERNAL" && !formData.link) || (formData.linkType !== "EXTERNAL" && !formData.linkId)) {
      toast({
        title: t('banners.add.error'),
        description: t('banners.add.fillRequiredFields'),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!image) {
      toast({
        title: t('banners.add.error'),
        description: t('banners.add.uploadImage'),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      // First upload the image
      const formDataToSend = new FormData();
      formDataToSend.append("file", image);

      const uploadResponse = await addFile(formDataToSend).unwrap();
      
      if (!uploadResponse.success || !uploadResponse.data.uploadedFiles[0]?.url) {
        throw new Error('Failed to upload image');
      }

      const imageUrl = uploadResponse.data.uploadedFiles[0].url;

      // Then create the banner with the image URL
      const bannerData = {
        title: formData.title,
        imageKey: imageUrl,
        linkType: formData.linkType,
        order: parseInt(formData.order),
        isActive: formData.isActive,
        translations: [
          {
            languageId: "ar",
            title: formData.arTitle
          }
        ]
      };

      // Set link and linkId based on linkType
      if (formData.linkType === "EXTERNAL") {
        bannerData.link = formData.link;
      } else {
        // Construct the link based on type and id
        let linkPath = "";
        switch (formData.linkType) {
          case "PHARMACY":
            linkPath = "/pharmacies/";
            break;
          case "PRODUCT":
            linkPath = "/products/";
            break;
          case "DOCTOR":
            linkPath = "/doctors/";
            break;
          default:
            // Handle unexpected link types if necessary
            break;
        }
        bannerData.link = `${linkPath}${formData.linkId}`;
        bannerData.linkId = formData.linkId; // Ensure linkId is sent for internal types
      }

      // Remove null values
      Object.keys(bannerData).forEach(key => {
        if (bannerData[key] === null || bannerData[key] === undefined) {
          delete bannerData[key];
        }
      });

      await createBanner(bannerData).unwrap();

      toast({
        title: t('banners.add.success'),
        description: t('banners.add.createdSuccessfully'),
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      navigate("/admin/undefined/cms/banners");
    } catch (error) {
      console.error("Failed to create banner:", error);
      toast({
        title: t('banners.add.error'),
        description: error.data?.message || t('banners.add.failedToCreate'),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="container add-admin-container w-100" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Box bg={cardBg} className="add-admin-card shadow p-4 w-100" borderRadius="lg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <Flex mb={3} justify="space-between" align="center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            mb="20px !important"
            lineHeight="100%"
          >
            {t('banners.add.title')}
          </Text>
          <Button
            onClick={handleCancel}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('banners.add.back')}
          </Button>
        </Flex>

        <form onSubmit={handleSubmit} dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {/* Title Field */}
          <FormControl mb={4} isRequired>
            <FormLabel>{t('banners.add.englishTitle')}</FormLabel>
            <Input
              name="title"
              placeholder={t('banners.add.enterEnglishTitle')}
              value={formData.title}
              onChange={handleChange}
              bg={inputBg}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
          </FormControl>

          {/* Arabic Title Field */}
          <FormControl mb={4} isRequired>
            <FormLabel>{t('banners.add.arabicTitle')}</FormLabel>
            <Input
              name="arTitle"
              placeholder={t('banners.add.enterArabicTitle')}
              value={formData.arTitle}
              onChange={handleChange}
              dir="rtl"
              bg={inputBg}
            />
          </FormControl>

          {/* Link Type and Destination Input/Select side-by-side */}
          <Flex mb={4} gap={4} direction={{ base: "column", md: "row" }}>
            {/* Link Type */}          
            <FormControl isRequired flex="1">
              <FormLabel>{t('banners.add.linkType')}</FormLabel>
              <Select
                name="linkType"
                value={formData.linkType}
                onChange={handleChange}
                bg={inputBg}
              >
                <option value="PHARMACY">{t('banners.add.pharmacy')}</option>
                <option value="PRODUCT">{t('banners.add.product')}</option>
                <option value="DOCTOR">{t('banners.add.doctor')}</option>
                <option value="EXTERNAL">{t('banners.add.externalLink')}</option>
              </Select>
            </FormControl>

            {/* Link or Link ID / Select Entity */}          
            {formData.linkType === "EXTERNAL" ? (
              <FormControl isRequired flex="1">
                <FormLabel>{t('banners.add.linkUrl')}</FormLabel>
                <Input
                  name="link"
                  placeholder={t('banners.add.enterExternalLink')}
                  value={formData.link}
                  onChange={handleChange}
                  bg={inputBg}
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                />
              </FormControl>
            ) : (
              <FormControl isRequired flex="1">
                <FormLabel>{t('banners.add.selectEntity', { type: t(`banners.add.${formData.linkType.toLowerCase()}`) })}</FormLabel>
                {formData.linkType === "PHARMACY" && isPharmaciesLoading ? (
                   <Spinner size="sm" />
                ) : formData.linkType === "PRODUCT" && isProductsLoading ? (
                   <Spinner size="sm" />
                ) : formData.linkType === "DOCTOR" && isDoctorsLoading ? (
                   <Spinner size="sm" />
                ) : (
                  <Select
                    name="linkId"
                    placeholder={t('banners.add.selectEntity', { type: t(`banners.add.${formData.linkType.toLowerCase()}`) })}
                    value={formData.linkId}
                    onChange={handleChange}
                    bg={inputBg}
                  >
                    {formData.linkType === "PHARMACY" && pharmacies.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                    {formData.linkType === "PRODUCT" && products.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                    {formData.linkType === "DOCTOR" && doctors.map(item => (
                      <option key={item.id} value={item.id}>{item.fullName}</option>
                    ))}
                  </Select>
                )}
              </FormControl>
            )}
          </Flex>

          {/* Order */}
          <FormControl mb={4}>
            <FormLabel>{t('banners.add.displayOrder')}</FormLabel>
            <Input
              name="order"
              type="number"
              placeholder={t('banners.add.enterDisplayOrder')}
              value={formData.order}
              onChange={handleChange}
              min="1"
              bg={inputBg}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
          </FormControl>

          {/* Status */}
          <FormControl mb={4} display="flex" alignItems="center">
            <FormLabel mb="0">{t('banners.add.activeStatus')}</FormLabel>
            <Switch
              isChecked={formData.isActive}
              onChange={handleSwitchChange}
              colorScheme="green"
              ml={2}
            />
          </FormControl>

          {/* Image Upload */}
          <FormControl mb={4} isRequired>
            <FormLabel>{t('banners.add.bannerImage')}</FormLabel>
            <Box
              border="1px dashed"
              borderColor={isDragging ? "blue.500" : "gray.200"}
              borderRadius="md"
              p={4}
              textAlign="center"
              bg={isDragging ? "blue.50" : "gray.50"}
              cursor="pointer"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <Icon as={FaUpload} w={8} h={8} color="blue.500" mb={2} />
              <Text>{t('banners.add.dragDropImage')}</Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                {t('banners.add.recommendedSize')}
              </Text>
              <input
                type="file"
                id="fileInput"
                hidden
                accept="image/*"
                onChange={handleFileInputChange}
              />
            </Box>
          </FormControl>

          {imagePreview && (
            <Box position="relative" mb={4}>
              <Image
                src={imagePreview}
                alt="Banner preview"
                maxH="200px"
                mx="auto"
                borderRadius="md"
              />
              <IconButton
                icon={<FaTrash />}
                aria-label="Remove image"
                position="absolute"
                top={2}
                right={2}
                colorScheme="red"
                size="sm"
                onClick={handleRemoveImage}
              />
            </Box>
          )}

          {/* Action Buttons */}
          <Flex justify="flex-end" mt={6} gap={4}>
            <Button
              variant="outline"
              colorScheme="red"
              onClick={handleCancel}
              isDisabled={isLoading}
            >
              {t('banners.add.cancel')}
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isLoading}
              loadingText={t('banners.add.creating')}
            >
              {t('banners.add.saveBanner')}
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default AddBanner;
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
  Icon,
  Image,
  Badge,
  IconButton,
  useToast,
  FormControl,
  FormLabel,
  Spinner,
  Switch
} from "@chakra-ui/react";
import { FaUpload, FaTrash } from "react-icons/fa6";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { useGetBrandQuery, useUpdateBrandMutation } from "api/brandSlice";
import Swal from "sweetalert2";
import { useAddFileMutation } from "api/filesSlice";
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const EditBrand = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // API hooks
  const { data: brandResponse, isLoading: isFetching } = useGetBrandQuery(id);
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();
  const [addFile] = useAddFileMutation();

  // State management
  const [enName, setEnName] = useState("");
  const [arName, setArName] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [existingImage, setExistingImage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isActive, setIsActive] = useState(brandResponse?.data?.isActive ?? true);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const borderColorDefault = useColorModeValue('gray.200', 'gray.600');
  const bgDrag = useColorModeValue('brand.50', 'navy.800');

  // Initialize form with existing data
  useEffect(() => {
    if (brandResponse?.data) {
      setEnName(brandResponse.data.name);
      setArName(brandResponse.data.translations?.find(t => t.languageId === "ar")?.name || "");
      setExistingImage(brandResponse.data.imageKey || "");
      setIsActive(brandResponse.data.isActive);
    }
  }, [brandResponse]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Image handling functions
  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('editBrand.InvalidFileType'),
          description: t('editBrand.PleaseUploadImageFile'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Validate file size (e.g., 5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('editBrand.FileTooLarge'),
          description: t('editBrand.MaximumFileSizeIs5MB'),
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

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImage(null);
    setImagePreview("");
  };

  const handleCancel = () => {
    Swal.fire({
      title: t('editBrand.AreYouSure'),
      text: t('editBrand.YouWillLoseAllUnsavedChanges'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('editBrand.YesDiscardChanges'),
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/admin/brands");
      }
    });
  };

  const handleSubmit = async () => {
    if (!enName || !arName) {
      toast({
        title: t('editBrand.ErrorRequiredFields'),
        description: t('editBrand.PleaseFillAllRequiredFields'),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      let imageUrl = existingImage;
      
      // Upload new image if one was selected
      if (image) {
        const formData = new FormData();
        formData.append('file', image);

        const uploadResponse = await addFile(formData).unwrap();
        
        if (!uploadResponse.success || !uploadResponse.data.uploadedFiles[0]?.url) {
          throw new Error('Failed to upload image');
        }

        imageUrl = uploadResponse.data.uploadedFiles[0].url;
      }

      // Prepare the update payload
      const payload = {
        name: enName,
        imageKey: imageUrl,
        isActive: isActive,
        translations: [
          { languageId: "ar", name: arName },
        ],
      };

      // Remove undefined/null values
      Object.keys(payload).forEach(key => {
        if (payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await updateBrand({ id, brand: payload }).unwrap();

      toast({
        title: t('editBrand.SuccessUpdate'),
        description: t('editBrand.BrandUpdatedSuccessfully'),
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      navigate("/admin/brands");
    } catch (error) {
      console.error("Failed to update brand:", error);
      toast({
        title: t('editBrand.ErrorUpdate'),
        description: error.data?.message || t('editBrand.FailedToUpdateBrand'),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isFetching) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!brandResponse?.data) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Text>{t('editBrand.NotFound')}</Text>
      </Flex>
    );
  }

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
            {t('editBrand.EditBrand')}
          </Text>
          <Button
            type="button"
            onClick={handleCancel}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('editBrand.Back')}
          </Button>
        </div>
        <form>
          {/* English Name Field */}
          <Box mb={4}>
            <FormControl isRequired>
              <FormLabel>{t('editBrand.BrandNameEnglish')}</FormLabel>
              <Input
                placeholder={t('editBrand.EnterBrandNameInEnglish')}
                value={enName}
                onChange={(e) => setEnName(e.target.value)}
                color={textColor}
                bg={inputBg}
              />
            </FormControl>
          </Box>

          {/* Arabic Name Field */}
          <Box mb={4}>
            <FormControl isRequired>
              <FormLabel>{t('editBrand.BrandNameArabic')}</FormLabel>
              <Input
                placeholder={t('editBrand.EnterBrandNameInArabic')}
                value={arName}
                onChange={(e) => setArName(e.target.value)}
                dir="rtl"
                color={textColor}
                bg={inputBg}
              />
            </FormControl>
          </Box>

          {/* Image Upload Section */}
          <Box mb={4}>
            <FormControl>
              <FormLabel>{t('editBrand.BrandLogo')}</FormLabel>
              <Box
                border="1px dashed"
                borderColor={isDragging ? 'brand.500' : borderColorDefault}
                borderRadius="md"
                p={4}
                textAlign="center"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                cursor="pointer"
                bg={isDragging ? bgDrag : inputBg}
              >
                <Icon as={FaUpload} w={8} h={8} color="blue.500" mb={2} />
                <Text color={textColor}>{t('editBrand.DragDropLogoHereOr')}</Text>
                <Button
                  variant="link"
                  color="blue.500"
                  onClick={() => document.getElementById("fileInput").click()}
                >
                  {t('editBrand.BrowseFiles')}
                </Button>
                <Input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  display="none"
                />
              </Box>
            </FormControl>

            {(imagePreview || existingImage) && (
              <Box mt={4} position="relative" display="inline-block">
                <Image
                  src={imagePreview || existingImage}
                  alt={t('editBrand.BrandLogoPreview')}
                  borderRadius="md"
                  boxSize="150px"
                  objectFit="contain"
                />
                {imagePreview && (
                  <IconButton
                    icon={<FaTrash />}
                    aria-label={t('editBrand.RemoveImage')}
                    size="sm"
                    colorScheme="red"
                    position="absolute"
                    top={2}
                    right={2}
                    onClick={handleRemoveImage}
                  />
                )}
              </Box>
            )}
          </Box>

          {/* Active Status Toggle */}
          <Box mb={4}>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="isActive" mb="0">{t('editBrand.ActiveStatus')}</FormLabel>
              <Switch
                id="isActive"
                isChecked={isActive}
                onChange={() => setIsActive(!isActive)}
                colorScheme="teal"
                size="md"
                dir="ltr"
              />
            </FormControl>
          </Box>

          {/* Action Buttons */}
          <Flex justify="flex-end" mt={4}>
            <Button
              variant="outline"
              colorScheme="red"
              onClick={handleCancel}
              mr={4}
            >
              {t('editBrand.Cancel')}
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isUpdating}
              loadingText={t('editBrand.Saving')}
              mx={2}
            >
              {t('editBrand.SaveChanges')}
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default EditBrand;
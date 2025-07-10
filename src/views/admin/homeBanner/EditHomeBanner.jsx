import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useToast,
  Spinner,
  Flex,
  Text ,
  Switch,
  Icon,
  Image,
  useColorModeValue
} from '@chakra-ui/react';
import Card from 'components/card/Card';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetBannersQuery, useUpdateBannerMutation } from 'api/homeBannerSlice';
import { FaUpload } from 'react-icons/fa6';
import Swal from 'sweetalert2';
import { useAddFileMutation } from 'api/filesSlice';
import { IoMdArrowBack } from 'react-icons/io';
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const EditHomeBanner = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Color mode values
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');

  // Fetch all banners and find the one to edit (assuming API doesn't have getById)
  // A dedicated getBannerById query is generally better if your API supports it.
  // For now, fetching the list and finding the banner locally.
  const { data: bannersResponse, isLoading: isLoadingBanners, isError: isErrorBanners, error: errorBanners } = useGetBannersQuery();
  const banners = bannersResponse?.data || [];
  const bannerToEdit = banners.find(banner => banner.id === id);


  const [bannerData, setBannerData] = useState({
    textEn: '',
    textAr: '',
    link: '',
    order: '',
    isActive: true,
    // Add other fields as needed
  });

  const [image, setImage] = useState(null); // State for image file or image URL string
  const [isDragging, setIsDragging] = useState(false); // State for drag-and-drop


  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const [addFile, { isLoading: isUploadingImage }] = useAddFileMutation(); // Mutation hook for adding a file


  useEffect(() => {
    if (bannerToEdit) {
      setBannerData({
        textEn: bannerToEdit.textEn || '',
        textAr: bannerToEdit.textAr || '',
        link: bannerToEdit.link || '',
        order: bannerToEdit.order || '',
        isActive: bannerToEdit.isActive !== undefined ? bannerToEdit.isActive : true,
        // Map other fields
      });
      // Set the initial image if available (it will be a URL string)
      if (bannerToEdit.imageKey) {
        setImage(bannerToEdit.imageKey);
      }
    }
  }, [bannerToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBannerData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle image upload
  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      // Validate file type if needed
      if (!selectedFile.type.startsWith('image/')) {
        Swal.fire(t('homeBanners.edit.error'), t('homeBanners.edit.uploadImageFile'), 'error');
        return;
      }
      setImage(selectedFile);
    }
  };

  // Handle drag-and-drop events
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

  // Handle file input change
  const handleFileInputChange = (e) => {
    const files = e.target.files;
    handleImageUpload(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;

    let imageKey = bannerToEdit?.imageKey || ''; // Start with the existing image key

    // If a new image file is selected, upload it
    if (image && typeof image !== 'string') { // Check if 'image' is a File object (new image)
      try {
        const formData = new FormData();
        formData.append('file', image);

        const uploadResponse = await addFile(formData).unwrap();

        if (
          !uploadResponse.success ||
          uploadResponse.data.uploadedFiles.length === 0
        ) {
          throw new Error('Failed to upload image');
        }
        imageKey = uploadResponse.data.uploadedFiles[0].url;
      } catch (uploadError) {
        toast({
          title: t('homeBanners.edit.error'),
          description: uploadError?.data?.message || t('homeBanners.edit.uploadError'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        console.error('Failed to upload image:', uploadError);
        return; // Stop if image upload fails
      }
    } else if (!imageKey) { // If no new image and no existing image
         Swal.fire(t('homeBanners.edit.error'), t('homeBanners.edit.uploadImage'), 'error');
         return;
    }

    try {
      // Prepare the payload with imageKey and converted order
      const payload = {
        ...bannerData,
        id: id, // Include id for update mutation
        imageKey: imageKey, // Use the determined imageKey
        order: isNaN(parseInt(bannerData.order, 10)) ? 0 : parseInt(bannerData.order, 10), // Convert order to integer, default to 0 if NaN
      };


      await updateBanner(payload).unwrap();
      toast({
        title: t('homeBanners.edit.success'),
        description: t('homeBanners.edit.updatedSuccessfully'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/admin/undefined/cms/home-banners'); // Navigate back to list page
    } catch (error) {
      toast({
        title: t('homeBanners.edit.error'),
        description: error?.data?.message || t('homeBanners.edit.failedToUpdate'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Failed to update banner:', error);
    }
  };

  if (isLoadingBanners) {
    return (
      <Flex justifyContent="center" alignItems="center" height="200px" pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (isErrorBanners) {
     return (
      <Flex justifyContent="center" alignItems="center" height="200px" pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Text color="red.500">{t('homeBanners.edit.loadErrorText')}: {errorBanners.message}</Text>
      </Flex>
    );
  }

  if (!bannerToEdit) {
      return (
      <Flex justifyContent="center" alignItems="center" height="200px" pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Text color="red.500">{t('homeBanners.edit.bannerNotFound')}</Text>
      </Flex>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Card>
        {/* Header with Title and Back Button */}
        <Flex justifyContent="space-between" alignItems="center" mb="20px">
          <Text fontSize="xl" fontWeight="bold" lineHeight="100%" color={textColor}>
            {t('homeBanners.edit.title')}
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<Icon as={IoMdArrowBack} w="20px" h="20px" color="inherit" />}
          >
            {t('homeBanners.edit.back')}
          </Button>
        </Flex>

        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>

             {/* Image Upload Field */}
             <FormControl id="image" isRequired>
              <FormLabel>{t('homeBanners.edit.bannerImage')}</FormLabel>
              <Box
                border={'1px dashed #ccc'}
                borderRadius="md"
                p={4}
                textAlign="center"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                bg={isDragging ? 'gray.100' : 'transparent'}
                cursor="pointer"
                onClick={() => document.getElementById('fileInput').click()}
              >
                <input
                  type="file"
                  id="fileInput"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                />
                {image ? (
                  <Image
                    src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                    alt="Banner Preview"
                    maxH="200px"
                    mx="auto"
                  />
                ) : (
                  <Flex direction="column" align="center">
                    <Icon as={FaUpload} w={8} h={8} color="gray.400" mb={2} />
                    <Text fontSize="sm" color="gray.600">
                      {t('homeBanners.edit.dragDropImage')}
                    </Text>
                  </Flex>
                )}
              </Box>
            </FormControl>


            <FormControl id="textEn">
              <FormLabel>{t('homeBanners.edit.titleEnglish')}</FormLabel>
              <Input
                type="text"
                name="textEn"
                value={bannerData.textEn}
                onChange={handleChange}
                bg={inputBg}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
            </FormControl>

            <FormControl id="textAr">
              <FormLabel>{t('homeBanners.edit.titleArabic')}</FormLabel>
              <Input
                type="text"
                name="textAr"
                value={bannerData.textAr}
                onChange={handleChange}
                dir="rtl"
                bg={inputBg}
              />
            </FormControl>

            <FormControl id="link">
              <FormLabel>{t('homeBanners.edit.link')}</FormLabel>
              <Input
                type="text"
                name="link"
                value={bannerData.link}
                onChange={handleChange}
                bg={inputBg}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
            </FormControl>

             <FormControl id="order">
              <FormLabel>{t('homeBanners.edit.order')}</FormLabel>
              <Input
                type="number"
                name="order"
                value={bannerData.order}
                onChange={handleChange}
                bg={inputBg}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
            </FormControl>

            <FormControl id="isActive" display="flex" alignItems="center">
              <FormLabel htmlFor="isActive" mb="0">
                {t('homeBanners.edit.activeStatus')}
              </FormLabel>
              <Switch
                id="isActive"
                name="isActive"
                isChecked={bannerData.isActive}
                onChange={handleChange}
                colorScheme="teal"
              />
            </FormControl>

            {/* Add more form controls for other fields */}

            <Button variant="darkBrand" color="white" type="submit" mt={4} isLoading={isUpdating || isUploadingImage} width="100%">
              {t('homeBanners.edit.updateBanner')}
            </Button>
          </Stack>
        </form>
      </Card>
    </Box>
  );
};

export default EditHomeBanner; 
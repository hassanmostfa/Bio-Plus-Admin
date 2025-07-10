import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
  Textarea,
  Icon,
  useToast,
  IconButton,
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { IoMdArrowBack } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import { FaUpload, FaTrash } from 'react-icons/fa6';
import { useUpdateReturnMutation } from 'api/returnSlice';
import { useGetReturnQuery } from 'api/returnSlice';
import Swal from 'sweetalert2';
import { useAddFileMutation } from 'api/filesSlice';
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const EditReturn = () => {
  const [formData, setFormData] = useState({
    contentEn: '',
    contentAr: '',
    imageKey: '',
  });

  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const navigate = useNavigate();
  const toast = useToast();
  const [error, setError] = useState(null);
  const { id } = useParams();
  const { t } = useTranslation();
  const { language } = useLanguage();

  // API hooks
  const [updateReturnPolicy, { isLoading }] = useUpdateReturnMutation();
  const { data: returnData, isLoading: isFetching,refetch } = useGetReturnQuery(id);
  const [addFile] = useAddFileMutation();
useEffect(() => {
  refetch();
},[]);
  // Set initial data when fetched
  useEffect(() => {
    if (returnData?.data) {
      setFormData({
        contentEn: returnData.data.contentEn || '',
        contentAr: returnData.data.contentAr || '',
        imageKey: returnData.data.image || '',
      });
      setExistingImage(returnData.data.image || "");
      setIsActive(returnData.data.isActive ?? true);
    }
  }, [returnData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      setImage(files[0]);
      // Clear existing image when new one is uploaded
      setExistingImage(null);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setExistingImage(null);
    setFormData(prev => ({ ...prev, imageKey: '' }));
    // Clear file input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
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

  const handleSubmit = async () => {
    try {
      let imageUrl = existingImage;
      
      // Upload new image if one was selected
      if (image) {
        const file = new FormData();
        file.append('file', image);

        const uploadResponse = await addFile(file).unwrap();
        
        if (!uploadResponse.success || !uploadResponse.data.uploadedFiles[0]?.url) {
          throw new Error('Failed to upload image');
        }

        imageUrl = uploadResponse.data.uploadedFiles[0].url;
      }

      // Prepare the payload as a raw JSON object
      const payload = {
        contentEn: formData.contentEn,
        contentAr: formData.contentAr,
        image: imageUrl, // Send just the image filename as string
      };
  
      // Conditionally add isActive to payload if it exists in fetched data
      if (returnData?.data?.isActive !== undefined) {
        payload.isActive = isActive;
      }
  
      // Update the policy with raw JSON data
      const response = await updateReturnPolicy({
        id,
        data: payload // Send as plain JavaScript object
      }).unwrap();
  
      Swal.fire({
        title: t('returns.updateSuccessTitle'),
        text: t('returns.updateSuccessText'),
        icon: 'success',
        confirmButtonText: t('returns.ok')
      }).then(() => {
        navigate('/admin/undefined/cms/returned');
      });
    } catch (error) {
      setError(error.data);
      Swal.fire({
        title: t('returns.updateErrorTitle'),
        text: error.data?.message || t('returns.updateErrorText'),
        icon: 'error',
        confirmButtonText: t('returns.ok')
      });
    }
  };

  if (isFetching) {
    return <Box>{t('returns.loading')}</Box>;
  }

  return (
    <Box w="100%" className="container add-admin-container w-100" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Box bg={cardBg} className="add-admin-card shadow p-4 w-100">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            {t('returns.editReturnPolicy')}
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('returns.back')}
          </Button>
        </div>
        <form>
          {error?.success === false && (
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">{t('returns.validationFailed')}</h4>
              <ul>
                {error.errors?.map((err) => (
                  <li key={err.field}>
                    {err.field} - {err.message.en || err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* English Content */}
          <Box mt={4}>
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('returns.englishContent')} <span className="text-danger">*</span>
            </Text>
            <Textarea
              name="contentEn"
              value={formData.contentEn}
              onChange={handleChange}
              mt={2}
              height="200px"
              bg={inputBg}
              color={textColor}
              placeholder={t('returns.englishContentPlaceholder')}
            />
          </Box>

          {/* Arabic Content */}
          <Box mt={4}>
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('returns.arabicContent')} <span className="text-danger">*</span>
            </Text>
            <Textarea
              name="contentAr"
              value={formData.contentAr}
              onChange={handleChange}
              mt={2}
              height="200px"
              bg={inputBg}
              color={textColor}
              placeholder={t('returns.arabicContentPlaceholder')}
              dir="rtl"
            />
          </Box>

          {/* Active Status Toggle */}
          <Box mt="20px" mb="20px">
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="isActive" mb="0">
                {t('returns.activeStatus')}
              </FormLabel>
              <Switch
                id="isActive"
                isChecked={isActive}
                onChange={() => setIsActive(!isActive)}
                colorScheme="teal"
                size="md"
              />
            </FormControl>
          </Box>

          {/* Image Upload */}
          <Box
            border="1px dashed"
            borderColor="gray.300"
            borderRadius="md"
            p={4}
            textAlign="center"
            backgroundColor={inputBg}
            cursor="pointer"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            mt={4}
            mb={4}
          >
            <Icon as={FaUpload} w={8} h={8} color="#422afb" mb={2} />
            <Text color="gray.500" mb={2}>
              {t('returns.dragDropImage')}
            </Text>
            <Text color="gray.500" mb={2}>
              {t('returns.or')}
            </Text>
            <Button
              variant="outline"
              color="#422afb"
              border="none"
              onClick={() => document.getElementById('fileInput').click()}
            >
              {t('returns.uploadImage')}
              <input
                type="file"
                id="fileInput"
                hidden
                accept="image/*"
                onChange={handleFileInputChange}
              />
            </Button>

            {/* Display existing or new image with delete option */}
            {(existingImage || image) && (
              <Box mt={4} position="relative">
                <img
                  src={image ? URL.createObjectURL(image) : existingImage}
                  alt={image ? image.name : existingImage.name}
                  width="200px"
                  maxHeight="200px"
                  style={{ objectFit: 'contain', borderRadius: 'md' }}
                />
                <IconButton
                  icon={<FaTrash />}
                  aria-label={t('returns.removeImage')}
                  position="absolute"
                  top={2}
                  right={2}
                  colorScheme="red"
                  size="sm"
                  onClick={handleRemoveImage}
                />
                <Text mt={2} color={textColor}>
                  {image ? image.name : existingImage.name}
                </Text>
              </Box>
             )}
          </Box>

          {/* Save and Cancel Buttons */}
          <Flex justify="center" mt={6}>
            <Button variant="outline" colorScheme="red" mr={2} onClick={() => navigate(-1)}>
              {t('returns.cancel')}
            </Button>
            <Button
              variant="darkBrand"
              color="white"
              fontSize="sm"
              fontWeight="500"
              borderRadius="70px"
              px="24px"
              py="5px"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={isLoading}
            >
              {t('returns.updatePolicy')}
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default EditReturn;
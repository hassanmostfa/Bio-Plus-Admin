import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Input,
  Text,
  useColorModeValue,
  Image,
  Icon,
} from "@chakra-ui/react";
import { IoMdArrowBack } from "react-icons/io";
import { FaUpload } from 'react-icons/fa6';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAddSpecializationMutation } from "api/doctorSpecializationSlice";
import { useAddFileMutation } from "api/filesSlice";
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../contexts/LanguageContext';

const AddSpecialize = () => {
  const [name, setName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const [icon, setIcon] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const [addSpecialize, { isLoading }] = useAddSpecializationMutation();
  const [uploadFile, { isLoading: isUploading }] = useAddFileMutation();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // Color mode values
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const cardBg = useColorModeValue("white", "navy.700");
  const inputBg = useColorModeValue("gray.100", "gray.700");
  const inputBorder = useColorModeValue("gray.300", "gray.600");

  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        Swal.fire("Error!", "Please upload an image file", "error");
        return;
      }
      setIcon(selectedFile);
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
    
    let uploadedIconUrl = "";
    
    // Upload icon if selected
    if (icon && typeof icon !== 'string') {
      try {
        const formData = new FormData();
        formData.append('file', icon);
        const uploadResponse = await uploadFile(formData).unwrap();
        
        if (uploadResponse.success && uploadResponse.data.uploadedFiles.length > 0) {
          uploadedIconUrl = uploadResponse.data.uploadedFiles[0].url;
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Failed to upload icon:', error);
        Swal.fire(
          t('specializations.error'),
          t('specializations.failedToUploadIcon'),
          'error'
        );
        return;
      }
    }
    
    const tagData = {
      name,
      icon: uploadedIconUrl,
      translations: [
        {
          languageId: "ar",
          name: arabicName
        }
      ]
    };



    try {
      const response = await addSpecialize(tagData).unwrap();
      Swal.fire(t('specializations.success'), t('specializations.specializationCreatedSuccessfully'), 'success');
      navigate('/admin/specializations');
    } catch (error) {
      console.error('Failed to add tag:', error);
      Swal.fire(
        t('specializations.error'),
        error.data?.message || t('specializations.failedToCreateSpecialization'),
        'error'
      );
    }
  };

  const handleCancel = () => {
    setName("");
    setArabicName("");
    navigate('/admin/specializations');
  };

  return (
    <Flex justify="center" p="20px" mt={'80px'} dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <Box w="100%" p="6" boxShadow="md" borderRadius="lg" bg={cardBg}>
        <Flex justify="space-between" align="center" mb="20px">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            {t('specializations.addNewSpecialization')}
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('specializations.back')}
          </Button>
        </Flex>

        <form onSubmit={handleSubmit}>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            {/* English Name Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('specializations.englishName')}
                <span style={{ color: 'red' }}> *</span>
              </Text>
              <Input
                type="text"
                placeholder={t('specializations.enterEnglishName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
              />
            </Box>

            {/* Arabic Name Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('specializations.arabicName')}
                <span style={{ color: 'red' }}> *</span>
              </Text>
              <Input
                type="text"
                placeholder={t('specializations.enterArabicName')}
                value={arabicName}
                onChange={(e) => setArabicName(e.target.value)}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
                dir="rtl"
              />
            </Box>

            {/* Icon Upload Field */}
            <Box gridColumn="span 2">
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('specializations.icon')}
              </Text>
              
              {/* Drag-and-Drop Upload Section */}
              <Box
                border="1px dashed"
                borderColor={isDragging ? 'brand.500' : 'gray.300'}
                borderRadius="md"
                p={4}
                textAlign="center"
                backgroundColor={isDragging ? 'brand.50' : inputBg}
                cursor="pointer"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                mb={4}
              >
                {icon ? (
                  <Flex direction="column" align="center">
                    <Image
                      src={
                        typeof icon === 'string'
                          ? icon
                          : URL.createObjectURL(icon)
                      }
                      alt="Specialization Icon"
                      maxH="200px"
                      mb={2}
                      borderRadius="md"
                    />
                    <Button
                      variant="outline"
                      colorScheme="red"
                      size="sm"
                      onClick={() => setIcon(null)}
                    >
                      {t('common.remove')}
                    </Button>
                  </Flex>
                ) : (
                  <>
                    <Icon as={FaUpload} w={8} h={8} color="#422afb" mb={2} />
                    <Text color="gray.500" mb={2}>
                      {t('common.dragDropImage')}
                    </Text>
                    <Text color="gray.500" mb={2}>
                      {t('common.or')}
                    </Text>
                    <Button
                      variant="outline"
                      color="#422afb"
                      border="none"
                      onClick={() => document.getElementById('fileInput').click()}
                    >
                      {t('common.uploadImage')}
                      <input
                        type="file"
                        id="fileInput"
                        hidden
                        accept="image/*"
                        onChange={handleFileInputChange}
                      />
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Grid>

          {/* Action Buttons */}
          <Flex justify="center" mt={6} gap={4}>
            <Button
              variant="outline"
              colorScheme="red"
              onClick={handleCancel}
              width="120px"
            >
              {t('specializations.cancel')}
            </Button>
            <Button
              variant='solid'
              colorScheme='brandScheme'
              color='white'
              fontSize='sm'
              fontWeight='500'
              borderRadius='70px'
              px='24px'
              py='5px'
              type="submit"
              isLoading={isLoading || isUploading}
              loadingText={isUploading ? t('specializations.uploading') : t('specializations.submitting')}
              width="120px"
            >
              {t('specializations.create')}
            </Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  );
};

export default AddSpecialize;
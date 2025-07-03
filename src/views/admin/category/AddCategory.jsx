import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
} from '@chakra-ui/react';
import { FaUpload } from 'react-icons/fa6';
import { IoMdArrowBack, IoIosArrowDown } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { useAddCategoryMutation } from 'api/categorySlice';
import Swal from 'sweetalert2';
import { useAddFileMutation } from 'api/filesSlice';
import { useTranslation } from 'react-i18next';

const AddCategory = () => {
  const [enName, setEnName] = useState(''); // State for English name
  const [arName, setArName] = useState(''); // State for Arabic name
  const [image, setImage] = useState(null); // State for image file
  const [isDragging, setIsDragging] = useState(false); // State for drag-and-drop
  const [selectedCategoryType, setSelectedCategoryType] = useState(
    'Select Category Type',
  ); // State for category type
  const [addCategory, { isLoading }] = useAddCategoryMutation(); // Mutation hook for adding a category
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const [addFile] = useAddFileMutation(); // Mutation hook for adding a file
  // Handle image upload
  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      // Validate file type if needed
      if (!selectedFile.type.startsWith('image/')) {
        Swal.fire('Error!', 'Please upload an image file', 'error');
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

  // Handle cancel action
  const handleCancel = () => {
    setEnName('');
    setArName('');
    setImage(null);
    setSelectedCategoryType(t('category.selectCategoryType'));
  };
  // Handle category type selection
  const handleSelectCategoryType = (type) => {
    setSelectedCategoryType(type);
  };

  // Handle form submission
  const handleSend = async () => {
    if (!enName || !arName || !image) {
      Swal.fire(t('common.error'), t('forms.required'), 'error');
      return;
    }

    try {
      // First upload the image
      const formData = new FormData();
      formData.append('file', image);

      const uploadResponse = await addFile(formData).unwrap();

      if (
        !uploadResponse.success ||
        uploadResponse.data.uploadedFiles.length === 0
      ) {
        throw new Error('Failed to upload image');
      }

      const imageKey = uploadResponse.data.uploadedFiles[0].url;

      // Prepare the payload
      const payload = {
        image:imageKey,
        translations: [
          { languageId: 'en', name: enName },
          { languageId: 'ar', name: arName },
        ],
        // categoryType: selectedCategoryType,
      };

      // Call the add category API
      const response = await addCategory(payload).unwrap();

      Swal.fire(t('common.success'), t('category.addedSuccess'), 'success');
      navigate('/admin/categories');
    } catch (error) {
      console.error('Failed to add category:', error);
      Swal.fire(t('common.error'), error.message || t('category.addFailed'), 'error');
    }
  };
  return (
    <div className="container add-admin-container w-100">
      <Box bg={cardBg} className="add-admin-card shadow p-4 w-100">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            mb="20px !important"
            lineHeight="100%"
            textAlign={isRTL ? 'right' : 'left'}
          >
            {t('category.addCategory')}
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('common.back')}
          </Button>
        </div>
        <form dir={isRTL ? 'rtl' : 'ltr'} style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {/* English Name Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('category.enName')} <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="text"
              id="en_name"
              placeholder={t('forms.enterEnName')}
              value={enName}
              onChange={(e) => setEnName(e.target.value)}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Arabic Name Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('category.arName')} <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="text"
              id="ar_name"
              placeholder={t('forms.enterArName')}
              value={arName}
              onChange={(e) => setArName(e.target.value)}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Category Type Dropdown */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('category.type')}
              <span className="text-danger mx-1">*</span>
            </Text>
            {/* <Menu>
              <MenuButton
                as={Button}
                rightIcon={<IoIosArrowDown />}
                width="100%"
                bg={inputBg}
                border="1px solid #ddd"
                borderRadius="md"
                _hover={{ bg: 'gray.200' }}
                textAlign="left"
                fontSize={'sm'}
              >
                {selectedCategoryType}
              </MenuButton>
              <MenuList width="100%">
                <MenuItem
                  _hover={{ bg: '#38487c', color: 'white' }}
                  onClick={() => handleSelectCategoryType('Type A')}
                >
                  Type A
                </MenuItem>
                <MenuItem
                  _hover={{ bg: '#38487c', color: 'white' }}
                  onClick={() => handleSelectCategoryType('Type B')}
                >
                  Type B
                </MenuItem>
                <MenuItem
                  _hover={{ bg: '#38487c', color: 'white' }}
                  onClick={() => handleSelectCategoryType('Type C')}
                >
                  Type C
                </MenuItem>
              </MenuList>
            </Menu> */}
          </div>

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
            {image ? (
              <Flex direction="column" align="center">
                <Image
                  src={URL.createObjectURL(image)}
                  alt="Category"
                  maxH="200px"
                  mb={2}
                  borderRadius="md"
                />
                <Button
                  variant="outline"
                  colorScheme="red"
                  size="sm"
                  onClick={() => setImage(null)}
                >
                  Remove Image
                </Button>
              </Flex>
            ) : (
              <>
                <Icon as={FaUpload} w={8} h={8} color="#422afb" mb={2} />
                <Text color="gray.500" mb={2}>
                  Drag & Drop Image Here
                </Text>
                <Text color="gray.500" mb={2}>
                  or
                </Text>
                <Button
                  variant="outline"
                  color="#422afb"
                  border="none"
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  Upload Image
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

          {/* Action Buttons */}
          <Flex justify="center" mt={4}>
            <Button
              variant="outline"
              colorScheme="red"
              onClick={handleCancel}
              mr={2}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="darkBrand"
              color="white"
              fontSize="sm"
              fontWeight="500"
              borderRadius="70px"
              px="24px"
              py="5px"
              mx={2}
              onClick={handleSend}
              isLoading={isLoading}
            >
              {t('common.save')}
            </Button>
          </Flex>
        </form>
      </Box>
    </div>
  );
};

export default AddCategory;

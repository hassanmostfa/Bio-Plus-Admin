import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useToast,
  Flex,
  Text,
  Switch,
  Icon,
  Image,
  useColorModeValue
} from '@chakra-ui/react';
import Card from 'components/card/Card';
import { useNavigate } from 'react-router-dom';
import { useCreateBannerMutation } from 'api/homeBannerSlice';
import { FaUpload } from 'react-icons/fa6';
import Swal from 'sweetalert2';
import { useAddFileMutation } from 'api/filesSlice';
import { IoMdArrowBack } from 'react-icons/io';

const AddHomeBanner = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');

  const [bannerData, setBannerData] = useState({
    textEn: '',
    textAr: '',
    link: '',
    order: '',
    isActive: true,
  });

  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [addFile, { isLoading: isUploadingImage }] = useAddFileMutation();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBannerData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (!selectedFile.type.startsWith('image/')) {
        Swal.fire('Error!', 'Please upload an image file', 'error');
        return;
      }
      setImage(selectedFile);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      Swal.fire('Error!', 'Please upload an image.', 'error');
      return;
    }

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

      const imageKey = uploadResponse.data.uploadedFiles[0].url;

      const payload = {
        ...bannerData,
        imageKey: imageKey,
        order: parseInt(bannerData.order, 10),
      };

      await createBanner(payload).unwrap();
      toast({
        title: 'Banner added.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/admin/undefined/cms/home-banners');
    } catch (error) {
      toast({
        title: 'Error adding banner.',
        description: error?.data?.message || 'Failed to add banner.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Failed to add banner:', error);
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Card>
        <Flex justifyContent="space-between" alignItems="center" mb="20px">
          <Text fontSize="xl" fontWeight="bold" lineHeight="100%" color={textColor}>
            Add New Home Banner
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<Icon as={IoMdArrowBack} w="20px" h="20px" color="inherit" />}
          >
            Back
          </Button>
        </Flex>

        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl id="image" isRequired>
              <FormLabel>Banner Image</FormLabel>
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
                    src={URL.createObjectURL(image)}
                    alt="Banner Preview"
                    maxH="200px"
                    mx="auto"
                  />
                ) : (
                  <Flex direction="column" align="center">
                    <Icon as={FaUpload} w={8} h={8} color="#422afb" mb={2} />
                    <Text fontSize="sm" color="gray.600">
                      Drag and drop an image here, or click to select a file
                    </Text>
                  </Flex>
                )}
              </Box>
            </FormControl>

            <FormControl id="textEn">
              <FormLabel>Title (English)</FormLabel>
              <Input
                type="text"
                name="textEn"
                value={bannerData.textEn}
                onChange={handleChange}
                bg={inputBg}
              />
            </FormControl>

            <FormControl id="textAr">
              <FormLabel>Title (Arabic)</FormLabel>
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
              <FormLabel>Link</FormLabel>
              <Input
                type="text"
                name="link"
                value={bannerData.link}
                onChange={handleChange}
                bg={inputBg}
              />
            </FormControl>

            <FormControl id="order">
              <FormLabel>Order</FormLabel>
              <Input
                type="number"
                name="order"
                value={bannerData.order}
                onChange={handleChange}
                bg={inputBg}
              />
            </FormControl>

            <FormControl id="isActive" display="flex" alignItems="center">
              <FormLabel htmlFor="isActive" mb="0">
                Active Status
              </FormLabel>
              <Switch
                id="isActive"
                name="isActive"
                isChecked={bannerData.isActive}
                onChange={handleChange}
                colorScheme="teal"
              />
            </FormControl>

            <Button colorScheme="blue" type="submit" mt={4} isLoading={isCreating || isUploadingImage} width="100%">
              Add Banner
            </Button>
          </Stack>
        </form>
      </Card>
    </Box>
  );
};

export default AddHomeBanner; 
import React, { useState, useEffect } from 'react';
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
  Skeleton,
} from '@chakra-ui/react';
import { FaUpload, FaTrash } from 'react-icons/fa6';
import { IoMdArrowBack } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import { useUpdateBannerMutation, useGetBannerQuery } from 'api/bannerSlice';
import { useAddFileMutation } from 'api/filesSlice';
import Swal from 'sweetalert2';
import { useGetPharmaciesQuery } from "../../../api/pharmacySlice";
import { useGetProductsQuery } from "../../../api/productSlice";
import { useGetDoctorsQuery } from "../../../api/doctorSlice";

const EditBanner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // State management
  const [formData, setFormData] = useState({
    title: '',
    arTitle: '',
    link: '',
    linkType: 'PHARMACY',
    linkId: '',
    order: 1,
    isActive: true,
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImage, setExistingImage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const textColor = useColorModeValue('secondaryGray.900', 'white');

  // API hooks
  const {
    data: banner,
    isLoading: isFetching,
    error,
    refetch,
  } = useGetBannerQuery(id);
  const [updateBanner] = useUpdateBannerMutation();
  const [addFile] = useAddFileMutation();

  // Fetch data for dropdowns
  const { data: pharmaciesData, isLoading: isPharmaciesLoading } = useGetPharmaciesQuery({});
  const { data: productsData, isLoading: isProductsLoading } = useGetProductsQuery({});
  const { data: doctorsData, isLoading: isDoctorsLoading } = useGetDoctorsQuery({});

  const pharmacies = pharmaciesData?.data?.items || []; // Adjust based on your API response structure
  const products = productsData?.data || []; // Adjust based on your API response structure
  const doctors = doctorsData?.data || []; // Adjust based on your API response structure

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Initialize form with existing data
  useEffect(() => {
    if (banner?.data) {
      const bannerData = banner.data;
      setFormData({
        title: bannerData.title,
        arTitle: bannerData.translations?.[0]?.title || '',
        link: bannerData.link || '', // Initialize link
        linkType: bannerData.linkType || 'EXTERNAL', // Initialize linkType, default to EXTERNAL
        linkId: bannerData.linkId || '', // Initialize linkId
        order: bannerData.order || 1,
        isActive: bannerData.isActive !== undefined ? bannerData.isActive : true,
      });
      setExistingImage(bannerData.imageKey);
    }
  }, [banner]);

  // Clean up object URLs
  useEffect(() => {
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
          title: 'Invalid file type',
          description: 'Please upload an image file',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Validate file size (e.g., 5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 5MB',
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
    setImagePreview('');
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      isActive: e.target.checked,
    }));
  };

  const handleCancel = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will lose all unsaved changes',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, discard changes',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/admin/undefined/cms/banners');
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Adjust validation based on link type
    if (!formData.title || !formData.arTitle || (formData.linkType === "EXTERNAL" && !formData.link) || (formData.linkType !== "EXTERNAL" && !formData.linkId)) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = existingImage;

      // Upload new image if one was selected
      if (image) {
        const formDataToSend = new FormData();
        formDataToSend.append('file', image);

        const uploadResponse = await addFile(formDataToSend).unwrap();

        if (
          !uploadResponse.success ||
          !uploadResponse.data.uploadedFiles[0]?.url
        ) {
          throw new Error('Failed to upload image');
        }

        imageUrl = uploadResponse.data.uploadedFiles[0].url;
      }

      // Prepare the update payload
      const payload = {
        title: formData.title,
        imageKey: imageUrl,
        linkType: formData.linkType,
        order: parseInt(formData.order),
        isActive: formData.isActive,
        translations: [
          {
            languageId: 'ar',
            title: formData.arTitle,
          },
        ],
      };

       // Set link and linkId based on linkType
       if (formData.linkType === "EXTERNAL") {
        payload.link = formData.link;
        payload.linkId = null; // Ensure linkId is null for external links
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
        payload.link = `${linkPath}${formData.linkId}`;
        payload.linkId = formData.linkId; // Ensure linkId is sent for internal types
      }

      // Remove null values
      Object.keys(payload).forEach((key) => {
        if (payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });

      await updateBanner({ id, data: payload }).unwrap();

      toast({
        title: 'Success',
        description: 'Banner updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      navigate('/admin/undefined/cms/banners');
    } catch (error) {
      console.error('Failed to update banner:', error);
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to update banner',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Box className="container add-admin-container w-100">
        <Box className="add-admin-card shadow p-4 bg-white w-100">
          <Skeleton height="40px" mb={6} />
          <Skeleton height="20px" mb={4} />
          <Skeleton height="20px" mb={4} />
          <Skeleton height="20px" mb={4} />
          <Skeleton height="20px" mb={4} />
          <Skeleton height="20px" mb={4} />
          <Skeleton height="20px" mb={4} />
          <Skeleton height="100px" mb={4} />
          <Flex justify="center" gap={4}>
            <Skeleton height="40px" width="100px" />
            <Skeleton height="40px" width="100px" />
          </Flex>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="container add-admin-container w-100">
        <Box className="add-admin-card shadow p-4 bg-white w-100">
          <Text color="red.500" mb={4}>
            Error loading banner: {error.data?.message || error.message}
          </Text>
          <Button onClick={() => navigate(-1)} colorScheme="blue">
            Go Back
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="container add-admin-container w-100">
      <Box className="add-admin-card shadow p-4 bg-white w-100">
        <Flex mb={3} justify="space-between" align="center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            mb="20px !important"
            lineHeight="100%"
          >
            Edit Banner
          </Text>
          <Button
            onClick={handleCancel}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            Back
          </Button>
        </Flex>

        <form onSubmit={handleSubmit}>
          {/* Title Field */}
          <FormControl mb={4} isRequired>
            <FormLabel>English Title</FormLabel>
            <Input
              name="title"
              placeholder="Enter Banner Title (English)"
              value={formData.title}
              onChange={handleChange}
            />
          </FormControl>

          {/* Arabic Title Field */}
          <FormControl mb={4} isRequired>
            <FormLabel>Arabic Title</FormLabel>
            <Input
              name="arTitle"
              placeholder="ادخل عنوان البانر"
              value={formData.arTitle}
              onChange={handleChange}
              dir="rtl"
            />
          </FormControl>

          {/* Link Type and Destination Input/Select side-by-side */}
          <Flex mb={4} gap={4} direction={{ base: "column", md: "row" }}>
            {/* Link Type */}          
            <FormControl isRequired flex="1">
              <FormLabel>Link Type</FormLabel>
              <Select
                name="linkType"
                value={formData.linkType}
                onChange={handleChange}
              >
                <option value="PHARMACY">Pharmacy</option>
                <option value="PRODUCT">Product</option>
                <option value="DOCTOR">Doctor</option>
                <option value="EXTERNAL">External Link</option>
              </Select>
            </FormControl>

            {/* Link or Link ID / Select Entity */}          
            {formData.linkType === "EXTERNAL" ? (
              <FormControl isRequired flex="1">
                <FormLabel>Link URL</FormLabel>
                <Input
                  name="link"
                  placeholder="Enter External Link URL"
                  value={formData.link}
                  onChange={handleChange}
                />
              </FormControl>
            ) : (
              <FormControl isRequired flex="1">
                <FormLabel>{formData.linkType} ID</FormLabel>
                {formData.linkType === "PHARMACY" && isPharmaciesLoading ? (
                 <Spinner size="sm" />
              ) : formData.linkType === "PRODUCT" && isProductsLoading ? (
                 <Spinner size="sm" />
              ) : formData.linkType === "DOCTOR" && isDoctorsLoading ? (
                 <Spinner size="sm" />
              ) : (
                <Select
                  name="linkId"
                  placeholder={`Select ${formData.linkType}`}
                  value={formData.linkId}
                  onChange={handleChange}
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
            <FormLabel>Display Order</FormLabel>
            <Input
              name="order"
              type="number"
              placeholder="Enter display order"
              value={formData.order}
              onChange={handleChange}
              min="1"
            />
          </FormControl>

          {/* Status */}
          <FormControl mb={4} display="flex" alignItems="center">
            <FormLabel mb="0">Active Status</FormLabel>
            <Switch
              isChecked={formData.isActive}
              onChange={handleSwitchChange}
              colorScheme="green"
              ml={2}
            />
          </FormControl>

          {/* Image Upload */}
          <FormControl mb={4}>
            <FormLabel>Banner Image</FormLabel>
            <Box
              border="1px dashed"
              borderColor={isDragging ? 'blue.500' : 'gray.200'}
              borderRadius="md"
              p={4}
              textAlign="center"
              bg={isDragging ? 'blue.50' : 'gray.50'}
              cursor="pointer"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <Icon as={FaUpload} w={8} h={8} color="blue.500" mb={2} />
              <Text>Drag & Drop Image Here or Click to Browse</Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                Recommended size: 1200x400px (Max 5MB)
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

          {/* Image Preview */}
          {(imagePreview || existingImage) && (
            <Box position="relative" mb={4}>
              <Image
                src={imagePreview || existingImage}
                alt="Banner preview"
                maxH="200px"
                mx="auto"
                borderRadius="md"
                fallbackSrc="https://via.placeholder.com/1200x400"
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
              Cancel
            </Button>
            <Button
              type="submit"
              variant="darkBrand"
              isLoading={isLoading}
              loadingText="Updating..."
            >
              Update Banner
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default EditBanner;

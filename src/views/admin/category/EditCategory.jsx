import React, { useState, useEffect } from 'react';
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
  Switch,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { FaUpload } from 'react-icons/fa6';
import { IoMdArrowBack, IoIosArrowDown } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from 'api/categorySlice';
import Swal from 'sweetalert2';
import { useAddFileMutation } from 'api/filesSlice';

const EditCategory = () => {
  const { id } = useParams(); // Get the category ID from the URL
  const { data: categoriesResponse } = useGetCategoriesQuery(id); // Fetch all categories
  const [updateCategory, { isLoading }] = useUpdateCategoryMutation(); // Mutation hook for updating a category
  const navigate = useNavigate();

  // State for form fields
  const [enName, setEnName] = useState('');
  const [arName, setArName] = useState('');
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isActive, setIsActive] = useState(categoriesResponse?.data?.data.find(
    (category) => category.id === id
  )?.isActive ?? true);

  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const [addFile] = useAddFileMutation(); // Mutation hook for adding a file
  // Find the category to edit based on the ID
  const categoryToEdit = categoriesResponse?.data?.data.find(
    (category) => category.id === id,
  );

  // Populate the form with the existing data when the component mounts
  useEffect(() => {
    if (categoryToEdit) {
      setEnName(
        categoryToEdit.translations.find((t) => t.languageId === 'en')?.name ||
          '',
      );
      setArName(
        categoryToEdit.translations.find((t) => t.languageId === 'ar')?.name ||
          '',
      );
      setIsActive(categoryToEdit.isActive);
      // Set the image if it exists (you may need to fetch the image URL from the API)
    }

    if (categoryToEdit?.image) {
      setImage(categoryToEdit?.image);
    }
  }, [categoryToEdit]);

  // Handle image upload
  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        Swal.fire("Error!", "Please upload an image file", "error");
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
    if (categoryToEdit) {
      setEnName(categoryToEdit.translations.find((t) => t.languageId === "en")?.name || "");
      setArName(categoryToEdit.translations.find((t) => t.languageId === "ar")?.name || "");
      if (categoryToEdit.imageKey) {
        setImage(categoryToEdit.imageKey);
      } else {
        setImage(null);
      }
    } else {
      navigate("/admin/categories");
    }
  };

  // Handle form submission
  const handleSend = async () => {
    if (!enName || !arName) {
      Swal.fire('Error!', 'Please fill all required fields.', 'error');
      return;
    }

    try {
      let imageKey = categoryToEdit?.imageKey; // Use existing image key by default

      // Upload new image if it exists
      if (image && typeof image !== 'string') {
        const formData = new FormData();
        formData.append('file', image);

        const uploadResponse = await addFile(formData).unwrap();

        if (
          uploadResponse.success &&
          uploadResponse.data.uploadedFiles.length > 0
        ) {
          imageKey = uploadResponse.data.uploadedFiles[0].url;
        }
      }

      // Prepare the payload
      const payload = {
        image: imageKey,
        isActive: isActive,
        translations: [
          { languageId: 'en', name: enName },
          { languageId: 'ar', name: arName },
        ],
        // categoryType: selectedCategoryType,
      };

      // Call the update category API
      const response = await updateCategory({ id, category: payload }).unwrap();

      Swal.fire('Success!', 'Category updated successfully.', 'success');
      navigate('/admin/categories');
    } catch (error) {
      console.error('Failed to update category:', error);
      Swal.fire(
        'Error!',
        error.message || 'Failed to update category.',
        'error',
      );
    }
  };
  // Convert image file to base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
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
          >
            Edit Category
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            Back
          </Button>
        </div>
        <form dir="rtl">
          {/* English Name Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Category En-Name
              <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="text"
              id="en_name"
              placeholder="Enter Category En-Name"
              value={enName}
              onChange={(e) => setEnName(e.target.value)}
              required
              mt={'8px'}
              bg={inputBg}
            />
          </div>

          {/* Arabic Name Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Category Ar-Name
              <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="text"
              id="ar_name"
              placeholder="Enter Category Ar-Name"
              value={arName}
              onChange={(e) => setArName(e.target.value)}
              required
              mt={'8px'}
              bg={inputBg}
            />
          </div>

          {/* Category Type Dropdown */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Category Image
              <span className="text-danger mx-1">*</span>
            </Text>
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
                  src={
                    typeof image === 'string'
                      ? image
                      : URL.createObjectURL(image)
                  }
                  alt="Category"
                  maxH="200px"
                  mb={2}
                  borderRadius="md"
                />
                <Button
                  variant="outline"
                  colorScheme="red"
                  size="sm"
                  onClick={() => {
                    setImage(null);
                    if (categoryToEdit?.imageKey) {
                      setImage(
                        `https://ideacentererp.s3.eu-north-1.amazonaws.com/${categoryToEdit.imageKey}`,
                      );
                    }
                  }}
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

          {/* Active Status Toggle */}
          <Box mt="20px" mb="20px">
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="isActive" mb="0">
                Active Status
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

          {/* Action Buttons */}
          <Flex justify="center" mt={4}>
            <Button
              variant="outline"
              colorScheme="red"
              onClick={handleCancel}
              mr={2}
            >
              Cancel
            </Button>
            <Button
              variant="darkBrand"
              color="white"
              fontSize="sm"
              fontWeight="500"
              borderRadius="70px"
              px="24px"
              py="5px"
              onClick={handleSend}
              isLoading={isLoading}
            >
              Save Changes
            </Button>
          </Flex>
        </form>
      </Box>
    </div>
  );
};

export default EditCategory;

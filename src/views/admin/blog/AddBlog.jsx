import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Input,
  Textarea,
  Text,
  useColorModeValue,
  Icon,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { FaUpload } from "react-icons/fa6";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { useAddBlogMutation } from "api/blogSlice";
import { useGetTagsQuery } from "api/tagSlice";
import Swal from "sweetalert2";

const AddBlog = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageKey: "",
    isActive: true,
    tagIds: [],
    translations: [
      {
        languageId: "ar",
        title: "",
        description: "",
      },
    ],
  });

  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const navigate = useNavigate();
  const toast = useToast();

  // API hooks
  const [addBlog] = useAddBlogMutation();
  const { data: tagsData, isLoading: isTagsLoading } = useGetTagsQuery({limit:100000,page:1});

  // Transform tags data for react-select
  const tagOptions = tagsData?.data?.map((tag) => ({
    value: tag.id,
    label: tag.name,
  })) || [];

  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      const uploadedFile = files[0];
      setImage(uploadedFile);
      setFormData(prev => ({
        ...prev,
        imageKey: uploadedFile.name,
      }));
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTranslationChange = (languageId, field, value) => {
    setFormData(prev => ({
      ...prev,
      translations: prev.translations.map(translation => 
        translation.languageId === languageId 
          ? { ...translation, [field]: value } 
          : translation
      ),
    }));
  };

  const handleTagChange = (selectedOptions) => {
    setFormData(prev => ({
      ...prev,
      tagIds: selectedOptions.map(option => option.value),
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // First upload the image if it exists
      let imageUrl = "";
      if (image) {
        // You'll need to implement this function to upload the image
        // and return the URL or key
        imageUrl = await uploadImageAndGetUrl(image);
      }

      // Prepare the payload as raw JSON
      const payload = {
        title: formData.title,
        description: formData.description,
        imageKey: imageUrl || formData.imageKey,
        isActive: formData.isActive,
        tagIds: formData.tagIds,
        translations: formData.translations,
      };

      // Send the request
      const response = await addBlog(payload).unwrap();

      Swal.fire({
        title: 'Success!',
        text: 'Blog created successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        navigate('/admin/undefined/blogs');
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to create blog',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mock function - replace with your actual image upload implementation
  const uploadImageAndGetUrl = async (imageFile) => {
    // In a real implementation, you would:
    // 1. Upload the image to your server or cloud storage
    // 2. Get back the URL or key
    // 3. Return that value
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`uploaded_${Date.now()}_${imageFile.name}`);
      }, 1000);
    });
  };


  return (
    <Box w="100%" className="container add-admin-container">
      <Box bg="white" className="add-admin-card shadow p-4 w-100">
        <Flex justify="space-between" align="center" mb={6}>
          <Text color={textColor} fontSize="22px" fontWeight="700">
            Add New Blog
          </Text>
          <Button
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            Back
          </Button>
        </Flex>

        <form>
          {/* English Title and Description */}
          <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={4}>
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb={2}>
                English Title <span className="text-danger">*</span>
              </Text>
              <Input
                name="title"
                placeholder="Enter English Title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Box>
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb={2}>
                Arabic Title <span className="text-danger">*</span>
              </Text>
              <Input
                placeholder="ادخل العنوان"
                value={formData.translations[0].title}
                onChange={(e) => handleTranslationChange('ar', 'title', e.target.value)}
                dir="rtl"
                required
              />
            </Box>
          </Grid>

          {/* Arabic Title and Description */}
          <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={4}>
          <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb={2}>
                English Description <span className="text-danger">*</span>
              </Text>
              <Textarea
                name="description"
                placeholder="Enter English Description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Box>
           
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb={2}>
                Arabic Description <span className="text-danger">*</span>
              </Text>
              <Textarea
                placeholder="ادخل الوصف"
                value={formData.translations[0].description}
                onChange={(e) => handleTranslationChange('ar', 'description', e.target.value)}
                dir="rtl"
                required
              />
            </Box>
          </Grid>

          {/* Tags Selection */}
          <Box mb={4}>
            <Text color={textColor} fontSize="sm" fontWeight="700" mb={2}>
              Tags <span className="text-danger">*</span>
            </Text>
            {isTagsLoading ? (
              <Spinner size="sm" />
            ) : (
              <Select
                options={tagOptions}
                isMulti
                onChange={handleTagChange}
                placeholder="Select tags..."
                className="basic-multi-select"
                classNamePrefix="select"
              />
            )}
          </Box>

          {/* Image Upload */}
          <Box
            border="1px dashed"
            borderColor="gray.300"
            borderRadius="md"
            p={4}
            textAlign="center"
            backgroundColor="gray.100"
            cursor="pointer"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            mb={4}
          >
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
            {image && (
              <Box mt={4} display="flex" justifyContent="center" alignItems="center">
                <img
                  src={URL.createObjectURL(image)}
                  alt={image.name}
                  width={80}
                  height={80}
                  borderRadius="md"
                />
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <Flex justify="center" mt={6} gap={4}>
            <Button variant="outline" colorScheme="red" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isLoading}
              loadingText="Submitting..."
            >
              Create Blog
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default AddBlog;
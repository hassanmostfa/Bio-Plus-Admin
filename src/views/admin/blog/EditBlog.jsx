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
  Badge,
  IconButton,
  Image,
} from "@chakra-ui/react";
import { FaUpload, FaTrash } from "react-icons/fa6";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { useGetBlogQuery, useUpdateBlogMutation } from "api/blogSlice";
import { useGetTagsQuery } from "api/tagSlice";
import Swal from "sweetalert2";

const EditBlog = () => {
  const { id } = useParams();
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
  const [existingImage, setExistingImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const navigate = useNavigate();
  const toast = useToast();

  // API hooks
  const { data: blogResponse, isLoading: isBlogLoading } = useGetBlogQuery(id);
  const blogData = blogResponse?.data || {};
  const [updateBlog] = useUpdateBlogMutation();
  const { data: tagsResponse, isLoading: isTagsLoading } = useGetTagsQuery({ limit: 100000, page: 1 });
  const tagsData = tagsResponse?.data || [];

  // Initialize form with existing blog data
  useEffect(() => {
    if (blogData) {
      // Extract tag IDs from the blog's tags array
      const blogTagIds = blogData.tags?.map(tag => tag.tagId) || [];
      
      setFormData({
        title: blogData.title || "",
        description: blogData.description || "",
        imageKey: blogData.imageKey || "",
        isActive: blogData.isActive || true,
        tagIds: blogTagIds,
        translations: blogData.translations || [
          {
            languageId: "ar",
            title: "",
            description: "",
          },
        ],
      });

      if (blogData.imageKey) {
        setExistingImage({
          name: blogData.imageKey,
          url: `${process.env.REACT_APP_API_URL}/uploads/${blogData.imageKey}`
        });
      }
    }
  }, [blogData]);

  // Transform tags data for react-select
  const tagOptions = tagsData.map((tag) => ({
    value: tag.id,
    label: tag.name,
  }));

  // Get currently selected tags based on formData.tagIds
  const selectedTagOptions = tagOptions.filter(option => 
    formData.tagIds.includes(option.value)
  );

  // Rest of your component code remains the same...
  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      const uploadedFile = files[0];
      setImage(uploadedFile);
      setFormData(prev => ({
        ...prev,
        imageKey: uploadedFile.name,
      }));
      setExistingImage(null);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setExistingImage(null);
    setFormData(prev => ({ ...prev, imageKey: '' }));
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
      
      // Prepare the payload as raw JSON
      const payload = {
        ...formData,
      };

      // Send the update request
      const response = await updateBlog({id,data:payload}).unwrap();

      Swal.fire({
        title: 'Success!',
        text: 'Blog updated successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        navigate('/admin/undefined/blogs');
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to update blog',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isBlogLoading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box w="100%" className="container add-admin-container">
      <Box bg="white" className="add-admin-card shadow p-4 w-100">
        <Flex justify="space-between" align="center" mb={6}>
          <Text color={textColor} fontSize="22px" fontWeight="700">
            Edit Blog
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
          {/* English Title and Arabic Title */}
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
                value={formData.translations[0]?.title || ''}
                onChange={(e) => handleTranslationChange('ar', 'title', e.target.value)}
                dir="rtl"
                required
              />
            </Box>
          </Grid>

          {/* English Description and Arabic Description */}
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
                value={formData.translations[0]?.description || ''}
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
                value={selectedTagOptions}
                onChange={handleTagChange}
                placeholder="Select tags..."
                className="basic-multi-select"
                classNamePrefix="select"
              />
            )}
          </Box>

          {/* Status Toggle */}
          <Box mb={4}>
            <Text color={textColor} fontSize="sm" fontWeight="700" mb={2}>
              Status
            </Text>
            <Badge
              colorScheme={formData.isActive ? 'green' : 'red'}
              fontSize="sm"
              p={2}
              borderRadius="md"
              cursor="pointer"
              onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
            >
              {formData.isActive ? 'Active' : 'Inactive'}
            </Badge>
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
            
            {(image || existingImage) && (
              <Box mt={4} position="relative">
                <Image
                  src={image ? URL.createObjectURL(image) : existingImage.url}
                  alt={image ? image.name : existingImage.name}
                  maxH="200px"
                  objectFit="contain"
                  mx="auto"
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
              loadingText="Updating..."
            >
              Update Blog
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default EditBlog;
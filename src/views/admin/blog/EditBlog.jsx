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
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { FaUpload, FaTrash } from "react-icons/fa6";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { useGetBlogQuery, useUpdateBlogMutation } from "api/blogSlice";
import { useGetTagsQuery } from "api/tagSlice";
import { useAddFileMutation } from "api/filesSlice";
import Swal from "sweetalert2";

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // State management
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
  const [imagePreview, setImagePreview] = useState("");
  const [existingImage, setExistingImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const textColor = useColorModeValue("secondaryGray.900", "white");

  // API hooks
  const { data: blogResponse, isLoading: isBlogLoading } = useGetBlogQuery(id);
  const [updateBlog] = useUpdateBlogMutation();
  const { data: tagsResponse, isLoading: isTagsLoading } = useGetTagsQuery({
    limit: 100000,
    page: 1,
  });
  const [addFile] = useAddFileMutation();

  // Transform tags data for react-select
  const tagOptions = tagsResponse?.data?.map((tag) => ({
    value: tag.id,
    label: tag.name,
  })) || [];

  // Get currently selected tags
  const selectedTagOptions = tagOptions.filter((option) =>
    formData.tagIds.includes(option.value)
  );

  // Initialize form with existing blog data
  useEffect(() => {
    if (blogResponse?.data) {
      const blogData = blogResponse.data;
      const blogTagIds = blogData.tags?.map((tag) => tag.tagId) || [];

      setFormData({
        title: blogData.title || "",
        description: blogData.description || "",
        imageKey: blogData.imageKey || "",
        isActive: blogData.isActive ?? true,
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
          url: blogData.imageKey,
        });
      }
    }
  }, [blogResponse]);

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
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Validate file size (e.g., 5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          status: "error",
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
    setImagePreview("");
    setFormData((prev) => ({ ...prev, imageKey: "" }));
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

  const handleTranslationChange = (languageId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      translations: prev.translations.map((translation) =>
        translation.languageId === languageId
          ? { ...translation, [field]: value }
          : translation
      ),
    }));
  };

  const handleTagChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: selectedOptions.map((option) => option.value),
    }));
  };

  const handleCancel = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will lose all unsaved changes",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, discard changes",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/admin/undefined/blogs");
      }
    });
  };

  const handleSubmit = async () => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.translations[0].title ||
      !formData.translations[0].description ||
      formData.tagIds.length === 0
    ) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);

      let imageUrl = existingImage?.url || "";

      // Upload new image if one was selected
      if (image) {
        const formData = new FormData();
        formData.append("file", image);

        const uploadResponse = await addFile(formData).unwrap();

        if (
          !uploadResponse.success ||
          !uploadResponse.data.uploadedFiles[0]?.url
        ) {
          throw new Error("Failed to upload image");
        }

        imageUrl = uploadResponse.data.uploadedFiles[0].url;
      }

      // Prepare the update payload
      const payload = {
        title: formData.title,
        description: formData.description,
        imageKey: imageUrl,
        isActive: formData.isActive,
        tagIds: formData.tagIds,
        translations: formData.translations,
      };

      // Remove any undefined/null values
      Object.keys(payload).forEach((key) => {
        if (payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await updateBlog({ id, data: payload }).unwrap();

      toast({
        title: "Success",
        description: "Blog updated successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      navigate("/admin/undefined/blogs");
    } catch (error) {
      console.error("Failed to update blog:", error);
      toast({
        title: "Error",
        description: error.data?.message || "Failed to update blog",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isBlogLoading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
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
            onClick={handleCancel}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            Back
          </Button>
        </Flex>

        <form>
          {/* Title Section */}
          <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={4}>
            <FormControl isRequired>
              <FormLabel>English Title</FormLabel>
              <Input
                name="title"
                placeholder="Enter English Title"
                value={formData.title}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Arabic Title</FormLabel>
              <Input
                placeholder="ادخل العنوان"
                value={formData.translations[0].title}
                onChange={(e) =>
                  handleTranslationChange("ar", "title", e.target.value)
                }
                dir="rtl"
              />
            </FormControl>
          </Grid>

          {/* Description Section */}
          <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={4}>
            <FormControl isRequired>
              <FormLabel>English Description</FormLabel>
              <Textarea
                name="description"
                placeholder="Enter English Description"
                value={formData.description}
                onChange={handleChange}
                minH="150px"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Arabic Description</FormLabel>
              <Textarea
                placeholder="ادخل الوصف"
                value={formData.translations[0].description}
                onChange={(e) =>
                  handleTranslationChange("ar", "description", e.target.value)
                }
                dir="rtl"
                minH="150px"
              />
            </FormControl>
          </Grid>

          {/* Tags Selection */}
          <FormControl isRequired mb={4}>
            <FormLabel>Tags</FormLabel>
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
          </FormControl>

          {/* Status Toggle */}
          <FormControl mb={4}>
            <FormLabel>Status</FormLabel>
            <Badge
              colorScheme={formData.isActive ? "green" : "red"}
              fontSize="sm"
              p={2}
              borderRadius="md"
              cursor="pointer"
              onClick={() =>
                setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
              }
            >
              {formData.isActive ? "Active" : "Inactive"}
            </Badge>
          </FormControl>

          {/* Image Upload */}
          <FormControl>
            <FormLabel>Featured Image</FormLabel>
            <Box
              border="1px dashed"
              borderColor={isDragging ? "blue.500" : "gray.200"}
              borderRadius="md"
              p={4}
              textAlign="center"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              cursor="pointer"
              bg={isDragging ? "blue.50" : "gray.50"}
              mb={4}
            >
              <Icon as={FaUpload} w={8} h={8} color="blue.500" mb={2} />
              <Text>Drag & drop image here or</Text>
              <Button
                variant="link"
                color="blue.500"
                onClick={() => document.getElementById("fileInput").click()}
              >
                Browse Files
              </Button>
              <Input
                id="fileInput"
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileInputChange}
              />
            </Box>
          </FormControl>

          {(imagePreview || existingImage) && (
            <Box position="relative" display="inline-block" mb={4}>
              <Image
                src={imagePreview || existingImage.url}
                alt="Blog preview"
                borderRadius="md"
                maxH="200px"
                objectFit="contain"
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
            <Button variant="outline" colorScheme="red" onClick={handleCancel}>
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
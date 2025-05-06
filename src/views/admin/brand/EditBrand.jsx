import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
  Icon,
  Image,
  Badge,
  IconButton,
  useToast,
  FormControl,
  FormLabel,
  Spinner,
} from "@chakra-ui/react";
import { FaUpload, FaTrash } from "react-icons/fa6";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { useGetBrandQuery, useUpdateBrandMutation } from "api/brandSlice";
import Swal from "sweetalert2";
import { useAddFileMutation } from "api/filesSlice";

const EditBrand = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // API hooks
  const { data: brandResponse, isLoading: isFetching } = useGetBrandQuery(id);
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();
  const [addFile] = useAddFileMutation();

  // State management
  const [enName, setEnName] = useState("");
  const [arName, setArName] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [existingImage, setExistingImage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const textColor = useColorModeValue("secondaryGray.900", "white");

  // Initialize form with existing data
  useEffect(() => {
    if (brandResponse?.data) {
      setEnName(brandResponse.data.name);
      setArName(brandResponse.data.translations?.find(t => t.languageId === "ar")?.name || "");
      setExistingImage(brandResponse.data.imageKey || "");
    }
  }, [brandResponse]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Image handling functions
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

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImage(null);
    setImagePreview("");
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
        navigate("/admin/brands");
      }
    });
  };

  const handleSubmit = async () => {
    if (!enName || !arName) {
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
      let imageUrl = existingImage;
      
      // Upload new image if one was selected
      if (image) {
        const formData = new FormData();
        formData.append('file', image);

        const uploadResponse = await addFile(formData).unwrap();
        
        if (!uploadResponse.success || !uploadResponse.data.uploadedFiles[0]?.url) {
          throw new Error('Failed to upload image');
        }

        imageUrl = uploadResponse.data.uploadedFiles[0].url;
      }

      // Prepare the update payload
      const payload = {
        name: enName,
        imageKey: imageUrl,
        isActive: true,
        translations: [
          { languageId: "ar", name: arName },
        ],
      };

      // Remove undefined/null values
      Object.keys(payload).forEach(key => {
        if (payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await updateBrand({ id, brand: payload }).unwrap();

      toast({
        title: "Success",
        description: "Brand updated successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      navigate("/admin/brands");
    } catch (error) {
      console.error("Failed to update brand:", error);
      toast({
        title: "Error",
        description: error.data?.message || "Failed to update brand",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isFetching) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!brandResponse?.data) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Text>Brand not found</Text>
      </Flex>
    );
  }

  return (
    <div className="container add-admin-container w-100">
      <div className="add-admin-card shadow p-4 bg-white w-100">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            mb="20px !important"
            lineHeight="100%"
          >
            Edit Brand
          </Text>
          <Button
            type="button"
            onClick={handleCancel}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            Back
          </Button>
        </div>
        <form>
          {/* English Name Field */}
          <Box mb={4}>
            <FormControl isRequired>
              <FormLabel>Brand Name (English)</FormLabel>
              <Input
                placeholder="Enter Brand Name in English"
                value={enName}
                onChange={(e) => setEnName(e.target.value)}
              />
            </FormControl>
          </Box>

          {/* Arabic Name Field */}
          <Box mb={4}>
            <FormControl isRequired>
              <FormLabel>Brand Name (Arabic)</FormLabel>
              <Input
                placeholder="أدخل اسم العلامة التجارية"
                value={arName}
                onChange={(e) => setArName(e.target.value)}
                dir="rtl"
              />
            </FormControl>
          </Box>

          {/* Image Upload Section */}
          <Box mb={4}>
            <FormControl>
              <FormLabel>Brand Logo</FormLabel>
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
              >
                <Icon as={FaUpload} w={8} h={8} color="blue.500" mb={2} />
                <Text>Drag & drop logo here or</Text>
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
                  accept="image/*"
                  onChange={handleFileInputChange}
                  display="none"
                />
              </Box>
            </FormControl>

            {(imagePreview || existingImage) && (
              <Box mt={4} position="relative" display="inline-block">
                <Image
                  src={imagePreview || existingImage}
                  alt="Brand logo preview"
                  borderRadius="md"
                  boxSize="150px"
                  objectFit="contain"
                />
                {imagePreview && (
                  <IconButton
                    icon={<FaTrash />}
                    aria-label="Remove image"
                    size="sm"
                    colorScheme="red"
                    position="absolute"
                    top={2}
                    right={2}
                    onClick={handleRemoveImage}
                  />
                )}
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <Flex justify="flex-end" mt={4}>
            <Button
              variant="outline"
              colorScheme="red"
              onClick={handleCancel}
              mr={4}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isUpdating}
              loadingText="Saving..."
            >
              Save Changes
            </Button>
          </Flex>
        </form>
      </div>
    </div>
  );
};

export default EditBrand;
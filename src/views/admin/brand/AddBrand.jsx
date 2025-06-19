import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { FaUpload, FaTrash } from "react-icons/fa6";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useAddBrandMutation } from "api/brandSlice";
import Swal from "sweetalert2";
import { useAddFileMutation } from "api/filesSlice";

const AddBrand = () => {
  const [enName, setEnName] = useState("");
  const [arName, setArName] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [addBrand, { isLoading }] = useAddBrandMutation();
  const toast = useToast();
  const navigate = useNavigate();
  const [addFile] = useAddFileMutation();

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const borderColorDefault = useColorModeValue('gray.200', 'gray.600');
  const bgDrag = useColorModeValue('brand.50', 'navy.800');

  // Handle image upload with validation
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

  // Clean up object URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

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
        handleRemoveImage();
        setEnName("");
        setArName("");
        navigate("/admin/brands");
      }
    });
  };

  const handleSend = async () => {
    if (!enName || !arName || !image) {
      Swal.fire("Error!", "Please fill all required fields.", "error");
      return;
    }

    try {
      // First upload the image
      const formData = new FormData();
      formData.append('file', image);

      const uploadResponse = await addFile(formData).unwrap();
      
      if (!uploadResponse.success || !uploadResponse.data.uploadedFiles[0]?.url) {
        throw new Error('Failed to upload image');
      }

      const imageUrl = uploadResponse.data.uploadedFiles[0].url;

      // Then create the brand with the image URL
      const payload = {
        name: enName,
        imageKey: imageUrl,
        isActive: true,
        translations: [
          { languageId: "ar", name: arName },
        ],
      };

      const response = await addBrand(payload).unwrap();

      toast({
        title: "Success",
        description: "Brand added successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      navigate("/admin/brands");
    } catch (error) {
      console.error("Failed to add brand:", error);
      toast({
        title: "Error",
        description: error.data?.message || "Failed to add brand",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box className="container add-admin-container w-100">
      <Box bg={cardBg} className="add-admin-card shadow p-4 w-100" borderRadius="lg">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            mb="20px !important"
            lineHeight="100%"
          >
            Add New Brand
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
                color={textColor}
                bg={inputBg}
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
                color={textColor}
                bg={inputBg}
              />
            </FormControl>
          </Box>

          {/* Image Upload Section */}
          <Box mb={4}>
            <FormControl isRequired>
              <FormLabel>Brand Logo</FormLabel>
              <Box
                border="1px dashed"
                borderColor={isDragging ? 'brand.500' : borderColorDefault}
                borderRadius="md"
                p={4}
                textAlign="center"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                cursor="pointer"
                bg={isDragging ? bgDrag : inputBg}
              >
                <Icon as={FaUpload} w={8} h={8} color="blue.500" mb={2} />
                <Text color={textColor}>Drag & drop logo here or</Text>
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

            {imagePreview && (
              <Box mt={4} position="relative" display="inline-block">
                <Image
                  src={imagePreview}
                  alt="Brand logo preview"
                  borderRadius="md"
                  boxSize="150px"
                  objectFit="contain"
                />
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
              onClick={handleSend}
              isLoading={isLoading}
              loadingText="Saving..."
            >
              Save Brand
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default AddBrand;
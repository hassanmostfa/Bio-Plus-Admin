import React, { useState } from "react";
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
  Textarea,
  Image,
} from "@chakra-ui/react";
import { FaUpload } from "react-icons/fa6";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useAddBannerMutation } from "api/bannerSlice";
import Swal from "sweetalert2";


const AddBanner = () => {
  const [formData, setFormData] = useState({
    title: "",
    arTitle: "",
    link: "",
    linkType: "PHARMACY",
    linkId: "",
    order: 1,
    isActive: true,
  });
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const navigate = useNavigate();
  const toast = useToast();
  const [createBanner] = useAddBannerMutation();

  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      setImage(files[0]);
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
      [name]: value
    }));
  };

  const handleSwitchChange = (e) => {
    setFormData(prev => ({
      ...prev,
      isActive: e.target.checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!image) {
      toast({
        title: "Error",
        description: "Please upload an image",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    try {
      // Prepare the data in the required format
      const bannerData = {
        title: formData.title,
        imageKey: image.name,
        link: formData.link,
        linkType: formData.linkType,
        linkId: formData.linkId,
        order: parseInt(formData.order),
        isActive: formData.isActive,
        translations: [
          {
            languageId: "ar",
            title: formData.arTitle
          }
        ]
      };

      // Create FormData for file upload
      // const formDataToSend = new FormData();
      // formDataToSend.append("image", image);
      // formDataToSend.append("data", JSON.stringify(bannerData));

      // Call the API
      await createBanner(bannerData).unwrap();

      Swal.fire('Created!', 'The Banner has been Created.', 'success');
      navigate("/admin/undefined/cms/banners");
    } catch (error) {
      Swal.fire('Error!', error.message || 'Failed to Create Banner', 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
            Add New Banner
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

        <form onSubmit={handleSubmit}>
          {/* Title Field */}
          <FormControl mb={4}>
            <FormLabel color={textColor} fontSize="sm" fontWeight="700">
              English Title <span style={{ color: "red" }}>*</span>
            </FormLabel>
            <Input
              name="title"
              placeholder="Enter Banner Title (English)"
              value={formData.title}
              onChange={handleChange}
              required
              mt="8px"
            />
          </FormControl>

          {/* Arabic Title Field */}
          <FormControl mb={4}>
            <FormLabel color={textColor} fontSize="sm" fontWeight="700">
              Arabic Title <span style={{ color: "red" }}>*</span>
            </FormLabel>
            <Input
              name="arTitle"
              placeholder="Enter Banner Title (Arabic)"
              value={formData.arTitle}
              onChange={handleChange}
              required
              mt="8px"
              dir="rtl"
            />
          </FormControl>

          {/* Link Type */}
          <FormControl mb={4}>
            <FormLabel color={textColor} fontSize="sm" fontWeight="700">
              Link Type <span style={{ color: "red" }}>*</span>
            </FormLabel>
            <Select
              name="linkType"
              value={formData.linkType}
              onChange={handleChange}
              required
              mt="8px"
            >
              <option value="PHARMACY">Pharmacy</option>
              <option value="PRODUCT">Product</option>
              <option value="DOCTOR">Doctor</option>
              <option value="EXTERNAL">External Link</option>
            </Select>
          </FormControl>

          {/* Link */}
          <FormControl mb={4}>
            <FormLabel color={textColor} fontSize="sm" fontWeight="700">
              Link <span style={{ color: "red" }}>*</span>
            </FormLabel>
            <Input
              name="link"
              placeholder="Enter Link URL"
              value={formData.link}
              onChange={handleChange}
              required
              mt="8px"
            />
          </FormControl>

          {/* Link ID */}
          <FormControl mb={4}>
            <FormLabel color={textColor} fontSize="sm" fontWeight="700">
              Link ID (for internal links)
            </FormLabel>
            <Input
              name="linkId"
              placeholder="Enter Link ID (if applicable)"
              value={formData.linkId}
              onChange={handleChange}
              mt="8px"
            />
          </FormControl>

          {/* Order */}
          <FormControl mb={4}>
            <FormLabel color={textColor} fontSize="sm" fontWeight="700">
              Display Order
            </FormLabel>
            <Input
              name="order"
              type="number"
              placeholder="Enter display order"
              value={formData.order}
              onChange={handleChange}
              min="1"
              mt="8px"
            />
          </FormControl>

          {/* Status */}
          <FormControl mb={4} display="flex" alignItems="center">
            <FormLabel color={textColor} fontSize="sm" fontWeight="700" mb="0">
              Active Status
            </FormLabel>
            <Switch
              name="isActive"
              isChecked={formData.isActive}
              onChange={handleSwitchChange}
              colorScheme="green"
              ml={2}
            />
          </FormControl>

          {/* Image Upload */}
          <FormControl mb={4}>
            <FormLabel color={textColor} fontSize="sm" fontWeight="700">
              Banner Image <span style={{ color: "red" }}>*</span>
            </FormLabel>
            <Box
              border="1px dashed"
              borderColor={isDragging ? "blue.500" : "gray.300"}
              borderRadius="md"
              p={4}
              textAlign="center"
              backgroundColor={isDragging ? "blue.50" : "gray.50"}
              cursor="pointer"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <Icon as={FaUpload} w={8} h={8} color="#422afb" mb={2} />
              <Text color="gray.500" mb={2}>
                Drag & Drop Image Here or Click to Browse
              </Text>
              <Text color="gray.400" fontSize="sm">
                Recommended size: 1200x400px
              </Text>
              <input
                type="file"
                id="fileInput"
                hidden
                accept="image/*"
                onChange={handleFileInputChange}
              />
              {image && (
                <Box mt={4}>
                  <Text fontSize="sm" color="green.500" mb={2}>
                    Selected: {image.name}
                  </Text>
                  <Image
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    maxH="150px"
                    mx="auto"
                    borderRadius="md"
                  />
                </Box>
              )}
            </Box>
          </FormControl>

          {/* Action Buttons */}
          <Flex justify="center" mt={6} gap={4}>
            <Button
              variant="outline"
              colorScheme="red"
              onClick={() => navigate(-1)}
              isDisabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isLoading}
              loadingText="Creating..."
            >
              Save Banner
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default AddBanner;
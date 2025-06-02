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
  Image,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import { FaUpload, FaTrash } from "react-icons/fa6";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useAddBannerMutation } from "api/bannerSlice";
import { useAddFileMutation } from "api/filesSlice";
import Swal from "sweetalert2";
import { useGetPharmaciesQuery } from "../../../api/pharmacySlice";
import { useGetProductsQuery } from "../../../api/productSlice";
import { useGetDoctorsQuery } from "../../../api/doctorSlice";

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
  const [imagePreview, setImagePreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const navigate = useNavigate();
  const toast = useToast();
  const [createBanner] = useAddBannerMutation();
  const [addFile] = useAddFileMutation();

  // Fetch data for dropdowns
  const { data: pharmaciesData, isLoading: isPharmaciesLoading } = useGetPharmaciesQuery({});
  
  const { data: productsData, isLoading: isProductsLoading } = useGetProductsQuery({});
  const { data: doctorsData, isLoading: isDoctorsLoading } = useGetDoctorsQuery({});

  const pharmacies = pharmaciesData?.data?.items || [];
  const products = productsData?.data || []; // Assuming products are nested under 'products' in the response
  const doctors = doctorsData?.data || []; // Assuming doctors are nested under 'doctors' in the response

  // Clean up object URLs when component unmounts
  React.useEffect(() => {
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
    setImagePreview("");
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
        navigate("/admin/undefined/cms/banners");
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

    if (!image) {
      toast({
        title: "Error",
        description: "Please upload an image",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      // First upload the image
      const formDataToSend = new FormData();
      formDataToSend.append("file", image);

      const uploadResponse = await addFile(formDataToSend).unwrap();
      
      if (!uploadResponse.success || !uploadResponse.data.uploadedFiles[0]?.url) {
        throw new Error('Failed to upload image');
      }

      const imageUrl = uploadResponse.data.uploadedFiles[0].url;

      // Then create the banner with the image URL
      const bannerData = {
        title: formData.title,
        imageKey: imageUrl,
        linkType: formData.linkType,
        order: parseInt(formData.order),
        isActive: formData.isActive,
        translations: [
          {
            languageId: "ar",
            title: formData.arTitle
          }
        ]
      };

      // Set link and linkId based on linkType
      if (formData.linkType === "EXTERNAL") {
        bannerData.link = formData.link;
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
        bannerData.link = `${linkPath}${formData.linkId}`;
        bannerData.linkId = formData.linkId; // Ensure linkId is sent for internal types
      }

      // Remove null values
      Object.keys(bannerData).forEach(key => {
        if (bannerData[key] === null || bannerData[key] === undefined) {
          delete bannerData[key];
        }
      });

      await createBanner(bannerData).unwrap();

      toast({
        title: "Success",
        description: "Banner created successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      navigate("/admin/undefined/cms/banners");
    } catch (error) {
      console.error("Failed to create banner:", error);
      toast({
        title: "Error",
        description: error.data?.message || "Failed to create banner",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
          <FormControl mb={4} isRequired>
            <FormLabel>Banner Image</FormLabel>
            <Box
              border="1px dashed"
              borderColor={isDragging ? "blue.500" : "gray.200"}
              borderRadius="md"
              p={4}
              textAlign="center"
              bg={isDragging ? "blue.50" : "gray.50"}
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

          {imagePreview && (
            <Box position="relative" mb={4}>
              <Image
                src={imagePreview}
                alt="Banner preview"
                maxH="200px"
                mx="auto"
                borderRadius="md"
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
import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
  Icon,
  useToast,
  Select,
  Switch,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import "./ad.css";
import { FaUpload } from "react-icons/fa6";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useAddAdMutation } from "api/adsSlice";
import { useAddFileMutation } from "api/filesSlice";
import Swal from 'sweetalert2';


const AddAd = () => {
  const [addAd] = useAddAdMutation();
  const [addFile] = useAddFileMutation();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [linkType, setLinkType] = useState("EXTERNAL");
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(1);
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const navigate = useNavigate();
  const toast = useToast();

  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setImage(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
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

  const handleReset = () => {
    setTitle("");
    setLink("");
    setLinkType("EXTERNAL");
    setIsActive(true);
    setOrder(1);
    setImage(null);
  };

  const handleSubmit = async () => {
    if (!title || !link || !image) {
      toast({
        title: "Missing required fields",
        description: "Please fill all required fields and upload an image",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First upload the image
      const formDataToSend = new FormData();
      formDataToSend.append("file", image);

      const uploadResponse = await addFile(formDataToSend).unwrap();
      
      if (!uploadResponse.success || !uploadResponse.data.uploadedFiles[0]?.url) {
        throw new Error('Failed to upload image');
      }

      const imageKey = uploadResponse.data.uploadedFiles[0].url;
    

      // Then create the ad
      const adData = {
        title,
        imageKey,
        link,
        linkType,
        isActive,
        order: Number(order),
        translations: [] // Add translations if needed
      };

      const response = await addAd(adData).unwrap();

      if (response.success) {
        await Swal.fire({
          title: 'Success!',
          text: 'Ad created successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        navigate('/admin/undefined/cms/ads');
      } else {
        throw new Error(response.message || 'Failed to create ad');
      }
    } catch (error) {
      toast({
        title: "Error creating ad",
        description: error.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
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
            Add New Ad
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
        <form>
          {/* Title Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Title
              <span className="text-danger mx-1">*</span>
            </Text> 
            <Input
              type="text"
              id="title"
              placeholder="Enter Ad Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              mt="8px"
              color={textColor}
              bg={inputBg}
            />
          </div>

          {/* Link Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Link
              <span className="text-danger mx-1">*</span>
            </Text> 
            <Input
              type="url"
              id="link"
              placeholder="Enter Link URL"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
              mt="8px"
              color={textColor}
              bg={inputBg}
            />
          </div>

          {/* Link Type Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Link Type
              <span className="text-danger mx-1">*</span>
            </Text>
            <Select
              value={linkType}
              onChange={(e) => setLinkType(e.target.value)}
              mt="8px"
              color={textColor}
              bg={inputBg}
            >
              <option value="EXTERNAL">External</option>
              {/* <option value="PRODUCT">PRODUCT</option>
              <option value="PHARMACY">PHARMACY</option>
              <option value="DOCTOR">DOCTOR</option> */}
            </Select>
          </div>

          {/* Order Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Order
            </Text>
            <Input
              type="number"
              id="order"
              placeholder="Enter display order"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              min="1"
              mt="8px"
              color={textColor}
              bg={inputBg}
            />
          </div>

          {/* Active Status */}
          <FormControl display="flex" alignItems="center" mb={4}>
            <FormLabel htmlFor="is-active" mb="0">
              Active
            </FormLabel>
            <Switch
              id="is-active"
              isChecked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              colorScheme="green"
            />
          </FormControl>

          {/* Image Upload Section */}
          <Box
            border="1px dashed"
            borderColor={isDragging ? "brand.500" : borderColor}
            borderRadius="md"
            p={4}
            textAlign="center"
            backgroundColor={isDragging ? "brand.50" : inputBg}
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
              <Box
                mt={4}
                display={'flex'}
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
              >
                <img
                  src={URL.createObjectURL(image)}
                  alt={image.name}
                  width={150}
                  height={150}
                  style={{ borderRadius: "md", maxHeight: "150px" }}
                />
                <Text mt={2} fontSize="sm">
                  {image.name}
                </Text>
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <Flex justify="center" mt={4}>
            <Button 
              variant="outline" 
              colorScheme="red" 
              onClick={handleReset} 
              mr={2}
              isDisabled={isSubmitting}
            >
              Reset
            </Button>
            <Button
              variant='darkBrand'
              color='white'
              fontSize='sm'
              fontWeight='500'
              borderRadius='70px'
              px='24px'
              py='5px'
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Submitting..."
            >
              Save Ad
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default AddAd;
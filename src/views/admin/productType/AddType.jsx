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
} from "@chakra-ui/react";
import { FaUpload } from "react-icons/fa6";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useAddTypeMutation } from "api/typeSlice";
import { useAddFileMutation } from "api/filesSlice";
import Swal from "sweetalert2";
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const AddType = () => {
  const [enName, setEnName] = useState(""); // State for English name
  const [arName, setArName] = useState(""); // State for Arabic name
  const [image, setImage] = useState(null); // State for image file
  const [isDragging, setIsDragging] = useState(false); // State for drag-and-drop
  const [addType, { isLoading }] = useAddTypeMutation(); // Mutation hook for adding a product type
  const [addFile] = useAddFileMutation(); // Mutation hook for adding a file
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // Handle image upload
  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      // Validate file type if needed
      if (!selectedFile.type.startsWith('image/')) {
        Swal.fire('Error!', t('common.PleaseUploadImageFile'), 'error');
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

  // Handle form submission
  const handleSend = async () => {
    if (!enName || !arName || !image) {
      Swal.fire(t('addProductType.errorRequiredFields'));
      return;
    }

    try {
      // First upload the image
      const formData = new FormData();
      formData.append('file', image);

      const uploadResponse = await addFile(formData).unwrap();

      if (
        !uploadResponse.success ||
        uploadResponse.data.uploadedFiles.length === 0
      ) {
        throw new Error('Failed to upload image');
      }

      const imageKey = uploadResponse.data.uploadedFiles[0].url;

      // Prepare the payload
      const payload = {
        name: enName, // English name
        isActive: true, // Default to true
        imageKey: imageKey, // Add the image key
        translations: [
          { languageId: "ar", name: arName }, // Arabic translation
        ],
      };

      // Send data to the API
      const response = await addType(payload).unwrap();
      Swal.fire(t('addProductType.successAdd'));
      navigate("/admin/product-types"); // Redirect to the product types page
    } catch (error) {
      console.error("Failed to add product type:", error);
      Swal.fire(t('addProductType.errorAdd'));
    }
  };

  return (
    <Box className="container add-admin-container w-100" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <Box bg={cardBg} className="add-admin-card shadow p-4 w-100" borderRadius="lg">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            mb="20px !important"
            lineHeight="100%"
          >
            {t('addProductType.addNewProductType')}
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('addProductType.back')}
          </Button>
        </div>
        <form>
          {/* English Name Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('addProductType.productEnType')}
              <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="text"
              id="en_name"
              placeholder={t('addProductType.enterProductEnType')}
              value={enName}
              onChange={(e) => setEnName(e.target.value)}
              required
              mt={"8px"}
              color={textColor}
              bg={inputBg}
              dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Arabic Name Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('addProductType.productArType')}
              <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="text"
              id="ar_name"
              placeholder={t('addProductType.enterProductArType')}
              value={arName}
              onChange={(e) => setArName(e.target.value)}
              required
              mt={"8px"}
              color={textColor}
              bg={inputBg}
              dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Image Upload Section */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('addProductType.productTypeImage')}
              <span className="text-danger mx-1">*</span>
            </Text>
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
              mt={"8px"}
            >
              {image ? (
                <Flex direction="column" align="center">
                  <Image
                    src={URL.createObjectURL(image)}
                    alt="Product Type"
                    maxH="200px"
                    mb={2}
                    borderRadius="md"
                  />
                  <Button
                    variant="outline"
                    colorScheme="red"
                    size="sm"
                    onClick={() => setImage(null)}
                  >
                    {t('addProductType.removeImage')}
                  </Button>
                </Flex>
              ) : (
                <>
                  <Icon as={FaUpload} w={8} h={8} color="#422afb" mb={2} />
                  <Text color="gray.500" mb={2}>
                    {t('addProductType.dragDropImageHere')}
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
                    {t('addProductType.uploadImage')}
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
          </div>

          {/* Action Buttons */}
          <Flex justify="start" mt={4}>
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
              {t('addProductType.save')}
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default AddType;
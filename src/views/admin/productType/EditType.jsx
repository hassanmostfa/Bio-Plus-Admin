import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
  Switch,
  FormControl,
  FormLabel,
  Icon,
  Image,
} from "@chakra-ui/react";
import { FaUpload } from "react-icons/fa6";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { useGetTypeQuery, useUpdateTypeMutation } from "api/typeSlice";
import { useAddFileMutation } from "api/filesSlice";
import Swal from "sweetalert2";
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const EditType = () => {
  const { id } = useParams(); // Get the product type ID from the URL
  const { data: typeResponse, isLoading: isFetching, isError: fetchError , refetch } = useGetTypeQuery(id); // Fetch the product type data
  const [updateType, { isLoading: isUpdating }] = useUpdateTypeMutation(); // Mutation hook for updating a product type
  const [addFile] = useAddFileMutation(); // Mutation hook for adding a file
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // State for form fields
  const [enName, setEnName] = useState("");
  const [arName, setArName] = useState("");
  const [isActive, setIsActive] = useState(typeResponse?.data?.isActive ?? true);
  const [image, setImage] = useState(null); // State for new image file
  const [isDragging, setIsDragging] = useState(false); // State for drag-and-drop
  const [currentImageKey, setCurrentImageKey] = useState(""); // State for current image URL

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');

  // Populate the form with the existing data when the component mounts
  useEffect(() => {
    if (typeResponse?.data) {
      setEnName(typeResponse.data.name); // Set the English name
      setArName(typeResponse.data.translations.find((t) => t.languageId === "ar")?.name || ""); // Set the Arabic name
      setIsActive(typeResponse.data.isActive);
      setCurrentImageKey(typeResponse.data.imageKey || ""); // Set the current image key
    }
  }, [typeResponse]);

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

     // Trigger refetch when component mounts (navigates to)
     React.useEffect(() => {
      // Only trigger refetch if the data is not being loaded
      if (!isFetching) {
        refetch(); // Manually trigger refetch when component is mounted
      }
    }, [refetch, isFetching]); // Dependency array to ensure it only runs on mount

  // Handle form submission
  const handleSend = async () => {
    if (!enName || !arName) {
      Swal.fire(t('editProductType.ErrorRequiredFields'));
      return;
    }

    try {
      let imageKey = currentImageKey; // Use current image key by default

      // If a new image is selected, upload it first
      if (image) {
        const formData = new FormData();
        formData.append('file', image);

        const uploadResponse = await addFile(formData).unwrap();

        if (
          !uploadResponse.success ||
          uploadResponse.data.uploadedFiles.length === 0
        ) {
          throw new Error('Failed to upload image');
        }

        imageKey = uploadResponse.data.uploadedFiles[0].url;
      }

      const payload = {
        name: enName, // Updated English name
        isActive: isActive,
        imageKey: imageKey, // Include the image key (current or new)
        translations: [
          { languageId: "ar", name: arName }, // Updated Arabic translation
        ],
      };

      const response = await updateType({id, type: payload}).unwrap(); // Send data to the API
      Swal.fire(t('editProductType.SuccessUpdate'));
      navigate("/admin/product-types"); // Redirect to the product types page
    } catch (error) {
      console.error("Failed to update product type:", error);
      Swal.fire(t('editProductType.ErrorUpdate'));
    }
  };

  if (isFetching) return <Text>Loading...</Text>;
  if (fetchError) return <Text>Error loading product type data.</Text>;

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
            {t('editProductType.EditProductType')}
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('editProductType.Back')}
          </Button>
        </div>
        <form>
          {/* English Name Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('editProductType.ProductEnType')}
              <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="text"
              id="en_name"
              placeholder={t('editProductType.EnterProductEnType')}
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
              {t('editProductType.ProductArType')}
              <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="text"
              id="ar_name"
              placeholder={t('editProductType.EnterProductArType')}
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
              {t('editProductType.ProductTypeImage')}
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
                    {t('editProductType.RemoveImage')}
                  </Button>
                </Flex>
              ) : currentImageKey ? (
                <Flex direction="column" align="center">
                  <Image
                    src={currentImageKey}
                    alt="Current Product Type"
                    maxH="200px"
                    mb={2}
                    borderRadius="md"
                    fallbackSrc="https://via.placeholder.com/200x200?text=No+Image"
                  />
                  <Text color="gray.500" mb={2} fontSize="sm">
                    {t('editProductType.CurrentImage')}
                  </Text>
                  <Flex gap={2}>
                    <Button
                      variant="outline"
                      colorScheme="blue"
                      size="sm"
                      onClick={() => document.getElementById('fileInput').click()}
                    >
                      {t('editProductType.UploadImage')}
                      <input
                        type="file"
                        id="fileInput"
                        hidden
                        accept="image/*"
                        onChange={handleFileInputChange}
                      />
                    </Button>
                    <Button
                      variant="outline"
                      colorScheme="red"
                      size="sm"
                      onClick={() => setCurrentImageKey("")}
                    >
                      {t('editProductType.RemoveImage')}
                    </Button>
                  </Flex>
                </Flex>
              ) : (
                <>
                  <Icon as={FaUpload} w={8} h={8} color="#422afb" mb={2} />
                  <Text color="gray.500" mb={2}>
                    {t('editProductType.DragDropImageHere')}
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
                    {t('editProductType.UploadImage')}
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

          {/* Active Status Toggle */}
          <Box mb="20px">
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="isActive" mb="0">
                {t('editProductType.ActiveStatus')}
              </FormLabel>
              <Switch
                id="isActive"
                isChecked={isActive}
                onChange={() => setIsActive(!isActive)}
                colorScheme="teal"
                size="md"
                dir='ltr'
              />
            </FormControl>
          </Box>

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
              isLoading={isUpdating}
            >
              {t('editProductType.SaveChanges')}
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default EditType;
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
} from "@chakra-ui/react";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { useGetTypeQuery, useUpdateTypeMutation } from "api/typeSlice";
import Swal from "sweetalert2";
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const EditType = () => {
  const { id } = useParams(); // Get the product type ID from the URL
  const { data: typeResponse, isLoading: isFetching, isError: fetchError , refetch } = useGetTypeQuery(id); // Fetch the product type data
  const [updateType, { isLoading: isUpdating }] = useUpdateTypeMutation(); // Mutation hook for updating a product type
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // State for form fields
  const [enName, setEnName] = useState("");
  const [arName, setArName] = useState("");
  const [isActive, setIsActive] = useState(typeResponse?.data?.isActive ?? true);

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');

  // Populate the form with the existing data when the component mounts
  useEffect(() => {
    if (typeResponse?.data) {
      setEnName(typeResponse.data.name); // Set the English name
      setArName(typeResponse.data.translations.find((t) => t.languageId === "ar")?.name || ""); // Set the Arabic name
      setIsActive(typeResponse.data.isActive);
    }
  }, [typeResponse]);


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

    const payload = {
     
      name: enName, // Updated English name
      isActive: isActive,
      translations: [
        { languageId: "ar", name: arName }, // Updated Arabic translation
      ],
    };

    try {
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
            />
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
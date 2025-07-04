import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useAddTypeMutation } from "api/typeSlice";
import Swal from "sweetalert2";
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const AddType = () => {
  const [enName, setEnName] = useState(""); // State for English name
  const [arName, setArName] = useState(""); // State for Arabic name
  const [addType, { isLoading }] = useAddTypeMutation(); // Mutation hook for adding a product type
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // Handle form submission
  const handleSend = async () => {
    if (!enName || !arName) {
      Swal.fire(t('addProductType.errorRequiredFields'));
      return;
    }

    const payload = {
      name: enName, // English name
      isActive: true, // Default to true
      translations: [
        { languageId: "ar", name: arName }, // Arabic translation
      ],
    };

    try {
      const response = await addType(payload).unwrap(); // Send data to the API
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
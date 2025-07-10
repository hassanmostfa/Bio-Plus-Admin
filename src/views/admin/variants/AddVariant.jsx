import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  SimpleGrid,
  useColorModeValue,
  RadioGroup,
  Radio,
  Stack,
} from "@chakra-ui/react";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useAddVarientMutation } from "api/varientSlice";
import Swal from "sweetalert2";
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const AddVariant = () => {
  const [variantAr, setVariantAr] = useState("");
  const [variantEn, setVariantEn] = useState("");
  const [attributesCount, setAttributesCount] = useState(0);
  const [attributes, setAttributes] = useState([]);
  const [inputType, setInputType] = useState("dropdown"); // State for radio input selection
  const [createVariant, { isLoading }] = useAddVarientMutation();
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const handleAttributeChange = (index, field, value) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index] = {
      ...updatedAttributes[index],
      [field]: value,
    };
    setAttributes(updatedAttributes);
  };

  const handleAttributesCountChange = (e) => {
    const count = parseInt(e.target.value, 10) || 0;
    setAttributesCount(count);
    setAttributes(new Array(count).fill({ enName: "", arName: "" }));
  };

  const handleSave = async () => {
    const variantData = {
      name: variantEn, // Use the English name as the main name
      optionType: inputType.toUpperCase(), // Convert to uppercase (e.g., "RADIO" or "DROPDOWN")
      numberOfAttributes: attributes.length,
      isActive: true, // Assuming the variant is active by default
      attributes: attributes.map((attr) => ({
        value: attr.enName, // Use the English name as the value
        translations: [
          {
            languageId: "ar",
            value: attr.arName, // Use the Arabic name as the translation
          },
        ],
      })),
      translations: [
        {
          languageId: "ar",
          name: variantAr, // Use the Arabic name as the translation
        },
      ],
    };
  
    try {
      const response = await createVariant(variantData).unwrap(); // Send data to the API
      Swal.fire("Success!", "Variant added successfully.", "success");
      navigate("/admin/variants");
    } catch (error) {
      console.error("Failed to add brand:", error);
      Swal.fire("Error!", "Failed to add brand.", "error");
    }
  };

  return (
    <Box className="container add-admin-container w-100">
      <Box className="add-admin-card shadow p-4 w-100" bg={cardBg} borderRadius="lg">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            mb="20px !important"
            lineHeight="100%"
          >
            {t('addVariant.addNewVariant')}
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('addVariant.back')}
          </Button>
        </div>

        <form dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
          {/* Variant Name Fields */}
          <SimpleGrid columns={2} spacing={4}>
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('addVariant.variantEnName')} <span className="text-danger">*</span>
              </Text>
              <Input
                type="text"
                placeholder={t('addVariant.enterVariantName')}
                value={variantEn}
                onChange={(e) => setVariantEn(e.target.value)}
                required
                mt={2}
                bg={inputBg}
                color={textColor}
              />
            </Box>
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('addVariant.variantArName')} <span className="text-danger">*</span>
              </Text>
              <Input
                type="text"
                placeholder={t('addVariant.enterArName')}
                value={variantAr}
                onChange={(e) => setVariantAr(e.target.value)}
                required
                mt={2}
                bg={inputBg}
                color={textColor}
              />
            </Box>
          </SimpleGrid>

          {/* Input Type Selection (Radio Group) */}
          <Box mt={4}>
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('addVariant.options')} <span className="text-danger">*</span>
            </Text>
            <RadioGroup
              value={inputType}
              onChange={(value) => setInputType(value)}
              mt={2}
            >
              <Stack direction="row">
                <Radio value="dropdown">Dropdown</Radio>
                <Radio value="radio">Radio</Radio>
              </Stack>
            </RadioGroup>
          </Box>

          {/* Attributes Count */}
          <Box mt={4}>
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('addVariant.numberOfAttributes')} <span className="text-danger">*</span>
            </Text>
            <Input
              type="number"
              placeholder={t('addVariant.enterNumber')}
              onChange={handleAttributesCountChange}
              min={0}
              mt={2}
            />
          </Box>

          {/* Dynamic Attribute Fields in Card Style */}
          {attributes.map((attr, index) => (
            <Box
              key={index}
              mt={4}
              p={4}
              borderRadius="lg"
              boxShadow="sm"
              border="1px solid #ccc"
              bg={inputBg}
            >
              <Text color={textColor} fontSize="md" fontWeight="bold">
                {t('addVariant.attribute')} {index + 1}
              </Text>

              <SimpleGrid columns={2} mt={4} spacing={4}>
                <Box>
                  <Text color={textColor} fontSize="sm" fontWeight="700">
                    {t('addVariant.attributeEnName')} <span className="text-danger">*</span>
                  </Text>
                  <Input
                    type="text"
                    placeholder={t('addVariant.enterAttributeName')}
                    value={attr.enName}
                    onChange={(e) =>
                      handleAttributeChange(index, "enName", e.target.value)
                    }
                    required
                    mt={2}
                    color={textColor}
                    bg={inputBg}
                  />
                </Box>

                <Box>
                  <Text color={textColor} fontSize="sm" fontWeight="700">
                    {t('addVariant.attributeArName')} <span className="text-danger">*</span>
                  </Text>
                  <Input
                    type="text"
                    placeholder={t('addVariant.enterAttributeArName')}
                    value={attr.arName}
                    onChange={(e) =>
                      handleAttributeChange(index, "arName", e.target.value)
                    }
                    required
                    mt={2}
                    color={textColor}
                    bg={inputBg}
                  />
                </Box>
              </SimpleGrid>
            </Box>
          ))}

          {/* Save Button */}
          <Flex justify="start" mt={4}>
            <Button
              variant="darkBrand"
              color="white"
              fontSize="sm"
              fontWeight="500"
              borderRadius="70px"
              px="24px"
              py="5px"
              onClick={handleSave}
            >
              {t('addVariant.save')}
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default AddVariant;
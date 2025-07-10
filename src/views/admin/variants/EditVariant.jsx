import React, { useState, useEffect } from "react";
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
  Spinner,
  Switch,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { useGetVarientQuery, useUpdateVarientMutation } from "api/varientSlice";
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const EditVariant = () => {
  const { id } = useParams(); // Get the variant ID from the URL
  const { data: response, isLoading: isFetching, error: fetchError , refetch } = useGetVarientQuery(id); // Fetch existing variant data
  const [updateVariant, { isLoading: isUpdating, error: updateError }] = useUpdateVarientMutation(); // Update mutation

  const [variantAr, setVariantAr] = useState("");
  const [variantEn, setVariantEn] = useState("");
  const [attributesCount, setAttributesCount] = useState(0);
  const [attributes, setAttributes] = useState([]);
  const [inputType, setInputType] = useState("dropdown"); // State for radio input selection
  const [isActive, setIsActive] = useState(response?.data?.isActive ?? true);

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const navigate = useNavigate();

  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');

  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // Populate form fields with existing data when variantData is fetched
  useEffect(() => {
    if (response?.data) {
      const variantData = response.data;
      setVariantEn(variantData.name);
      setVariantAr(variantData.translations.find((t) => t.languageId === "ar")?.name || "");
      setInputType(variantData.optionType.toLowerCase());
      setAttributesCount(variantData.attributes.length);
      setAttributes(
        variantData.attributes.map((attr) => ({
          id: attr.id, // Include the attribute ID for updates
          enName: attr.value,
          arName: attr.translations.find((t) => t.languageId === "ar")?.value || "",
        }))
      );
      setIsActive(variantData.isActive);
    }
  }, [response]);

  // Handle fetch errors
  useEffect(() => {
    if (fetchError) {
      Swal.fire(t('editVariant.errorFetch'), '', 'error');
      navigate("/admin/variants"); // Redirect to the variants list page
    }
  }, [fetchError, navigate, t]);

  // Handle update errors
  useEffect(() => {
    if (updateError) {
      Swal.fire(t('editVariant.errorUpdate'), '', 'error');
    }
  }, [updateError, t]);

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
    setAttributes(new Array(count).fill({ enName: "", arName: "", options: "" }));
  };

  const validateForm = () => {
    if (!variantEn || !variantAr) {
      Swal.fire(t('editVariant.errorRequiredNames'), '', 'error');
      return false;
    }

    for (let i = 0; i < attributes.length; i++) {
      if (!attributes[i].enName || !attributes[i].arName) {
        Swal.fire(t('editVariant.errorRequiredAttributeNames', {index: i+1}), '', 'error');
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const updatedVariantData = {
       // Include the variant ID for updating
      name: variantEn, // Use the English name as the main name
      optionType: inputType.toUpperCase(), // Convert to uppercase (e.g., "RADIO" or "DROPDOWN")
      numberOfAttributes: attributes.length,
      isActive: isActive,
      attributes: attributes.map((attr) => ({
        id: attr.id, // Include the attribute ID for updates
        value: attr.enName, // Use the English name as the value
        options: inputType !== "text" ? attr.options : null, // Include options if not text input
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
      const response = await updateVariant({id,varient:updatedVariantData}).unwrap(); // Send data to the API
      Swal.fire(t('editVariant.successUpdate'), '', 'success');
      navigate("/admin/variants");
    } catch (error) {
      console.error("Failed to update variant:", error);
      Swal.fire(t('editVariant.errorUpdate'), '', 'error');
    }
  };

  if (isFetching) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    ); // Show loading state while fetching data
  }

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
            {t('editVariant.title')}
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('editVariant.back')}
          </Button>
        </div>

        <form dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
          {/* Variant Name Fields */}
          <SimpleGrid columns={2} spacing={4}>
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('editVariant.variantEnName')} <span className="text-danger">*</span>
              </Text>
              <Input
                type="text"
                placeholder={t('editVariant.enterVariantName')}
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
                {t('editVariant.variantArName')} <span className="text-danger">*</span>
              </Text>
              <Input
                type="text"
                placeholder={t('editVariant.enterVariantArName')}
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
              {t('editVariant.options')} <span className="text-danger">*</span>
            </Text>
            <RadioGroup
              value={inputType}
              onChange={(value) => setInputType(value)}
              mt={2}
            >
              <Stack direction="row">
                <Radio value="dropdown">{t('editVariant.dropdown')}</Radio>
                <Radio value="radio">{t('editVariant.radio')}</Radio>
                <Radio value="text">{t('editVariant.text')}</Radio>
              </Stack>
            </RadioGroup>
          </Box>

          {/* Active Status Toggle */}
          <Box mt={4}>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="isActive" mb="0">
                {t('editVariant.activeStatus')}
              </FormLabel>
              <Switch
                id="isActive"
                isChecked={isActive}
                onChange={() => setIsActive(!isActive)}
                colorScheme="teal"
                size="md"
                dir="ltr"
              />
            </FormControl>
          </Box>

          {/* Attributes Count */}
          <Box mt={4}>
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('editVariant.numberOfAttributes')} <span className="text-danger">*</span>
            </Text>
            <Input
              type="number"
              placeholder={t('editVariant.enterNumberOfAttributes')}
              value={attributesCount}
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
                {t('editVariant.attribute')} {index + 1}
              </Text>

              <SimpleGrid columns={2} mt={4} spacing={4}>
                <Box>
                  <Text color={textColor} fontSize="sm" fontWeight="700">
                    {t('editVariant.attributeEnName')} <span className="text-danger">*</span>
                  </Text>
                  <Input
                    type="text"
                    placeholder={t('editVariant.enterAttributeName')}
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
                    {t('editVariant.attributeArName')} <span className="text-danger">*</span>
                  </Text>
                  <Input
                    type="text"
                    placeholder={t('editVariant.enterAttributeArName')}
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
              isLoading={isUpdating}
              isDisabled={isFetching || isUpdating}
            >
              {t('editVariant.saveChanges')}
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default EditVariant;
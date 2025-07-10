import React, { useEffect, useState } from "react";
import {
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
  Radio,
  RadioGroup,
  Stack,
  Spinner,
  Box,
} from "@chakra-ui/react";
import Swal from "sweetalert2";
import { useGetDeliveryFeesQuery, useUpdateDeliveryFeesMutation } from "../../../api/deliveryFeesSlice"; // Adjust import path if needed
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const DeliveryFees = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');

  // Fetch delivery fees from API
  const { data, isLoading, error } = useGetDeliveryFeesQuery();
  
  const [updateDeliveryFees, { isLoading: isUpdating }] = useUpdateDeliveryFeesMutation();

  const [formData, setFormData] = useState({
    deliveryFeeType: "uniform",
    uniformDeliveryFee: "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        deliveryFeeType: data.data.feeType === "UNIFORM" ? "uniform" : "perPharmacy",
        uniformDeliveryFee: data.data.uniformFeeAmount !== undefined ? data.data.uniformFeeAmount.toString() : "",
      });
    }
  }, [data]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeliveryFeeTypeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      deliveryFeeType: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate uniformDeliveryFee if 'uniform' selected
    if (formData.deliveryFeeType === "uniform") {
      const amount = parseFloat(formData.uniformDeliveryFee);
      if (isNaN(amount) || amount < 0) {
        Swal.fire(t('deliveryFees.validationErrorTitle'), t('deliveryFees.validationErrorText'), "error");
        return;
      }
    }

    try {
      const dataToSend = {
        feeType: formData.deliveryFeeType === "uniform" ? "UNIFORM" : "PER_PHARMACY",
        uniformFeeAmount: formData.deliveryFeeType === "uniform"
          ? parseFloat(formData.uniformDeliveryFee)
          : 0,
      };
      await updateDeliveryFees(dataToSend).unwrap();
      Swal.fire(t('deliveryFees.successTitle'), t('deliveryFees.successText'), "success");
    } catch (err) {
      console.error("Error updating delivery fees:", err);
      Swal.fire(t('deliveryFees.errorTitle'), t('deliveryFees.errorText'), "error");
    }
  };

  if (isLoading) return <Spinner color="blue.500" size="xl" />;
  if (error) return <Text color="red.500">{t('deliveryFees.loadErrorText')}</Text>;

  return (
    <Box className="container add-admin-container w-100" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Box bg={cardBg} className="add-admin-card shadow p-4 w-100" borderRadius="lg">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            mb="20px !important"
            lineHeight="100%"
          >
            {t('deliveryFees.title')}
          </Text>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Delivery Fee Type Selection */}
          <Box mb={4}>
            <Text color={textColor} fontSize="sm" fontWeight="700" mb="8px">
              {t('deliveryFees.feeTypeLabel')}
            </Text>
            <RadioGroup
              onChange={handleDeliveryFeeTypeChange}
              value={formData.deliveryFeeType}
              name="deliveryFeeType"
            >
              <Stack direction="column">
                <Radio value="uniform" color={textColor} bg={inputBg}>{t('deliveryFees.uniformOption')}</Radio>
                <Radio value="perPharmacy" color={textColor} bg={inputBg}>{t('deliveryFees.perPharmacyOption')}</Radio>
              </Stack>
            </RadioGroup>
          </Box>

          {/* Uniform Delivery Fee Input */}
          {formData.deliveryFeeType === "uniform" && (
            <Box mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('deliveryFees.uniformFeeLabel')}
                <span className="text-danger mx-1">*</span>
              </Text>
              <Input
                type="number"
                name="uniformDeliveryFee"
                placeholder={t('deliveryFees.uniformFeePlaceholder')}
                value={formData.uniformDeliveryFee}
                onChange={handleInputChange}
                required
                mt="8px"
                min="0"
                color={textColor}
                bg={inputBg}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
            </Box>
          )}

          {/* Note for per-pharmacy option */}
          {formData.deliveryFeeType === "perPharmacy" && (
            <Box mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('deliveryFees.noteLabel')}:
              </Text>
              <Text color={textColor} fontSize="sm" mt="8px">
                {t('deliveryFees.perPharmacyNote')}
              </Text>
            </Box>
          )}

          {/* Action Buttons */}
          <Flex justify="flex-start" mt={6}>
            <Button
              variant="darkBrand"
              color="white"
              fontSize="sm"
              fontWeight="500"
              borderRadius="70px"
              px="24px"
              py="5px"
              type="submit"
              mt="30px"
              isLoading={isUpdating}
              loadingText={t('deliveryFees.saving')}
            >
              {t('deliveryFees.saveSettings')}
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default DeliveryFees;

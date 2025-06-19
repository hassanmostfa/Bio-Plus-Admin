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

const DeliveryFees = () => {
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
        Swal.fire("Validation Error", "Please enter a valid, non-negative delivery fee amount.", "error");
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
      Swal.fire("Success!", "Delivery fees settings saved successfully.", "success");
    } catch (err) {
      console.error("Error updating delivery fees:", err);
      Swal.fire("Error", "Failed to save delivery fees settings.", "error");
    }
  };

  if (isLoading) return <Spinner color="blue.500" size="xl" />;
  if (error) return <Text color="red.500">Failed to load delivery fees. Please try again.</Text>;

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
            Delivery Fees Settings
          </Text>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Delivery Fee Type Selection */}
          <Box mb={4}>
            <Text color={textColor} fontSize="sm" fontWeight="700" mb="8px">
              Delivery Fee Type
            </Text>
            <RadioGroup
              onChange={handleDeliveryFeeTypeChange}
              value={formData.deliveryFeeType}
              name="deliveryFeeType"
            >
              <Stack direction="column">
                <Radio value="uniform" color={textColor} bg={inputBg}>Uniform fee for all pharmacies</Radio>
                <Radio value="perPharmacy" color={textColor} bg={inputBg}>Different fee per pharmacy</Radio>
              </Stack>
            </RadioGroup>
          </Box>

          {/* Uniform Delivery Fee Input */}
          {formData.deliveryFeeType === "uniform" && (
            <Box mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Delivery Fee for All Pharmacies
                <span className="text-danger mx-1">*</span>
              </Text>
              <Input
                type="number"
                name="uniformDeliveryFee"
                placeholder="Enter delivery fee amount"
                value={formData.uniformDeliveryFee}
                onChange={handleInputChange}
                required
                mt="8px"
                min="0"
                color={textColor}
                bg={inputBg}
              />
            </Box>
          )}

          {/* Note for per-pharmacy option */}
          {formData.deliveryFeeType === "perPharmacy" && (
            <Box mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Note:
              </Text>
              <Text color={textColor} fontSize="sm" mt="8px">
                When "Different fee per pharmacy" is selected, you can set individual delivery fees
                for each pharmacy in the pharmacy management section.
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
            >
              Save Settings
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default DeliveryFees;

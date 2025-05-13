import React, { useState } from "react";
import {
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
import Swal from "sweetalert2";

const DeliveryFees = () => {
  const textColor = useColorModeValue("secondaryGray.900", "white");

  const [formData, setFormData] = useState({
    deliveryFeeType: "uniform", // 'uniform' or 'perPharmacy'
    uniformDeliveryFee: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeliveryFeeTypeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      deliveryFeeType: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Here you would typically send the data to your backend
    console.log("Delivery fee settings:", formData);
    
    Swal.fire('Success!', 'Delivery fees settings saved successfully.', 'success');
  };

  return (
    <div className="container add-admin-container w-100">
      <div className="add-admin-card shadow p-4 bg-white w-100">
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
          <div className="mb-4">
            <Text color={textColor} fontSize="sm" fontWeight="700" mb="8px">
              Delivery Fee Type
            </Text>
            <RadioGroup 
              onChange={handleDeliveryFeeTypeChange} 
              value={formData.deliveryFeeType}
              name="deliveryFeeType"
            >
              <Stack direction="column">
                <Radio value="uniform">Uniform fee for all pharmacies</Radio>
                <Radio value="perPharmacy">Different fee per pharmacy</Radio>
              </Stack>
            </RadioGroup>
          </div>

          {/* Uniform Delivery Fee Input (shown when uniform is selected) */}
          {formData.deliveryFeeType === "uniform" && (
            <div className="mb-3">
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
                required={formData.deliveryFeeType === "uniform"}
                mt="8px"
              />
            </div>
          )}

          {/* Note for per-pharmacy option */}
          {formData.deliveryFeeType === "perPharmacy" && (
            <div className="mb-3">
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Note:
              </Text>
              <Text color={textColor} fontSize="sm" mt="8px">
                When "Different fee per pharmacy" is selected, you can set individual delivery fees 
                for each pharmacy in the pharmacy management section.
              </Text>
            </div>
          )}

          {/* Action Buttons */}
          <Flex justify="flex-start" mt={6}>
            <Button
              variant='darkBrand'
              color='white'
              fontSize='sm'
              fontWeight='500'
              borderRadius='70px'
              px='24px'
              py='5px'
              type="submit"
              mt='30px'
            >
              Save Settings
            </Button>
          </Flex>
        </form>
      </div>
    </div>
  );
};

export default DeliveryFees;
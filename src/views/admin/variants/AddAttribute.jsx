import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Input,
  Text,
  useColorModeValue,
  Icon,

} from "@chakra-ui/react";

import { FaUpload } from "react-icons/fa6";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const AddAttribute = () => {
  const [type, setType] = useState("");


  const textColor = useColorModeValue("secondaryGray.900", "white");
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');

  const navigate = useNavigate();

  const handleSend = () => {
    const notificationData = {
      type,

    };
    console.log("Notification Data:", notificationData);
    // You can send this data to an API or perform other actions
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
            Add New Attribute
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
          {/* English Title and Arabic Title Fields */}
          <div className="row col-md-12">
            <div className="mb-3 col-md-12">
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Attribute Name
                <span className="text-danger mx-1">*</span>
              </Text> 
              <Input
                type="text"
                id="type"
                placeholder="Enter Attribute Name"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                mt={"8px"}
                bg={inputBg}
                color={textColor}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <Flex justify="start" mt={4}>
            <Button variant='darkBrand' color='white' fontSize='sm' fontWeight='500' borderRadius='70px' px='24px' py='5px' onClick={handleSend}>
              Save
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default AddAttribute;


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

const AddVariant = () => {
  const [variantAr, setVariantAr] = useState("");
  const [variantEn, setVariantEn] = useState("");
  const [attributesCount, setAttributesCount] = useState(0);
  const [attributes, setAttributes] = useState([]);
  const [inputType, setInputType] = useState("dropdown"); // State for radio input selection

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const navigate = useNavigate();

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
    setAttributes(new Array(count).fill({ arName: "", enName: "" }));
  };

  const handleSave = () => {
    const variantData = {
      variantAr,
      variantEn,
      attributes,
      inputType, // Include the selected input type in the saved data
    };
    console.log("Variant Data:", variantData);
    // You can send this data to an API or perform other actions
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
            Add New Variant
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
          {/* Variant Name Fields */}
          <SimpleGrid columns={2} spacing={4}>
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Variant En-Name <span className="text-danger">*</span>
              </Text>
              <Input
                type="text"
                placeholder="Enter Variant Name"
                value={variantEn}
                onChange={(e) => setVariantEn(e.target.value)}
                required
                mt={2}
              />
            </Box>
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Variant Ar-Name <span className="text-danger">*</span>
              </Text>
              <Input
                type="text"
                placeholder="أدخل اسم المتغير"
                value={variantAr}
                onChange={(e) => setVariantAr(e.target.value)}
                required
                mt={2}
              />
            </Box>
          </SimpleGrid>

          {/* Input Type Selection (Radio Group) */}
          <Box mt={4}>
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Options <span className="text-danger">*</span>
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
              Number of Attributes <span className="text-danger">*</span>
            </Text>
            <Input
              type="number"
              placeholder="Enter number of attributes"
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
              bg="white"
            >
              <Text color={textColor} fontSize="md" fontWeight="bold">
                Attribute {index + 1}
              </Text>

              <SimpleGrid columns={2} mt={4} spacing={4}>
                <Box>
                  <Text color={textColor} fontSize="sm" fontWeight="700">
                    Attribute En-Name <span className="text-danger">*</span>
                  </Text>
                  <Input
                    type="text"
                    placeholder="Enter Attribute Name"
                    value={attr.enName}
                    onChange={(e) =>
                      handleAttributeChange(index, "enName", e.target.value)
                    }
                    required
                    mt={2}
                  />
                </Box>

                <Box>
                  <Text color={textColor} fontSize="sm" fontWeight="700">
                    Attribute Ar-Name <span className="text-danger">*</span>
                  </Text>
                  <Input
                    type="text"
                    placeholder="أدخل اسم السمة"
                    value={attr.arName}
                    onChange={(e) =>
                      handleAttributeChange(index, "arName", e.target.value)
                    }
                    required
                    mt={2}
                  />
                </Box>
              </SimpleGrid>

              {/* Conditional Input Based on Selected Input Type */}
              {inputType === "dropdown" && (
                <Box mt={4}>
                  <Text color={textColor} fontSize="sm" fontWeight="700">
                    Dropdown Options <span className="text-danger">*</span>
                  </Text>
                  <Input
                    type="text"
                    placeholder="Enter dropdown options (comma-separated)"
                    onChange={(e) =>
                      handleAttributeChange(index, "options", e.target.value)
                    }
                    mt={2}
                  />
                </Box>
              )}

              {inputType === "radio" && (
                <Box mt={4}>
                  <Text color={textColor} fontSize="sm" fontWeight="700">
                    Radio Options <span className="text-danger">*</span>
                  </Text>
                  <Input
                    type="text"
                    placeholder="Enter radio options (comma-separated)"
                    onChange={(e) =>
                      handleAttributeChange(index, "options", e.target.value)
                    }
                    mt={2}
                  />
                </Box>
              )}
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
              Save
            </Button>
          </Flex>
        </form>
      </div>
    </div>
  );
};

export default AddVariant;
import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Input,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAddSpecializationMutation } from "api/doctorSpecializationSlice";

const AddSpecialize = () => {
  const [name, setName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const navigate = useNavigate();
  const [addSpecialize, { isLoading }] = useAddSpecializationMutation();

  // Color mode values
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const cardBg = useColorModeValue("white", "navy.700");
  const inputBg = useColorModeValue("gray.100", "gray.700");
  const inputBorder = useColorModeValue("gray.300", "gray.600");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const tagData = {
      name,
      translations: [
        {
          languageId: "ar",
          name: arabicName
        }
      ]
    };

    try {
      const response = await addSpecialize(tagData).unwrap();
      Swal.fire('Success!', 'Tag created successfully.', 'success');
      navigate('/admin/specializations');
    } catch (error) {
      console.error('Failed to add tag:', error);
      Swal.fire(
        'Error!',
        error.data?.message || 'Failed to create tag.',
        'error'
      );
    }
  };

  const handleCancel = () => {
    setName("");
    setArabicName("");
    navigate('/admin/specializations');
  };

  return (
    <Flex justify="center" p="20px" mt={'80px'}>
      <Box w="100%" p="6" boxShadow="md" borderRadius="lg" bg={cardBg}>
        <Flex justify="space-between" align="center" mb="20px">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            Add New Specialization
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
        </Flex>

        <form onSubmit={handleSubmit}>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            {/* English Name Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                English Name
                <span style={{ color: 'red' }}> *</span>
              </Text>
              <Input
                type="text"
                placeholder="Enter English Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
              />
            </Box>

            {/* Arabic Name Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                Arabic Name
                <span style={{ color: 'red' }}> *</span>
              </Text>
              <Input
                type="text"
                placeholder="ادخل الاسم بالعربية"
                value={arabicName}
                onChange={(e) => setArabicName(e.target.value)}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
                dir="rtl"
              />
            </Box>
          </Grid>

          {/* Action Buttons */}
          <Flex justify="center" mt={6} gap={4}>
            <Button
              variant="outline"
              colorScheme="red"
              onClick={handleCancel}
              width="120px"
            >
              Cancel
            </Button>
            <Button
              variant='solid'
              colorScheme='brandScheme'
              color='white'
              fontSize='sm'
              fontWeight='500'
              borderRadius='70px'
              px='24px'
              py='5px'
              type="submit"
              isLoading={isLoading}
              loadingText="Submitting..."
              width="120px"
            >
              Create
            </Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  );
};

export default AddSpecialize;
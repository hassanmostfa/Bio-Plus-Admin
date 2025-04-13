import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Input,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

import Swal from "sweetalert2";
import { useAddSpecializationMutation } from "api/doctorSpecializationSlice";

const AddSpecialize = () => {
  const [name, setName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const navigate = useNavigate();
  const toast = useToast();
  const [addSpecialize, { isLoading }] = useAddSpecializationMutation();

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
      navigate('/admin/doctors-specializations');
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
    navigate('/admin/doctors-specializations');
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
        </div>
        <form onSubmit={handleSubmit}>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            {/* English Name Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                English Name
                <span className="text-danger mx-1">*</span>
              </Text>
              <Input
                type="text"
                placeholder="Enter English Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                mt={"8px"}
              />
            </Box>

            {/* Arabic Name Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Arabic Name
                <span className="text-danger mx-1">*</span>
              </Text>
              <Input
                type="text"
                placeholder="ادخل الاسم بالعربية"
                value={arabicName}
                onChange={(e) => setArabicName(e.target.value)}
                required
                mt={"8px"}
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
              variant='darkBrand'
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
      </div>
    </div>
  );
};

export default AddSpecialize;
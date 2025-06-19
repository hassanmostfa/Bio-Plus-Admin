import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Input,
  Text,
  useColorModeValue,
  Spinner,
  Switch,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { useGetSpecializationQuery, useUpdateSpecializationMutation } from "api/doctorSpecializationSlice";

const EditSpecialization = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Color mode values
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const cardBg = useColorModeValue("white", "navy.700");
  const inputBg = useColorModeValue("gray.100", "gray.700");
  const inputBorder = useColorModeValue("gray.300", "gray.600");

  // API hooks
  const { data: specialResponse, isLoading: isFetching } = useGetSpecializationQuery(id);
  const [updateTag, { isLoading: isUpdating }] = useUpdateSpecializationMutation();

  // State
  const [formData, setFormData] = useState({
    name: "",
    arabicName: ""
  });
  const [isActive, setIsActive] = useState(true);

  // Initialize form data
  useEffect(() => {
    if (specialResponse?.data) {
      const arabicTranslation = specialResponse?.data.translations?.find(t => t.languageId === 'ar');
      setFormData({
        name: specialResponse?.data.name,
        arabicName: arabicTranslation?.name || ""
      });
      setIsActive(specialResponse?.data?.isActive ?? true);
    }
  }, [specialResponse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const tagData = {
      name: formData.name,
      isActive: isActive,
      translations: [
        {
          languageId: "ar",
          name: formData.arabicName
        }
      ]
    };

    try {
      await updateTag({ id, data: tagData }).unwrap();
      Swal.fire('Success!', 'Specialization updated successfully.', 'success');
      navigate('/admin/specializations');
    } catch (error) {
      console.error('Failed to update specialization:', error);
      Swal.fire(
        'Error!',
        error.data?.message || 'Failed to update specialization.',
        'error'
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isFetching) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Flex justify="center" p="20px" mt={'80px'}>
      <Box w="100%" p="6" boxShadow="md" borderRadius="lg" bg={cardBg}>
        <Flex justify="space-between" align="center" mb="20px">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            Edit Specialization
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
                name="name"
                placeholder="Enter English Name"
                value={formData.name}
                onChange={handleInputChange}
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
                name="arabicName"
                placeholder="ادخل الاسم بالعربية"
                value={formData.arabicName}
                onChange={handleInputChange}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
                dir="rtl"
              />
            </Box>

            {/* Active Status Toggle */}
            <Box>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="isActive" mb="0" color={textColor}>
                  Active Status
                </FormLabel>
                <Switch
                  id="isActive"
                  isChecked={isActive}
                  onChange={() => setIsActive(!isActive)}
                  colorScheme="teal"
                  size="md"
                />
              </FormControl>
            </Box>
          </Grid>

          {/* Action Buttons */}
          <Flex justify="center" mt={6} gap={4}>
            <Button
              variant="outline"
              colorScheme="red"
              onClick={() => navigate('/admin/specializations')}
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
              isLoading={isUpdating}
              loadingText="Saving..."
              width="120px"
            >
              Save Changes
            </Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  );
};

export default EditSpecialization;
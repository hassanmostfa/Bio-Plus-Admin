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
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useUpdateTagMutation, useGetTagsQuery } from "api/tagSlice";
import Swal from "sweetalert2";

const EditTag = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const textColor = useColorModeValue("secondaryGray.900", "white");

  // Get all tags to find the one we're editing
  const { data: tagsResponse, isLoading: isFetching } = useGetTagsQuery({});
  const [updateTag, { isLoading: isUpdating }] = useUpdateTagMutation();

  // State for the tag being edited
  const [formData, setFormData] = useState({
    name: "",
    arabicName: ""
  });
  const [isActive, setIsActive] = useState(false);

  // Find and initialize the tag data
  useEffect(() => {
    if (tagsResponse?.data) {
      const tagToEdit = tagsResponse.data.find(tag => tag.id === id);
      if (tagToEdit) {
        const arabicTranslation = tagToEdit.translations?.find(t => t.languageId === 'ar');
        setFormData({
          name: tagToEdit.name,
          arabicName: arabicTranslation?.name || ""
        });
        setIsActive(tagToEdit.isActive);
      } else {
        Swal.fire('Error!', 'Tag not found.', 'error');
        navigate('/admin/tags');
      }
    }
  }, [tagsResponse, id, navigate]);

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
      Swal.fire('Success!', 'Tag updated successfully.', 'success');
      navigate('/admin/undefined/tags');
    } catch (error) {
      console.error('Failed to update tag:', error);
      Swal.fire(
        'Error!',
        error.data?.message || 'Failed to update tag.',
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
            Edit Tag
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
                name="name"
                placeholder="Enter English Name"
                value={formData.name}
                onChange={handleInputChange}
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
                name="arabicName"
                placeholder="ادخل الاسم بالعربية"
                value={formData.arabicName}
                onChange={handleInputChange}
                required
                mt={"8px"}
                dir="rtl"
              />
            </Box>

            {/* Active Status Toggle */}
            <Box>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="isActive" mb="0">
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
              onClick={() => navigate('/admin/undefined/tags')}
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
              isLoading={isUpdating}
              loadingText="Saving..."
              width="120px"
            >
              Save Changes
            </Button>
          </Flex>
        </form>
      </div>
    </div>
  );
};

export default EditTag;
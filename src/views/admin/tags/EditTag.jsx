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
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const EditTag = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');

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
        Swal.fire(t('tags.notFoundTitle'), t('tags.notFoundText'), 'error');
        navigate('/admin/tags');
      }
    }
  }, [tagsResponse, id, navigate, t]);

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
      Swal.fire(t('tags.updateSuccessTitle'), t('tags.updateSuccessText'), 'success');
      navigate('/admin/undefined/tags');
    } catch (error) {
      console.error('Failed to update tag:', error);
      Swal.fire(
        t('tags.updateErrorTitle'),
        error.data?.message || t('tags.updateErrorText'),
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
    <Box className="container add-admin-container w-100" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Box className="add-admin-card shadow p-4 w-100" bg={cardBg} borderRadius="lg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            mb="20px !important"
            lineHeight="100%"
          >
            {t('tags.editTitle')}
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('tags.back')}
          </Button>
        </div>
        <form onSubmit={handleSubmit}>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            {/* English Name Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('tags.englishName')}
                <span className="text-danger mx-1">*</span>
              </Text>
              <Input
                type="text"
                name="name"
                placeholder={t('tags.englishNamePlaceholder')}
                value={formData.name}
                onChange={handleInputChange}
                required
                mt={"8px"}
                bg={inputBg}
                color={textColor}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
            </Box>

            {/* Arabic Name Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('tags.arabicName')}
                <span className="text-danger mx-1">*</span>
              </Text>
              <Input
                type="text"
                name="arabicName"
                placeholder={t('tags.arabicNamePlaceholder')}
                value={formData.arabicName}
                onChange={handleInputChange}
                required
                mt={"8px"}
                dir="rtl"
                bg={inputBg}
                color={textColor}
              />
            </Box>

            {/* Active Status Toggle */}
            <Box>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="isActive" mb="0">
                  {t('tags.activeStatus')}
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
              {t('tags.cancel')}
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
              loadingText={t('tags.saving')}
              width="120px"
            >
              {t('tags.saveChanges')}
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default EditTag;
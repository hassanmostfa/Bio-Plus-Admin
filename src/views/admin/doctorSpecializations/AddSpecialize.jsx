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
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../contexts/LanguageContext';

const AddSpecialize = () => {
  const [name, setName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const navigate = useNavigate();
  const [addSpecialize, { isLoading }] = useAddSpecializationMutation();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

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
      Swal.fire(t('specializations.success'), t('specializations.specializationCreatedSuccessfully'), 'success');
      navigate('/admin/specializations');
    } catch (error) {
      console.error('Failed to add tag:', error);
      Swal.fire(
        t('specializations.error'),
        error.data?.message || t('specializations.failedToCreateSpecialization'),
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
    <Flex justify="center" p="20px" mt={'80px'} dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <Box w="100%" p="6" boxShadow="md" borderRadius="lg" bg={cardBg}>
        <Flex justify="space-between" align="center" mb="20px">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            {t('specializations.addNewSpecialization')}
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('specializations.back')}
          </Button>
        </Flex>

        <form onSubmit={handleSubmit}>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            {/* English Name Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('specializations.englishName')}
                <span style={{ color: 'red' }}> *</span>
              </Text>
              <Input
                type="text"
                placeholder={t('specializations.enterEnglishName')}
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
                {t('specializations.arabicName')}
                <span style={{ color: 'red' }}> *</span>
              </Text>
              <Input
                type="text"
                placeholder={t('specializations.enterArabicName')}
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
              {t('specializations.cancel')}
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
              loadingText={t('specializations.submitting')}
              width="120px"
            >
              {t('specializations.create')}
            </Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  );
};

export default AddSpecialize;
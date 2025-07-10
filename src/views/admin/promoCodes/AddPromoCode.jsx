import React, { useState } from 'react';
import {
  Grid,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Switch,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useAddPromocodeMutation } from 'api/promocodeSlice';
import Swal from 'sweetalert2';
import { IoMdArrowBack } from 'react-icons/io';
import { useTranslation } from "react-i18next";
import { useLanguage } from "contexts/LanguageContext";

const AddPromoCode = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const navigate = useNavigate();
  const [addPromocode, { isLoading }] = useAddPromocodeMutation();

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    amount: '',
    type: 'FIXED', // Default to FIXED
    endDate: '',
    maxUsage: '',
    isActive: true,
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle type selection
  const handleSelectType = (type) => {
    setFormData((prev) => ({
      ...prev,
      type: type.toUpperCase(),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Format the end date to include time
    const formattedEndDate = formData.endDate
      ? `${formData.endDate}T23:59:59.999Z`
      : '';

    try {
      const response = await addPromocode({
        ...formData,
        amount: Number(formData.amount),
        maxUsage: Number(formData.maxUsage),
        endDate: formattedEndDate,
        
      }).unwrap();

      Swal.fire(t('common.success'), t('promoCodes.createdSuccess'), 'success');
      navigate('/admin/promo-codes');
    } catch (error) {
      console.error('Failed to add promo code:', error);
      Swal.fire(
        t('common.error'),
        error.data?.message || t('promoCodes.createError'),
        'error',
      );
    }
  };

  return (
    <Box className="container add-promo-container w-100" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <Box bg={cardBg} className="add-promo-card shadow p-4 w-100" borderRadius="15px">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            {t('promoCodes.addNewPromoCode')}
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('common.back')}
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            {/* Promo Code Field */}
            <FormControl>
              <FormLabel color={textColor} fontSize="sm" fontWeight="700">
                {t('promoCodes.promoCode')}
                <span className="text-danger mx-1">*</span>
              </FormLabel>
              <Input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder={t('promoCodes.enterPromoCode')}
                required
                mt={'8px'}
                color={textColor}
                bg={inputBg}
                dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
              />
            </FormControl>

            {/* Amount Field */}
            <FormControl>
              <FormLabel color={textColor} fontSize="sm" fontWeight="700">
                {t('promoCodes.amount')}
                <span className="text-danger mx-1">*</span>
              </FormLabel>
              <Input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder={t('promoCodes.enterAmount')}
                required
                mt={'8px'}
                color={textColor}
                bg={inputBg}
                dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
              />
            </FormControl>

            {/* Type Dropdown */}
            <FormControl>
              <FormLabel color={textColor} fontSize="sm" fontWeight="700">
                {t('promoCodes.type')}
                <span className="text-danger mx-1">*</span>
              </FormLabel>
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  width="100%"
                  bg="white"
                  border="1px solid #ddd"
                  borderRadius="md"
                  _hover={{ bg: 'gray.200' }}
                  textAlign="left"
                  mt={'8px'}
                  dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                >
                  {formData.type === 'FIXED' ? t('promoCodes.fixedAmount') : t('promoCodes.percentage')}
                </MenuButton>
                <MenuList width="100%">
                  <MenuItem
                    onClick={() => handleSelectType('FIXED')}
                    bg={formData.type === 'FIXED' ? 'blue.100' : 'white'}
                  >
                    {t('promoCodes.fixedAmount')}
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleSelectType('PERCENTAGE')}
                    bg={formData.type === 'PERCENTAGE' ? 'blue.100' : 'white'}
                  >
                    {t('promoCodes.percentage')}
                  </MenuItem>
                </MenuList>
              </Menu>
            </FormControl>

            {/* Status Switch */}
          

            {/* End Date Field */}
            <FormControl>
              <FormLabel color={textColor} fontSize="sm" fontWeight="700">
                {t('promoCodes.endDate')}
                <span className="text-danger mx-1">*</span>
              </FormLabel>
              <Input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                mt={'8px'}
                min={new Date().toISOString().split('T')[0]}
                color={textColor}
                bg={inputBg}
                dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
              />
            </FormControl>

            {/* Max Usage Field */}
            <FormControl>
              <FormLabel color={textColor} fontSize="sm" fontWeight="700">
                {t('promoCodes.maxUsage')}
                <span className="text-danger mx-1">*</span>
              </FormLabel>
              <Input
                type="number"
                name="maxUsage"
                value={formData.maxUsage}
                onChange={handleInputChange}
                placeholder={t('promoCodes.enterMaxUsage')}
                required
                mt={'8px'}
                min="1"
                color={textColor}
                bg={inputBg}
                dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
              />
            </FormControl>
            {/* <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="is-active" mb="0" mt="30px">
                Active Status
              </FormLabel>
              <Switch
                id="is-active"
                isChecked={formData.isActive}
                onChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: !prev.isActive,
                  }))
                }
                colorScheme="green"
                mt={'8px'}
              />
            </FormControl> */}
          </Grid>

          {/* Submit Button */}
          <Flex justify="center" mt={8} gap={4}>
            <Button
              variant="outline"
              colorScheme="red"
              onClick={() => navigate(-1)}
              width="120px"
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="darkBrand"
              color="white"
              fontSize="sm"
              fontWeight="500"
              borderRadius="70px"
              px="24px"
              py="5px"
              type="submit"
              isLoading={isLoading}
              loadingText={t('common.submitting')}
              width="120px"
              mx={2}
            >
              {t('promoCodes.createPromoCode')}
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default AddPromoCode;

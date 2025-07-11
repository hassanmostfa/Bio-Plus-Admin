import React, { useState, useEffect } from 'react';
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
  Spinner,
  Badge,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetPromocodesQuery, useUpdatePromocodeMutation } from 'api/promocodeSlice';
import Swal from 'sweetalert2';
import { IoMdArrowBack } from 'react-icons/io';
import { useTranslation } from "react-i18next";
import { useLanguage } from "contexts/LanguageContext";

const EditPromoCode = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  
  // Fetch all promo codes
  const { data: promocodesResponse, isLoading: isFetching  , refetch} = useGetPromocodesQuery({});
  const [updatePromocode, { isLoading: isUpdating }] = useUpdatePromocodeMutation();

  // State for the promo code being edited
  const [promoCode, setPromoCode] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    amount: '',
    type: 'FIXED',
    endDate: '',
    maxUsage: '',
    isActive: true,
  });

  useEffect(()=>{
    refetch();
  },[refetch, id]);


  // Find the specific promo code when data loads
  useEffect(() => {
    if (promocodesResponse?.data) {
      const foundPromo = promocodesResponse.data.find(p => p.id === id);
      if (foundPromo) {
        setPromoCode(foundPromo);
        setFormData({
          code: foundPromo.code,
          amount: foundPromo.amount,
          type: foundPromo.type,
          endDate: foundPromo.endDate.split('T')[0], // Remove time portion
          maxUsage: foundPromo.maxUsage,
          isActive: foundPromo.isActive,
        });
      } else {
        Swal.fire(t('common.error'), t('promoCodes.notFound'), 'error');
        navigate('/admin/promo-codes');
      }
    }
  }, [promocodesResponse, id, navigate, refetch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectType = (type) => {
    setFormData(prev => ({
      ...prev,
      type: type.toUpperCase()
    }));
  };
  const handleSelectStatus = (status) => {
    console.log(status);
    
    setFormData(prev => ({
      ...prev,
      isActive: status
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updatePromocode({
        id,
        data: {
          ...formData,
          amount: Number(formData.amount),
          maxUsage: Number(formData.maxUsage),
          endDate: `${formData.endDate}T23:59:59.999Z` // Add time portion
        }
      }).unwrap();

      Swal.fire(t('common.success'), t('promoCodes.updatedSuccess'), 'success');
      navigate('/admin/promo-codes');
    } catch (error) {
      console.error('Failed to update promo code:', error);
      Swal.fire(
        t('common.error'),
        error.data?.message || t('promoCodes.updateError'),
        'error'
      );
    }
  };

  if (isFetching) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!promoCode) {
    return null; // or show a "not found" message
  }

  return (
    <Box className="container add-promo-container w-100" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <Box bg={cardBg} className="add-promo-card shadow p-4 w-100" borderRadius="15px">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            {t('promoCodes.editPromoCode')}: {promoCode.code}
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
                  bg={inputBg}
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
                    bg={formData.type === 'FIXED' ? 'blue.100' : inputBg}
                  >
                    {t('promoCodes.fixedAmount')}
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleSelectType('PERCENTAGE')}
                    bg={formData.type === 'PERCENTAGE' ? 'blue.100' : inputBg}
                  >
                    {t('promoCodes.percentage')}
                  </MenuItem>
                </MenuList>
              </Menu>
            </FormControl>

            {/* Status Field (Final) */}
            {/* <FormControl>
              <FormLabel color={textColor} fontSize="sm" fontWeight="700">
                Status
              </FormLabel>
              <Box mt={2}>
                <Text fontSize="md" fontWeight="600">
                  {formData.isActive ? (
                    <Badge colorScheme="green" px={2} py={1} borderRadius="md">
                      Active
                    </Badge>
                  ) : (
                    <Badge colorScheme="red" px={2} py={1} borderRadius="md">
                      Inactive
                    </Badge>
                  )}
                </Text>
              </Box>
            </FormControl> */}

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
                required
                mt={'8px'}
                min="1"
                color={textColor}
                bg={inputBg}
                dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
              />
            </FormControl>
            <FormControl>
              <FormLabel color={textColor} fontSize="sm" fontWeight="700">
                {t('promoCodes.status')}
                <span className="text-danger mx-1">*</span>
              </FormLabel>
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  width="100%"
                  bg={inputBg}
                  border="1px solid #ddd"
                  borderRadius="md"
                  _hover={{ bg: 'gray.200' }}
                  textAlign="left"
                  mt={'8px'}
                  dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                >
                  {formData.isActive == true ? t('common.active') : t('common.inactive')}
                </MenuButton>
                <MenuList width="100%">
                  <MenuItem
                    onClick={() => handleSelectStatus(true)}
                    bg={formData.isActive == 'false' ? 'blue.100' : inputBg}
                  >
                    {t('common.active')}
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleSelectStatus(false)}
                    bg={formData.isActive == 'true' ? 'blue.100' : inputBg}
                  >
                    {t('common.inactive')}
                  </MenuItem>
                </MenuList>
              </Menu>
            </FormControl>
          </Grid>

          {/* Action Buttons */}
          <Flex justify="center" mt={8} gap={4}>
            <Button
              type="button"
              onClick={() => navigate('/admin/promo-codes')}
              colorScheme="gray"
              size="sm"
              px={8}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              size="sm"
              px={8}
              isLoading={isUpdating}
              loadingText={t('common.updating')}
            >
              {t('common.update')}
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default EditPromoCode;
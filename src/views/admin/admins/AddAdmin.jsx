import React, { useState, useEffect } from 'react';
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  useColorModeValue,
  Input,
  Box,
  Flex,
} from '@chakra-ui/react';
import { ChevronDownIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import './admins.css';
import { useGetRolesQuery } from 'api/roleSlice';
import { useCreateUserMutation } from 'api/userSlice';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FormWrapper from 'components/FormWrapper';

const AddAdmin = () => {
  const { t, i18n } = useTranslation();
  const { data: roles, isLoading, isError, error } = useGetRolesQuery({ page: 1, limit: 100, search: '' });
  const [createAdmin, { isLoading: isCreating }] = useCreateUserMutation();
  const navigate = useNavigate();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const inputBorder = useColorModeValue('gray.300', 'gray.600');
  const [selectedRole, setSelectedRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    roleId: '',
  });

  // Debug logging
  useEffect(() => {
    console.log('Roles data:', roles);
    console.log('Roles data structure:', JSON.stringify(roles, null, 2));
    console.log('Roles loading:', isLoading);
    console.log('Roles error:', isError);
    console.log('Roles error details:', error);
  }, [roles, isLoading, isError, error]);

  // Update selectedRole when language changes
  useEffect(() => {
    if (!formData.roleId) {
      setSelectedRole(t('admin.selectRole'));
    }
  }, [i18n.language, t, formData.roleId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For phone number, only allow numeric characters
    if (name === 'phoneNumber') {
      const numericValue = value.replace(/[^\d]/g, '');
      setFormData({
        ...formData,
        [name]: numericValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSelect = (role) => {
    setSelectedRole(role.name);
    setFormData({ ...formData, roleId: role.id });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  // Validate phone number format (basic example)
  if (!formData.phoneNumber || !/^[\d\s\+\-\(\)]{10,15}$/.test(formData.phoneNumber)) {
    Swal.fire({
      icon: 'error',
      title: t('messages.error'),
      text: t('admin.invalidPhoneNumber'),
      confirmButtonText: t('common.ok'),
    });
    return;
  }
    // Validate role selection
    if (!formData.roleId) {
      Swal.fire({
        icon: 'error',
        title: t('messages.error'),
        text: t('admin.selectRoleError'),
        confirmButtonText: t('common.ok'),
      });
      return;
    }

    try {
      const response = await createAdmin(formData).unwrap();
      Swal.fire({
        icon: 'success',
        title: t('messages.success'),
        text: t('admin.addSuccess'),
        confirmButtonText: t('common.ok'),
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/admin/undefined/admins'); // Redirect to the admins page after successful submission
        }
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('messages.error'),
        text: error.data?.message || t('admin.addError'),
        confirmButtonText: t('common.ok'),
      });
    }
  };

  return (
    <Flex justify="center" p="20px" mt={'80px'}>
      <Box w="100%" p="6" boxShadow="md" borderRadius="lg" bg={cardBg}>
        <Text color={textColor} fontSize="22px" fontWeight="700" mb="20px">
          {t('admin.addNewAdmin')}
        </Text>

        <FormWrapper>
          <form onSubmit={handleSubmit} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>
            {/* Name Field */}
            <Box mb="3">
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1" textAlign={i18n.language === 'ar' ? 'right' : 'left'}>
                {t('admin.name')} <span style={{ color: 'red' }}>*</span>
              </Text>
              <Input
                type="text"
                name="name"
                placeholder={t('admin.enterName')}
                value={formData.name}
                onChange={handleInputChange}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
              />
            </Box>

            {/* Email Field */}
            <Box mb="3">
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1" textAlign={i18n.language === 'ar' ? 'right' : 'left'}>
                {t('admin.email')} <span style={{ color: 'red' }}>*</span>
              </Text>
              <Input
                type="email"
                name="email"
                placeholder={t('admin.enterEmail')}
                value={formData.email}
                onChange={handleInputChange}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
              />
            </Box>
            {/* Phone Field */}
            <Box mb="3">
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1" textAlign={i18n.language === 'ar' ? 'right' : 'left'}>
                {t('admin.phone')} <span style={{ color: 'red' }}>*</span>
              </Text>
              <Input
                type="tel"  // Changed from "text" to "tel" for better mobile keyboard
                name="phoneNumber"
                onChange={handleInputChange}
                value={formData.phoneNumber}
                placeholder={t('admin.enterPhone')}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
                pattern="[\d\s\+\-\(\)]{10,15}"  // Basic HTML5 validation
              />
            </Box>

            {/* Password Field */}
            <Box mb="3">
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1" textAlign={i18n.language === 'ar' ? 'right' : 'left'}>
                {t('admin.password')} <span style={{ color: 'red' }}>*</span>
              </Text>
              <Flex align="center">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder={t('admin.enterPassword')}
                  value={formData.password}
                  onChange={handleInputChange}
                  bg={inputBg}
                  color={textColor}
                  borderColor={inputBorder}
                  required
                />
                <Button
                  ml="2"
                  onClick={() => setShowPassword(!showPassword)}
                  variant="ghost"
                >
                  {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </Flex>
            </Box>

            {/* Role Dropdown */}
            <Box mb="3">
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1" textAlign={i18n.language === 'ar' ? 'right' : 'left'}>
                {t('admin.role')} <span style={{ color: 'red' }}>*</span>
              </Text>
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  width="100%"
                  bg={inputBg}
                  borderColor={inputBorder}
                  borderRadius="md"
                  _hover={{ bg: 'gray.200' }}
                  textAlign="left"
                  color={textColor}
                  className="menu-button role-dropdown"
                  isLoading={isLoading}
                  loadingText={t('messages.loading')}
                >
                  {selectedRole}
                </MenuButton>
                <MenuList className="role-dropdown">
                  {isLoading ? (
                    <MenuItem disabled color="gray.500">
                      {t('messages.loading')}
                    </MenuItem>
                  ) : isError ? (
                    <MenuItem disabled color="red.500">
                      {t('admin.errorLoadingData')}
                    </MenuItem>
                  ) : roles?.data && Array.isArray(roles.data) && roles.data.length > 0 ? (
                    roles.data.map((role) => (
                      <MenuItem
                        key={role.id}
                        onClick={() => handleSelect(role)}
                        color={textColor}
                      >
                        {role.name}
                      </MenuItem>
                    ))
                  ) : roles?.data?.data && Array.isArray(roles.data.data) && roles.data.data.length > 0 ? (
                    roles.data.data.map((role) => (
                      <MenuItem
                        key={role.id}
                        onClick={() => handleSelect(role)}
                        color={textColor}
                      >
                        {role.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled color="gray.500">
                      {t('common.noData')}
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
            </Box>

            {/* Submit Button */}
            <Flex justify="flex-end" gap={4}>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/undefined/admins')}
                colorScheme="red"
                className="admin-button"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isCreating}
                loadingText={t('messages.creating')}
                className="admin-button"
              >
                {t('admin.createAdmin')}
              </Button>
            </Flex>
          </form>
        </FormWrapper>
      </Box>
    </Flex>
  );
};

export default AddAdmin;
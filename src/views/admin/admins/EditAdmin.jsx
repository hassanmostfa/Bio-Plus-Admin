import React, { useState, useEffect } from 'react';
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  useColorModeValue,
  Flex,
  Box,
  Input,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import './admins.css';
import { useGetRolesQuery } from 'api/roleSlice';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';
import { useUpdateUserMutation } from 'api/userSlice';
import { useGetUserProfileQuery } from 'api/userSlice';
import { useTranslation } from 'react-i18next';
import FormWrapper from 'components/FormWrapper';

const EditAdmin = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const { data: roles, isLoading: isRolesLoading, isError: isRolesError } = useGetRolesQuery();
  const { data: admin, isLoading: isAdminLoading, isError: isAdminError } = useGetUserProfileQuery(id);
  const [editAdmin, { isLoading: isCreating }] = useUpdateUserMutation();
  const navigate = useNavigate();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue("white", "navy.700");
  const inputBg = useColorModeValue("gray.100", "gray.700");
  const inputBorder = useColorModeValue("gray.300", "gray.600");
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    roleId: '',
  });

  // Update formData when admin data is available
  useEffect(() => {
    if (admin?.data) {
      setFormData({
        name: admin.data.name,
        email: admin.data.email,
        password: '', // Password is not pre-filled for security reasons
        phoneNumber: admin.data.phoneNumber,
        roleId: admin.data.roleId,
      });
      // Set the selected role name
      const role = roles?.data?.find((r) => r.id === admin.data.roleId);
      if (role) {
        setSelectedRole(role.name);
      } else {
        setSelectedRole(t('admin.selectRole'));
      }
    }
  }, [admin, roles, t]);

  // Update selectedRole when language changes
  useEffect(() => {
    if (!formData.roleId) {
      setSelectedRole(t('admin.selectRole'));
    }
  }, [i18n.language, t, formData.roleId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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
    // Create a copy of formData
    const dataToSend = { ...formData };

    // Remove the password field if it's empty
    if (!dataToSend.password) {
      delete dataToSend.password;
    }

    try {
      const response = await editAdmin({ id, user: dataToSend }).unwrap();
      Swal.fire({
        icon: 'success',
        title: t('messages.success'),
        text: t('admin.updateSuccess'),
        confirmButtonText: t('common.ok'),
        
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(`/admin/undefined/admins`); // Redirect to the admins page after successful submission
        }
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('messages.error'),
        text: error.data?.message || t('admin.updateError'),
        confirmButtonText: t('common.ok'),
      });
    }
  };

  if (isAdminLoading || isRolesLoading) {
    return <div>{t('messages.loading')}</div>;
  }

  if (isAdminError || isRolesError) {
    return <div>{t('admin.loadError')}</div>;
  }

  return (
    <Flex justify="center" p="20px" mt={"80px"}>
      <Box w="100%" p="6" boxShadow="md" borderRadius="lg" bg={cardBg}>
        <Text color={textColor} fontSize="22px" fontWeight="700" mb="20px">
          {t('admin.editAdmin')}
        </Text>

        <FormWrapper>
          <form onSubmit={handleSubmit} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>
            {/* Name Field */}
            <Box mb="3" mt={"20px"}>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1" textAlign={i18n.language === 'ar' ? 'right' : 'left'}>
                {t('admin.name')} <span style={{ color: "red" }}>*</span>
              </Text>
              <Input
                type="text"
                name="name"
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                placeholder={t('admin.enterName')}
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Box>

            {/* Email Field */}
            <Box mb="3">
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1" textAlign={i18n.language === 'ar' ? 'right' : 'left'}>
                {t('admin.email')} <span style={{ color: "red" }}>*</span>
              </Text>
              <Input
                type="email"
                name="email"
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                placeholder={t('admin.enterEmail')}
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Box>

            {/* Password Field */}
            <Box mb="3">
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1" textAlign={i18n.language === 'ar' ? 'right' : 'left'}>
                {t('admin.password')}
              </Text>
              <Input
                type="password"
                name="password"
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                placeholder={t('admin.enterNewPassword')}
                value={formData.password}
                onChange={handleInputChange}
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

            {/* Role Dropdown */}
            <Box mb="3">
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
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
                >
                  {selectedRole}
                </MenuButton>
                <MenuList className="role-dropdown">
                  {roles?.data?.map((role) => (
                    <MenuItem
                      key={role.id}
                      onClick={() => handleSelect(role)}
                      color={textColor}
                    >
                      {role.name}
                    </MenuItem>
                  ))}
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
                loadingText={t('messages.updating')}
                className="admin-button"
              >
                {t('admin.updateAdmin')}
              </Button>
            </Flex>
          </form>
        </FormWrapper>
      </Box>
    </Flex>
  );
};

export default EditAdmin;
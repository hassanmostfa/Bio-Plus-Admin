import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { IoMdArrowBack, IoIosArrowDown } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useCreateUserMutation } from 'api/clientSlice';
import { useTranslation } from 'react-i18next';


const AddUser = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('Select Gender');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [addUser] = useCreateUserMutation();
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const handleCancel = () => {
    setName('');
    setEmail('');
    setGender(t('user.gender'));
    setPhone('');
    setPassword('');
  };

  const handleSubmit = async () => {
    if (!phone || !/^[\d\s\+\-\(\)]{10,15}$/.test(phone)) {
      Swal.fire({
        icon: 'error',
        title: t('common.error'),
        text: t('forms.invalidPhone'),
        confirmButtonText: t('common.ok'),
      });
      return;
    }
    if (!name || !email || gender === t('user.gender') || !phone || !password) {
      Swal.fire(t('common.error'), t('forms.required'), 'error');
      return;
    }
    try {
      const userData = {
        name,
        email,
        phoneNumber: phone,
        gender: gender.toUpperCase(),
        password
      };
      const response = await addUser(userData).unwrap();
      Swal.fire(t('common.success'), t('user.addedSuccess'), 'success');
      navigate('/admin/users');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('common.error'),
        text: error.data?.message || t('user.addFailed'),
        confirmButtonText: t('common.ok'),
      });
    }
  };

  return (
    <Box className="container add-admin-container w-100">
      <Box bg={cardBg} className="add-admin-card shadow p-4 w-100" borderRadius="lg">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            mb="20px !important"
            lineHeight="100%"
            textAlign={isRTL ? 'right' : 'left'}
          >
            {t('common.add')} {t('common.users')}
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
        <form dir={isRTL ? 'rtl' : 'ltr'} style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {/* Name */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700" mb={1} textAlign={isRTL ? 'right' : 'left'}>
              {t('common.name')} <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="text"
              placeholder={t('forms.enterName')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              mt={'8px'}
              bg={inputBg}
              color={textColor}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
          {/* Email */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700" mb={1} textAlign={isRTL ? 'right' : 'left'}>
              {t('common.email')} <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="email"
              placeholder={t('forms.enterEmail')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              mt={'8px'}
              bg={inputBg}
              color={textColor}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
          {/* Gender */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700" mb={1} textAlign={isRTL ? 'right' : 'left'}>
              {t('user.gender')} <span className="text-danger mx-1">*</span>
            </Text>
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<IoIosArrowDown />}
                width="100%"
                bg={inputBg}
                border="1px solid #ddd"
                borderRadius="md"
                _hover={{ bg: 'gray.200' }}
                textAlign="left"
                fontSize={'sm'}
                dir="ltr"
              >
                {gender}
              </MenuButton>
              <MenuList width="100%" dir="ltr">
                <MenuItem
                  _hover={{ bg: '#38487c', color: 'white' }}
                  onClick={() => setGender(t('user.male'))}
                >
                  {t('user.male')}
                </MenuItem>
                <MenuItem
                  _hover={{ bg: '#38487c', color: 'white' }}
                  onClick={() => setGender(t('user.female'))}
                >
                  {t('user.female')}
                </MenuItem>
              </MenuList>
            </Menu>
          </div>
          {/* Phone */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700" mb={1} textAlign={isRTL ? 'right' : 'left'}>
              {t('common.phone')} <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="tel"
              placeholder={t('forms.enterPhone')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              mt={'8px'}
              bg={inputBg}
              color={textColor}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
          {/* Password */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700" mb={1} textAlign={isRTL ? 'right' : 'left'}>
              {t('auth.password')} <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="password"
              placeholder={t('forms.enterPassword')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              mt={'8px'}
              bg={inputBg}
              color={textColor}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
          {/* Buttons */}
          <Flex justify="center" mt={4}>
            <Button
              variant="outline"
              colorScheme="red"
              onClick={handleCancel}
              mr={2}
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
              onClick={handleSubmit}
              mx={2}
            >
              {t('common.save')}
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default AddUser;
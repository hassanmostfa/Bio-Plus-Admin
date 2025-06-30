import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Input,
  Text,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa6';
import { IoMdArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { useAddClinicMutation } from 'api/clinicSlice';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../contexts/LanguageContext';

const AddClinic = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [arabicName, setArabicName] = useState('');
  const [addClinic, { isLoading }] = useAddClinicMutation();
  const [locations, setLocations] = useState([
    {
      name: '',
      arabicName: '',
    },
  ]);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const inputBorder = useColorModeValue('gray.300', 'gray.600');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const handleCancel = () => {
    setName('');
    setPassword('');
    setFromTime('');
    setToTime('');
    setEmail('');
    setArabicName('');
    setLocations([{ name: '', arabicName: '' }]);
  };

  const handleSend = async () => {
    // Format time to AM/PM format
    const formatTime = (timeString) => {
      if (!timeString) return '';
      const [hours, minutes] = timeString.split(':');
      const hourNum = parseInt(hours, 10);
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      const twelveHour = hourNum % 12 || 12;
      return `${twelveHour}:${minutes} ${ampm}`;
    };

    const clinicData = {
      name,
      password,
      fromTime: formatTime(fromTime),
      toTime: formatTime(toTime),
      email,
      isActive: true,
      translations: [
        {
          languageId: 'ar',
          name: arabicName,
        },
      ],
      locations: locations.map((location) => ({
        name: location.name,
        isActive: true,
        translations: [
          {
            languageId: 'ar',
            name: location.arabicName,
          },
        ],
      })),
    };

    try {
      const response = await addClinic(clinicData).unwrap();
      Swal.fire(t('clinics.success'), t('clinics.clinicAddedSuccessfully'), 'success');
      navigate('/admin/clinics');
    } catch (error) {
      if (error.data?.errors) {
        const errorMessages = {};

        error.data.errors.forEach((err) => {
          const fieldMap = {
            name: t('clinics.englishName'),
            'translations.0.name': t('clinics.arabicName'),
            password: t('clinics.password'),
            fromTime: t('clinics.openingTime'),
            toTime: t('clinics.closingTime'),
            'locations.0.name': t('clinics.locationEnglishName'),
            'locations.0.translations.0.name': t('clinics.locationArabicName'),
          };

          const fieldName = fieldMap[err.field] || err.field;

          if (!errorMessages[fieldName]) {
            errorMessages[fieldName] = [];
          }
          errorMessages[fieldName].push(err.message);
        });

        let errorList = '';
        Object.entries(errorMessages).forEach(([field, messages]) => {
          errorList += `<strong>${field}:</strong><ul>`;
          messages.forEach((msg) => {
            errorList += `<li>${msg}</li>`;
          });
          errorList += '</ul>';
        });

        Swal.fire({
          title: t('clinics.validationError'),
          html: errorList,
          icon: 'error',
        });
      } else {
        Swal.fire(
          t('clinics.error'),
          error.data?.message || t('clinics.failedToAddClinic'),
          'error',
        );
      }
    }
  };

  const handleAddLocation = () => {
    setLocations([...locations, { name: '', arabicName: '' }]);
  };

  const handleLocationChange = (index, field, value) => {
    const newLocations = [...locations];
    newLocations[index][field] = value;
    setLocations(newLocations);
  };

  const handleDeleteLocation = (index) => {
    if (locations.length > 1) {
      const newLocations = locations.filter((_, i) => i !== index);
      setLocations(newLocations);
    }
  };

  return (
    <Flex justify="center" p="20px" mt="80px">
      <Box w="100%" p="6" boxShadow="md" borderRadius="lg" bg={cardBg}>
        <Flex justify="space-between" align="center" mb="20px">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            {t('clinics.addNewClinic')}
          </Text>
          <Button
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('clinics.back')}
          </Button>
        </Flex>

        <form dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            {/* Name Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('clinics.englishName')}
                <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </Text>
              <Input
                type="text"
                placeholder={t('clinics.enterClinicNameEn')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
                mt="8px"
              />
            </Box>

            {/* Arabic Name Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('clinics.arabicName')}
                <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </Text>
              <Input
                type="text"
                placeholder={t('clinics.enterClinicNameAr')}
                value={arabicName}
                onChange={(e) => setArabicName(e.target.value)}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
                mt="8px"
                dir="rtl"
              />
            </Box>

            {/* From Time Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('clinics.openingTime')}
                <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </Text>
              <Input
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
                mt="8px"
              />
            </Box>
            
            {/* To Time Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('clinics.closingTime')}
                <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </Text>
              <Input
                type="time"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
                mt="8px"
              />
            </Box>

            {/* Email Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('clinics.email')}
                <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </Text>
              <Input
                type="email"
                placeholder={t('clinics.enterEmail')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
                mt="8px"
              />
            </Box>

            {/* Password Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('clinics.password')}
                <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </Text>
              <Input
                type="password"
                placeholder={t('clinics.enterPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
                mt="8px"
              />
            </Box>

            {/* Locations Field */}
            <Box gridColumn="1 / -1">
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('clinics.locations')}
                <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </Text>

              {locations.map((location, index) => (
                <Box
                  key={index}
                  mb={4}
                  p={4}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="md"
                  bg={inputBg}
                >
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    {/* Location Name */}
                    <Box>
                      <Text fontSize="sm" fontWeight="600" mb={1} color={textColor}>
                        {t('clinics.locationNameEn')}
                      </Text>
                      <Input
                        type="text"
                        placeholder={t('clinics.enterLocationName')}
                        value={location.name}
                        onChange={(e) =>
                          handleLocationChange(index, 'name', e.target.value)
                        }
                        bg={cardBg}
                        color={textColor}
                        borderColor={inputBorder}
                        required
                      />
                    </Box>

                    {/* Arabic Location Name */}
                    <Box>
                      <Text fontSize="sm" fontWeight="600" mb={1} color={textColor}>
                        {t('clinics.locationNameAr')}
                      </Text>
                      <Input
                        type="text"
                        placeholder={t('clinics.enterLocationNameAr')}
                        value={location.arabicName}
                        onChange={(e) =>
                          handleLocationChange(
                            index,
                            'arabicName',
                            e.target.value,
                          )
                        }
                        bg={cardBg}
                        color={textColor}
                        borderColor={inputBorder}
                        required
                        dir="rtl"
                      />
                    </Box>

                    {/* Delete Button */}
                    <Box
                      display="flex"
                      justifyContent="flex-end"
                      alignItems="center"
                      gridColumn="1 / -1"
                    >
                      {locations.length > 1 && (
                        <Button
                          leftIcon={<FaTrash />}
                          colorScheme="red"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteLocation(index)}
                        >
                          {t('clinics.removeLocation')}
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Box>
              ))}

              <Button
                variant="outline"
                colorScheme="teal"
                size="sm"
                mt={2}
                onClick={handleAddLocation}
              >
                {t('clinics.addAnotherLocation')}
              </Button>
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
              {t('clinics.cancel')}
            </Button>
            <Button
              colorScheme="brandScheme"
              color="white"
              fontSize="sm"
              fontWeight="500"
              borderRadius="70px"
              px="24px"
              py="5px"
              onClick={handleSend}
              width="120px"
              isLoading={isLoading}
            >
              {t('clinics.save')}
            </Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  );
};

export default AddClinic;
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Input,
  Text,
  useColorModeValue,
  Icon,
  Switch
} from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa6';
import { IoMdArrowBack } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import { useUpdateClinicMutation, useGetClinicQuery } from 'api/clinicSlice';
import Swal from 'sweetalert2';

const EditClinic = () => {
  const { id } = useParams();
  const { data, isLoading, refetch } = useGetClinicQuery(id);
  const clinicData = data?.data ?? {};
  const [updateClinic, { isLoading: isUpdating }] = useUpdateClinicMutation();
  
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [arabicName, setArabicName] = useState('');
  const [locations, setLocations] = useState([]);
  const [isActive, setIsActive] = useState(clinicData?.isActive ?? true);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const inputBorder = useColorModeValue('gray.300', 'gray.600');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const navigate = useNavigate();

  // Initialize form with clinic data
  useEffect(() => {
    if (clinicData) {
      setName(clinicData.name);
      setEmail(clinicData.email);
      setFromTime(formatTimeForInput(clinicData.fromTime));
      setToTime(formatTimeForInput(clinicData.toTime));
      
      // Set Arabic name from translations
      const arabicTranslation = clinicData.translations?.find(t => t.languageId === 'ar');
      setArabicName(arabicTranslation?.name || '');
      
      // Set locations with their translations
      if (clinicData.locations) {
        setLocations(clinicData.locations.map(location => ({
          id: location.id,
          name: location.name,
          arabicName: location.translations?.find(t => t.languageId === 'ar')?.name || '',
          isActive: location.isActive
        })));
      }
      setIsActive(clinicData?.isActive ?? true);
    }
  }, [clinicData]);

  useEffect(() => {
    refetch();
  }, []);

  // Convert AM/PM time to 24-hour format for input
  const formatTimeForInput = (timeString) => {
    if (!timeString) return '';
    const [time, period] = timeString.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (period === 'PM' && hours !== '12') {
      hours = parseInt(hours, 10) + 12;
    } else if (period === 'AM' && hours === '12') {
      hours = '00';
    }
    
    return `${hours}:${minutes}`;
  };

  // Convert 24-hour format to AM/PM for API
  const formatTimeForAPI = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hourNum = parseInt(hours, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const twelveHour = hourNum % 12 || 12;
    return `${twelveHour}:${minutes} ${ampm}`;
  };

  const handleCancel = () => {
    navigate('/admin/clinics');
  };

  const handleSend = async () => {
    const clinicUpdateData = {
      name,
      email,
      fromTime: formatTimeForAPI(fromTime),
      toTime: formatTimeForAPI(toTime),
      ...(password && { password }),
      isActive,
      translations: [
        {
          languageId: 'ar',
          name: arabicName,
        },
      ],
      locations: locations.map((location) => ({
        ...(location.id && { id: location.id }),
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
      const response = await updateClinic({ id, data: clinicUpdateData }).unwrap();
      Swal.fire('Success!', 'Clinic updated successfully.', 'success');
      navigate('/admin/clinics');
    } catch (error) {
      if (error.data?.errors) {
        const errorMessages = {};
        error.data.errors.forEach((err) => {
          const fieldMap = {
            name: 'English Name',
            'translations.0.name': 'Arabic Name',
            password: 'Password',
            fromTime: 'Opening Time',
            toTime: 'Closing Time',
            'locations.0.name': 'Location English Name',
            'locations.0.translations.0.name': 'Location Arabic Name',
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
          title: 'Validation Error!',
          html: errorList,
          icon: 'error',
        });
      } else {
        Swal.fire(
          'Error!',
          error.data?.message || 'Failed to update clinic.',
          'error',
        );
      }
    }
  };

  const handleAddLocation = () => {
    setLocations([...locations, { name: '', arabicName: '', isActive: true }]);
  };

  const handleLocationChange = (index, field, value) => {
    const newLocations = [...locations];
    newLocations[index][field] = value;
    setLocations(newLocations);
  };

  const handleDeleteLocation = (index) => {
    const newLocations = [...locations];
    newLocations.splice(index, 1);
    setLocations(newLocations);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Flex justify="center" p="20px" mt="80px">
      <Box w="100%" p="6" boxShadow="md" borderRadius="lg" bg={cardBg}>
        <Flex justify="space-between" align="center" mb="20px">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            Edit Clinic
          </Text>
          <Button
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            Back
          </Button>
        </Flex>

        <form>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            {/* Name Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                English Name
                <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </Text>
              <Input
                type="text"
                placeholder="Enter Clinic Name (English)"
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
                Arabic Name
                <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </Text>
              <Input
                type="text"
                placeholder="أدخل اسم العيادة"
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

            {/* Email Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                Email
                <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </Text>
              <Input
                type="email"
                placeholder="Enter Email"
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
                Password (leave blank to keep current)
              </Text>
              <Input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                mt="8px"
              />
            </Box>

            {/* From Time Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                Opening Time
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
                Closing Time
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

            {/* Active Status Toggle */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                Active
              </Text>
              <Switch
                isChecked={isActive}
                onChange={() => setIsActive(!isActive)}
                colorScheme="teal"
                size="md"
                mt="8px"
              />
            </Box>

            {/* Locations Field */}
            <Box gridColumn="1 / -1">
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                Locations
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
                        Location Name (English)
                      </Text>
                      <Input
                        type="text"
                        placeholder="Enter location name"
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
                        Location Name (Arabic)
                      </Text>
                      <Input
                        type="text"
                        placeholder="أدخل اسم الموقع"
                        value={location.arabicName}
                        onChange={(e) =>
                          handleLocationChange(index, 'arabicName', e.target.value)
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
                      <Button
                        leftIcon={<FaTrash />}
                        colorScheme="red"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteLocation(index)}
                      >
                        Remove Location
                      </Button>
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
                Add New Location
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
              Cancel
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
              isLoading={isUpdating}
              loadingText="Saving..."
            >
              Save Changes
            </Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  );
};

export default EditClinic;
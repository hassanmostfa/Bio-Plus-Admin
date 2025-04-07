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
  const navigate = useNavigate();

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
      isActive: true, // Automatically set to true
      translations: [
        {
          languageId: 'ar',
          name: arabicName,
        },
      ],
      locations: locations.map((location) => ({
        name: location.name,
        isActive: true, // Automatically set to true
        translations: [
          {
            languageId: 'ar',
            name: location.arabicName,
          },
        ],
      })),
    };

    try {
      const response = await addClinic(clinicData).unwrap(); // Send data to the API
      Swal.fire('Success!', 'Brand added successfully.', 'success');
      navigate('/admin/clinics'); // Redirect to the brands page
    } catch (error) {
      if (error.data?.errors) {
        // Group errors by field for better display
        const errorMessages = {};

        error.data.errors.forEach((err) => {
          // Map field names to more user-friendly labels
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

        // Format error messages for display
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
          error.data?.message || 'Failed to add clinic.',
          'error',
        );
      }
    }
  };

  const handleAddLocation = () => {
    setLocations([...locations, { name: '', arabicName: '' }]);
  };

  const handleLocationChange = (index, field, value) => {
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
            Add New Clinic
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
        <form>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            {/* Name Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                English Name
                <span className="text-danger mx-1">*</span>
              </Text>
              <Input
                type="text"
                placeholder="Enter Clinic Name (English)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                mt={'8px'}
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
                placeholder="أدخل اسم العيادة"
                value={arabicName}
                onChange={(e) => setArabicName(e.target.value)}
                required
                mt={'8px'}
                dir="rtl"
              />
            </Box>

            {/* From Time Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Opening Time
                <span className="text-danger mx-1">*</span>
              </Text>
              <Input
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                required
                mt={'8px'}
              />
            </Box>
            {/* Ar Name Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Ar-Name
                <span className="text-danger mx-1">*</span>
              </Text>
              <Input
                type="text"
                id="name"
                placeholder="Enter Clinic Name"
                value={ar_name}
                onChange={(e) => setArName(e.target.value)}
                required
                mt={'8px'}
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
                placeholder="أدخل اسم العيادة"
                value={arabicName}
                onChange={(e) => setArabicName(e.target.value)}
                required
                mt={'8px'}
                dir="rtl"
              />
            </Box>

            {/* From Time Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Opening Time
                <span className="text-danger mx-1">*</span>
              </Text>
              <Input
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                required
                mt={'8px'}
              />
            </Box>

            {/* To Time Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Closing Time
                <span className="text-danger mx-1">*</span>
              </Text>
              <Input
                type="time"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                required
                mt={'8px'}
              />
            </Box>
            {/* Email Field */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Email
                <span className="text-danger mx-1">*</span>
              </Text>
              <Input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                mt={'8px'}
              />
            </Box>
            {/* Password Field */}
            <Box>
              
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Password
                <span className="text-danger mx-1">*</span>
              </Text>
              <Input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                mt={'8px'}
              />
            </Box>

            {/* Locations Field */}
            <Box gridColumn="1 / -1">
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Locations
                <span className="text-danger mx-1">*</span>
              </Text>

              {locations.map((location, index) => (
                <Box
                  key={index}
                  mb={4}
                  p={4}
                  border="1px solid #eee"
                  borderRadius="md"
                >
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    {/* Location Name */}
                    <Box>
                      <Text fontSize="sm" fontWeight="600" mb={1}>
                        Location Name (English)
                      </Text>
                      <Input
                        type="text"
                        placeholder="Enter location name"
                        value={location.name}
                        onChange={(e) =>
                          handleLocationChange(index, 'name', e.target.value)
                        }
                        required
                      />
                    </Box>

                    {/* Arabic Location Name */}
                    <Box>
                      <Text fontSize="sm" fontWeight="600" mb={1}>
                        Location Name (Arabic)
                      </Text>
                      <Input
                        type="text"
                        placeholder="أدخل اسم الموقع"
                        value={location.arabicName}
                        onChange={(e) =>
                          handleLocationChange(
                            index,
                            'arabicName',
                            e.target.value,
                          )
                        }
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
                          Remove Location
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
                Add Another Location
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
              variant="darkBrand"
              color="white"
              fontSize="sm"
              fontWeight="500"
              borderRadius="70px"
              px="24px"
              py="5px"
              variant="darkBrand"
              color="white"
              fontSize="sm"
              fontWeight="500"
              borderRadius="70px"
              px="24px"
              py="5px"
              onClick={handleSend}
              width="120px"
            >
              Save
            </Button>
          </Flex>
        </form>
      </div>
    </div>
  );
};

export default AddClinic;

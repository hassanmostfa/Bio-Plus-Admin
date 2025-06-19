import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
  Spinner,
  FormControl,
  FormLabel,
  Switch,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { IoMdArrowBack } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetUsersQuery, useUpdateUserProfileMutation } from 'api/clientSlice';
import Swal from 'sweetalert2';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');

  // Fetch all users to find the one to edit (or ideally, fetch a single user endpoint)
  // Note: Fetching all users to find one by ID is inefficient. A dedicated getUserById query is preferred.
  const { data: usersResponse, isLoading: isFetching , refetch } = useGetUsersQuery({});
  const [updateUserProfile, { isLoading }] = useUpdateUserProfileMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  });

    // Trigger refetch when component mounts (navigates to)
  React.useEffect(() => {
    if (!isFetching) {
      refetch();
    }
  }, [refetch, isFetching]);

  
  // Find and initialize the user data
  useEffect(() => {
    if (usersResponse?.data) {
      const userToEdit = usersResponse.data.find(user => user.id === id);
      if (userToEdit) {
        setFormData({
          name: userToEdit.name || '',
          email: userToEdit.email || '',
          phoneNumber: userToEdit.phoneNumber || '',
        });
      } else {
        Swal.fire('Error!', 'User not found.', 'error');
        navigate('/admin/users');
      }
    }
  }, [usersResponse, id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev, [
        name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      // Include other profile fields if needed and supported by the API
    };

    try {
      await updateUserProfile({ id, data: userData }).unwrap();
      Swal.fire('Success!', 'User updated successfully.', 'success');
      navigate('/admin/users');
    } catch (error) {
      console.error('Failed to update user:', error);
      Swal.fire(
        'Error!',
        error.data?.message || 'Failed to update user.',
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

  return (
    <Box w="100%" className="container add-admin-container w-100">
      <Box bg={cardBg} className="add-admin-card shadow p-4 w-100" borderRadius="lg">
        <Flex justifyContent="space-between" align="center" w="100%" mb="20px">
          <Text color={textColor} fontSize="22px" fontWeight="700" lineHeight="100%">
            Edit User
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
        </Flex>
        <form onSubmit={handleSubmit}>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            {/* Name Field */}
            <GridItem colSpan={2}>
              <FormControl>
                <FormLabel color={textColor} fontSize="sm" fontWeight="700">
                  Name
                </FormLabel>
                <Input
                  type="text"
                  name="name"
                  placeholder="Enter User Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  mt={'8px'}
                  bg={inputBg}
                  color={textColor}
                />
              </FormControl>
            </GridItem>

            {/* Email Field */}
            <GridItem>
              <FormControl>
                <FormLabel color={textColor} fontSize="sm" fontWeight="700">
                  Email
                </FormLabel>
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  mt={'8px'}
                  bg={inputBg}
                  color={textColor}
                />
              </FormControl>
            </GridItem>

            {/* Phone Number Field */}
            <GridItem>
              <FormControl>
                <FormLabel color={textColor} fontSize="sm" fontWeight="700">
                  Phone Number
                </FormLabel>
                <Input
                  type="text"
                  name="phoneNumber"
                  placeholder="Enter Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  mt={'8px'}
                  bg={inputBg}
                  color={textColor}
                />
              </FormControl>
            </GridItem>

          </Grid>

          {/* Action Buttons */}
          <Flex justify="start" mt={6} gap={4}>
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
              loadingText="Saving..."
            >
              Save Changes
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default EditUser; 
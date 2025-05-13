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

const EditAdmin = () => {
  const { id } = useParams();
  const { data: roles, isLoading: isRolesLoading, isError: isRolesError } = useGetRolesQuery();
  const { data: admin, isLoading: isAdminLoading, isError: isAdminError } = useGetUserProfileQuery(id);
  const [editAdmin, { isLoading: isCreating }] = useUpdateUserMutation();
  const navigate = useNavigate();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue("white", "navy.700");
  const inputBg = useColorModeValue("gray.100", "gray.700");
  const inputBorder = useColorModeValue("gray.300", "gray.600");
  const [selectedRole, setSelectedRole] = useState('Select a role');
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
      }
    }
  }, [admin, roles]);

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
        title: 'Error',
        text: 'Please enter a valid phone number (10-15 digits)',
        confirmButtonText: 'OK',
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
        title: 'Success',
        text: 'Admin updated successfully',
        confirmButtonText: 'OK',
        
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(`/admin/undefined/admins`); // Redirect to the admins page after successful submission
        }
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.data?.message || 'Failed to update admin',
        confirmButtonText: 'OK',
      });
    }
  };

  if (isAdminLoading || isRolesLoading) {
    return <div>Loading...</div>;
  }

  if (isAdminError || isRolesError) {
    return <div>Error loading data</div>;
  }

  return (
    <Flex justify="center" p="20px" mt={"80px"}>
      <Box w="100%" p="6" boxShadow="md" borderRadius="lg" bg={cardBg}>
        <Text color={textColor} fontSize="22px" fontWeight="700" mb="20px">
          Edit Admin
        </Text>

        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <Box mb="3" mt={"20px"}>
            <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
              Name <span style={{ color: "red" }}>*</span>
            </Text>
            <Input
              type="text"
              name="name"
              bg={inputBg}
              color={textColor}
              borderColor={inputBorder}
              placeholder="Enter Admin Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </Box>

          {/* Email Field */}
          <Box mb="3">
            <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
              Email <span style={{ color: "red" }}>*</span>
            </Text>
            <Input
              type="email"
              name="email"
              bg={inputBg}
              color={textColor}
              borderColor={inputBorder}
              placeholder="Enter email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </Box>

          {/* Password Field */}
          <Box mb="3">
            <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
              Password
            </Text>
            <Input
              type="password"
              name="password"
              bg={inputBg}
              color={textColor}
              borderColor={inputBorder}
              placeholder="Enter new password (leave blank to keep current)"
              value={formData.password}
              onChange={handleInputChange}
            />
          </Box>
           {/* Phone Field */}
          <Box mb="3">
            <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
              Phone <span style={{ color: 'red' }}>*</span>
            </Text>
            <Input
              type="tel"  // Changed from "text" to "tel" for better mobile keyboard
              name="phoneNumber"
              onChange={handleInputChange}
              value={formData.phoneNumber}
              placeholder="Enter Phone (e.g., +1234567890)"
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
              Role <span style={{ color: "red" }}>*</span>
            </Text>
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                width="100%"
                bg={inputBg}
                borderColor={inputBorder}
                borderRadius="md"
                _hover={{ bg: "gray.200" }}
                textAlign="left"
              >
                {selectedRole || "Select Role"}
              </MenuButton>
              <MenuList width="100%">
                {roles?.data?.map((role) => (
                  <MenuItem key={role.id} onClick={() => handleSelect(role)}>
                    {role.name}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </Box>

          {/* Submit Button */}
          <Button
            variant="solid"
            colorScheme="brandScheme"
            color={"white"}
            fontSize="sm"
            fontWeight="500"
            borderRadius="70px"
            px="24px"
            py="5px"
            type="submit"
            isLoading={isCreating}
            mt={"20px"}
          >
            Update Admin
          </Button>
        </form>
      </Box>
    </Flex>
  );
};

export default EditAdmin;
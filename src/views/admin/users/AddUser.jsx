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

const AddUser = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('Select Gender');
  const [phone, setPhone] = useState('');

  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('secondaryGray.900', 'white');

  const handleCancel = () => {
    setName('');
    setEmail('');
    setGender('Select Gender');
    setPhone('');
  };

  const handleSubmit = () => {
    if (!name || !email || gender === 'Select Gender' || !phone) {
      Swal.fire('Error!', 'Please fill all required fields.', 'error');
      return;
    }

    // Replace this with your API call to save the user
    console.log({ name, email, gender, phone });
    Swal.fire('Success!', 'User added successfully.', 'success');
    navigate('/admin/users');
  };

  return (
    <div className="container add-admin-container w-100">
      <Box bg={cardBg} className="add-admin-card shadow p-4 w-100">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            mb="20px !important"
            lineHeight="100%"
          >
            Add New User
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
          {/* Name */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Name <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="text"
              placeholder="Enter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              mt={'8px'}
              bg={inputBg}
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Email <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              mt={'8px'}
              bg={inputBg}
            />
          </div>

          {/* Gender */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Gender <span className="text-danger mx-1">*</span>
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
              >
                {gender}
              </MenuButton>
              <MenuList width="100%">
                <MenuItem
                  _hover={{ bg: '#38487c', color: 'white' }}
                  onClick={() => setGender('Male')}
                >
                  Male
                </MenuItem>
                <MenuItem
                  _hover={{ bg: '#38487c', color: 'white' }}
                  onClick={() => setGender('Female')}
                >
                  Female
                </MenuItem>
              </MenuList>
            </Menu>
          </div>

          {/* Phone */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Phone <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="tel"
              placeholder="Enter Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              mt={'8px'}
              bg={inputBg}
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
              onClick={handleSubmit}
            >
              Save
            </Button>
          </Flex>
        </form>
      </Box>
    </div>
  );
};

export default AddUser;

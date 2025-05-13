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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
} from '@chakra-ui/react';
import { IoMdArrowBack, IoIosArrowDown, IoIosAdd, IoIosRemove } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AddOrder = () => {
  const [date, setDate] = useState('');
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [pharmacy, setPharmacy] = useState('');
  const [status, setStatus] = useState('Select Status');
  const [payment, setPayment] = useState('Select Payment Method');
  const [total, setTotal] = useState('');
  const [orderItems, setOrderItems] = useState([{ product: '', quantity: '' }]);

  // Fake users data
  const fakeClients = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith'},
    { id: 3, name: 'Mohammed Ali' },
    { id: 4, name: 'Sarah Johnson' },
    { id: 5, name: 'Ahmed Hassan',},
  ];

  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('secondaryGray.900', 'white');

  const handleCancel = () => {
    setDate('');
    setCustomer('');
    setPhone('');
    setPharmacy('');
    setStatus('Select Status');
    setPayment('Select Payment Method');
    setTotal('');
    setOrderItems([{ product: '', quantity: '' }]);
  };

  const handleSubmit = () => {
    if (!date || !customer || !phone || !pharmacy || status === 'Select Status' || 
        payment === 'Select Payment Method' || !total || orderItems.some(item => !item.product || !item.quantity)) {
      Swal.fire('Error!', 'Please fill all required fields.', 'error');
      return;
    }

    const orderData = {
      date,
      customer,
      phone,
      pharmacy,
      status,
      payment,
      total,
      items: orderItems
    };

    console.log('Order data:', orderData);
    Swal.fire('Success!', 'Order added successfully.', 'success');
    navigate('/admin/orders');
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { product: '', quantity: '' }]);
  };

  const handleRemoveItem = (index) => {
    if (orderItems.length > 1) {
      const newItems = [...orderItems];
      newItems.splice(index, 1);
      setOrderItems(newItems);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
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
            Add New Order
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
          {/* Date */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Date <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              mt="8px"
              bg={inputBg}
            />
          </div>

          {/* Customer - Using fake clients data */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Customer <span className="text-danger mx-1">*</span>
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
                fontSize="sm"
              >
                {customer || 'Select Customer'}
              </MenuButton>
              <MenuList maxH="300px" overflowY="auto">
                {fakeClients.map(client => (
                  <MenuItem 
                    key={client.id} 
                    onClick={() => {
                      setCustomer(client.name);
                      setPhone(client.phone || '');
                    }}
                  >
                    {client.name}
                  </MenuItem>
                ))}
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
              mt="8px"
              bg={inputBg}
            />
          </div>

          {/* Pharmacy */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Pharmacy <span className="text-danger mx-1">*</span>
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
                fontSize="sm"
              >
                {pharmacy || 'Select Pharmacy'}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setPharmacy('Al Nahdi Pharmacy')}>Al Nahdi Pharmacy</MenuItem>
                <MenuItem onClick={() => setPharmacy('Al Dawaa Pharmacy')}>Al Dawaa Pharmacy</MenuItem>
                <MenuItem onClick={() => setPharmacy('White Pharmacy')}>White Pharmacy</MenuItem>
                <MenuItem onClick={() => setPharmacy('Tadawi Pharmacy')}>Tadawi Pharmacy</MenuItem>
              </MenuList>
            </Menu>
          </div>

          {/* Status */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Status <span className="text-danger mx-1">*</span>
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
                fontSize="sm"
              >
                {status}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setStatus('Pending')}>Pending</MenuItem>
                <MenuItem onClick={() => setStatus('Shipped')}>Shipped</MenuItem>
                <MenuItem onClick={() => setStatus('Delivered')}>Delivered</MenuItem>
                <MenuItem onClick={() => setStatus('Canceled')}>Canceled</MenuItem>
              </MenuList>
            </Menu>
          </div>

          {/* Payment */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Payment <span className="text-danger mx-1">*</span>
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
                fontSize="sm"
              >
                {payment}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setPayment('Paid')}>Paid</MenuItem>
                <MenuItem onClick={() => setPayment('Unpaid')}>Unpaid</MenuItem>
                <MenuItem onClick={() => setPayment('Refunded')}>Refunded</MenuItem>
              </MenuList>
            </Menu>
          </div>

          {/* Total */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Total <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="number"
              placeholder="Enter Total Amount"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              required
              mt="8px"
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

export default AddOrder;
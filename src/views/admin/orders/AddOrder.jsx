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
  useToast,
  Spinner,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { IoMdArrowBack, IoIosArrowDown, IoIosAdd, IoIosRemove } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useCreateOrderMutation } from 'api/orderSlice';
import { useGetUsersQuery } from 'api/clientSlice';
import { useGetPharmaciesQuery } from 'api/pharmacySlice';
import { useGetProductsQuery } from 'api/productSlice';
import { useGetPromocodesQuery } from 'api/promocodeSlice';
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const AddOrder = () => {
  const [userId, setUserId] = useState('');
  const [pharmacyId, setPharmacyId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [orderItems, setOrderItems] = useState([{ productId: '', quantity: '', discount: '', searchTerm: '' }]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [pharmacySearchTerm, setPharmacySearchTerm] = useState('');
  const [promoCodeId, setPromoCodeId] = useState('');
  const [selectedPromoCode, setSelectedPromoCode] = useState(null);
  const [promocodeSearchTerm, setPromocodeSearchTerm] = useState('');
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const { data: usersData, isLoading: isLoadingUsers } = useGetUsersQuery({ page: 1, limit: 1000000 });
  const { data: pharmaciesData, isLoading: isLoadingPharmacies } = useGetPharmaciesQuery({ page: 1, limit: 1000000 });
  const { data: productsData, isLoading: isLoadingProducts } = useGetProductsQuery({ 
    page: 1,
    limit: 1000000,
    ...(pharmacyId && { pharmacyId }),
  });
  const { data: promocodesData, isLoading: isLoadingPromocodes } = useGetPromocodesQuery({ page: 1, limit: 1000000 });

  const users = usersData?.data || [];
  console.log("Users : " , users);
  
  const pharmacies = pharmaciesData?.data?.items || [];
  const products = productsData?.data || [];
  const promocodes = promocodesData?.data || [];

  const navigate = useNavigate();
  const toast = useToast();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('secondaryGray.900', 'white');

  const handleCancel = () => {
    setUserId('');
    setPharmacyId('');
    setPaymentMethod('');
    setOrderDate('');
    setOrderItems([{ productId: '', quantity: '', discount: '', searchTerm: '' }]);
    setSelectedUser(null);
    setSelectedPharmacy(null);
    setCustomerSearchTerm('');
    setPharmacySearchTerm('');
    setPromoCodeId('');
    setSelectedPromoCode(null);
    setPromocodeSearchTerm('');
    setCalculatedTotal(0);
  };

  const handleSubmit = async () => {
    if (!userId || !pharmacyId || !paymentMethod || !orderDate || orderItems.some(item => !item.productId || item.quantity === '' || parseInt(item.quantity) <= 0)) {
      toast({
        title: t('addOrder.error'),
        description: t('addOrder.fillAllFields'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const itemsPayload = orderItems.map(item => ({
      productId: item.productId,
      quantity: parseInt(item.quantity, 10),
      ...(item.discount !== '' && item.discount != null && !isNaN(parseFloat(item.discount)) && { discount: parseFloat(item.discount) }),
    }));

    const orderData = {
      userId,
      pharmacyId,
      paymentMethod,
      orderDate,
      items: itemsPayload,
      ...(promoCodeId && { promoCodeId }),
    };

    try {
      await createOrder(orderData).unwrap();

      toast({
        title: t('addOrder.success'),
        description: t('addOrder.orderAddedSuccessfully'),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/admin/orders');
    } catch (err) {
      toast({
        title: t('addOrder.errorCreatingOrder'),
        description: err.data?.message || t('addOrder.errorOccurred'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Failed to create order:', err);
    }
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { productId: '', quantity: '', discount: '', searchTerm: '' }]);
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
    if (field === 'productId') {
        newItems[index].searchTerm = '';
    }
    setOrderItems(newItems);
  };

  React.useEffect(() => {
    let total = 0;
    orderItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product && item.quantity > 0) {
        const itemPrice = parseFloat(product.price) || 0;
        const quantity = parseInt(item.quantity, 10);
        const discount = parseFloat(item.discount) || 0;
        
        const priceAfterDiscount = itemPrice * (1 - discount / 100);
        total += priceAfterDiscount * quantity;
      }
    });
    setCalculatedTotal(total.toFixed(2));
  }, [orderItems, products]);

  if (isLoadingUsers || isLoadingPharmacies || isLoadingProducts || isLoadingPromocodes) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

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
            {t('addOrder.addNewOrder')}
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('addOrder.back')}
          </Button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          {/* Date */}
          <div className="mb-3">
            <FormControl isRequired>
              <FormLabel color={textColor} fontSize="sm" fontWeight="700">{t('addOrder.date')}</FormLabel>
              <Input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                required
                mt="8px"
                bg={inputBg}
                name="orderDate"
              />
            </FormControl>
          </div>

          {/* Customer - Using fake clients data */}
          <div className="mb-3">
            <FormControl isRequired>
              <FormLabel color={textColor} fontSize="sm" fontWeight="700">{t('addOrder.customer')}</FormLabel>
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
                  name="userId"
                >
                  {selectedUser ? selectedUser.name : t('addOrder.selectCustomer')}
                </MenuButton>
                <MenuList maxH="300px" overflowY="auto">
                  <Box px={3} py={2}>
                    <Input
                      placeholder={t('addOrder.searchCustomers')}
                      value={customerSearchTerm}
                      onChange={(e) => setCustomerSearchTerm(e.target.value)}
                      size="sm"
                      required={false}
                      name="customerSearch"
                    />
                  </Box>
                  {users
                    .filter(user =>
                      user.name && user.name.toLowerCase().includes(customerSearchTerm.toLowerCase())
                    )
                    .map(user => (
                      <MenuItem
                        key={user.id}
                        onClick={() => {
                          setUserId(user.id);
                          setSelectedUser(user);
                        }}
                      >
                        {user.name}
                      </MenuItem>
                    ))}
                </MenuList>
              </Menu>
            </FormControl>
          </div>

          {/* Pharmacy */}
          <div className="mb-3">
            <FormControl isRequired>
              <FormLabel color={textColor} fontSize="sm" fontWeight="700">{t('addOrder.pharmacy')}</FormLabel>
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
                  name="pharmacyId"
                >
                  {selectedPharmacy ? selectedPharmacy.name : t('addOrder.selectPharmacy')}
                </MenuButton>
                <MenuList maxH="300px" overflowY="auto">
                  <Box px={3} py={2}>
                    <Input
                      placeholder={t('addOrder.searchPharmacies')}
                      value={pharmacySearchTerm}
                      onChange={(e) => setPharmacySearchTerm(e.target.value)}
                      size="sm"
                      required={false}
                      name="pharmacySearch"
                    />
                  </Box>
                  {pharmacies
                    .filter(pharmacy =>
                      pharmacy.name && pharmacy.name.toLowerCase().includes(pharmacySearchTerm.toLowerCase())
                    )
                    .map(pharmacy => (
                      <MenuItem
                        key={pharmacy.id}
                        onClick={() => {
                          setPharmacyId(pharmacy.id);
                          setSelectedPharmacy(pharmacy);
                          setOrderItems([{ productId: '', quantity: '', discount: '', searchTerm: '' }]);
                        }}
                        name="pharmacyId"
                      >
                        {pharmacy.name}
                      </MenuItem>
                    ))}
                </MenuList>
              </Menu>
            </FormControl>
          </div>

          {/* Payment */}
          <div className="mb-3">
            <FormControl isRequired>
              <FormLabel color={textColor} fontSize="sm" fontWeight="700">{t('addOrder.paymentMethod')}</FormLabel>
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
                  name="paymentMethod"
                >
                  {paymentMethod || t('addOrder.selectPaymentMethod')}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}>{t('addOrder.cashOnDelivery')}</MenuItem>
                  <MenuItem onClick={() => setPaymentMethod('CARD')}>{t('addOrder.card')}</MenuItem>
                  <MenuItem onClick={() => setPaymentMethod('ONLINE')}>{t('addOrder.onlinePayment')}</MenuItem>
                </MenuList>
              </Menu>
            </FormControl>
          </div>

          {/* Promo Code */}
          <div className="mb-3">
            <FormControl>
              <FormLabel color={textColor} fontSize="sm" fontWeight="700">{t('addOrder.promoCode')}</FormLabel>
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
                  {selectedPromoCode ? selectedPromoCode.code : t('addOrder.selectPromoCode')}
                </MenuButton>
                <MenuList maxH="300px" overflowY="auto">
                  <MenuItem onClick={() => { setPromoCodeId(''); setSelectedPromoCode(null); }}>
                    {t('addOrder.none')}
                  </MenuItem>
                  <Box px={3} py={2}>
                    <Input
                      placeholder={t('addOrder.searchPromoCodes')}
                      value={promocodeSearchTerm}
                      onChange={(e) => setPromocodeSearchTerm(e.target.value)}
                      size="sm"
                    />
                  </Box>
                  {promocodes
                    .filter(promo =>
                      promo.code && promo.code.toLowerCase().includes(promocodeSearchTerm.toLowerCase())
                    )
                    .map(promo => (
                      <MenuItem
                        key={promo.id}
                        onClick={() => {
                          setPromoCodeId(promo.id);
                          setSelectedPromoCode(promo);
                        }}
                      >
                        {promo.code} - {promo.value}{promo.type === 'PERCENTAGE' ? '%' : ''}
                      </MenuItem>
                    ))}
                </MenuList>
              </Menu>
            </FormControl>
          </div>

          {/* Calculated Total */}
          <div className="mb-3">
            <FormControl>
              <FormLabel color={textColor} fontSize="sm" fontWeight="700">{t('addOrder.calculatedTotal')}</FormLabel>
              <Input
                type="text"
                value={calculatedTotal}
                isReadOnly
                mt="8px"
                bg={inputBg}
              />
            </FormControl>
          </div>

          {/* Order Items Table */}
          <Box mb={4}>
            <Text color={textColor} fontSize="md" fontWeight="700" mb={2}>{t('addOrder.orderItems')} <span className="text-danger mx-1">*</span></Text>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th color="gray.400">{t('addOrder.product')}</Th>
                  <Th color="gray.400">{t('addOrder.quantity')}</Th>
                  <Th color="gray.400">{t('addOrder.discount')}</Th>
                  <Th color="gray.400">{t('addOrder.actions')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {orderItems.map((item, index) => (
                  <Tr key={index}>
                    <Td>
                      <FormControl isRequired>
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
                            name="productId"
                          >
                            {products.find(p => p.id === item.productId)?.name || t('addOrder.selectProduct')}
                          </MenuButton>
                          <MenuList maxH="300px" overflowY="auto">
                            <Box px={3} py={2}>
                              <Input
                                placeholder={t('addOrder.searchProducts')}
                                value={item.searchTerm}
                                onChange={(e) => handleItemChange(index, 'searchTerm', e.target.value)}
                                size="sm"
                                required={false}
                                name="productSearch"
                              />
                            </Box>
                            {products
                              .filter(product =>
                                product.name && product.name.toLowerCase().includes(item.searchTerm.toLowerCase())
                              )
                              .map(product => (
                                <MenuItem
                                  key={product.id}
                                  onClick={() => handleItemChange(index, 'productId', product.id)}
                                  name="productId"
                                >
                                  {product.name}
                                </MenuItem>
                              ))}
                          </MenuList>
                        </Menu>
                      </FormControl>
                    </Td>
                    <Td>
                      <FormControl isRequired>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          min={1}
                          bg={inputBg}
                          name="quantity"
                        />
                      </FormControl>
                    </Td>
                    <Td>
                      <FormControl>
                        <Input
                          type="number"
                          value={item.discount}
                          onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                          min={0}
                          max={100}
                          bg={inputBg}
                          name="discount"
                        />
                      </FormControl>
                    </Td>
                    <Td>
                      <IconButton
                        icon={<IoIosRemove />}
                        aria-label={t('addOrder.removeItem')}
                        colorScheme="red"
                        onClick={() => handleRemoveItem(index)}
                        isDisabled={orderItems.length === 1}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Button
              mt={2}
              onClick={handleAddItem}
              size="sm"
              variant={"darkBrand"}
            >
              {t('addOrder.addItem')}
            </Button>
          </Box>

          {/* Buttons */}
          <Flex justify="center" mt={4}>
            <Button
              variant="outline"
              colorScheme="red"
              onClick={handleCancel}
              mr={2}
            >
              {t('addOrder.reset')}
            </Button>
            <Button
              type="submit"
              variant={"darkBrand"}
              isLoading={isCreatingOrder}
              disabled={isCreatingOrder}
            >
              {t('addOrder.createOrder')}
            </Button>
          </Flex>
        </form>
      </Box>
    </div>
  );
};

export default AddOrder;
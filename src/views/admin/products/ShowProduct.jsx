import { useGetProductQuery } from 'api/productSlice';
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Grid,
  Image,
  Text,
  Badge,
  Divider,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
  Tag,
  TagLabel,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon
} from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n";

const ShowProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: productResponse, isLoading ,refetch} = useGetProductQuery(id);
  const { t } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [selectedImage, setSelectedImage] = React.useState(null);
  
  useEffect(() => {
    refetch();
  }, []);
  const product = productResponse?.data;
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  if (isLoading) return <Text>Loading...</Text>;
  if (!product) return <Text>Product not found</Text>;

  const mainImage = selectedImage || product.images.find(img => img.isMain) || product.images[0];
  const arabicTranslation = product.translations.find(t => t.languageId === 'ar');

  const handleBack = () => navigate(-1);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  return (
    <Box p={4} maxW="1400px" mx="auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <Button 
        leftIcon={<Icon as={FiArrowLeft} />} 
        variant="ghost" 
        mb={4}
        onClick={handleBack}
        ml={isRTL ? 2 : 0}
        mr={!isRTL ? 2 : 0}
      >
        {t('productForm.backToProducts')}
      </Button>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8}>
        {/* Product Images */}
        <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">{t('productForm.productImages')}</Heading>
          </CardHeader>
          <CardBody>
            <Flex direction="column" gap={4}>
              <Box 
                border="1px dashed" 
                borderColor={borderColor} 
                borderRadius="md" 
                p={2}
              >
                <Image 
                  src={mainImage?.imageKey} 
                  alt={product.name} 
                  w="100%"
                  maxH="400px"
                  objectFit="contain"
                  fallbackSrc="https://via.placeholder.com/400"
                />
              </Box>
              
              {product.images.length > 1 && (
                <Flex gap={2} wrap="wrap">
                  {product.images.map((image) => (
                    <Box 
                      key={image.id} 
                      border="1px solid" 
                      borderColor={selectedImage?.id === image.id ? accentColor : image.isMain ? accentColor : borderColor}
                      borderRadius="md" 
                      p={1}
                      cursor="pointer"
                      onClick={() => handleImageClick(image)}
                      _hover={{ opacity: 0.8 }}
                    >
                      <Image 
                        src={image.imageKey} 
                        alt={`Variant ${image.order}`} 
                        w="80px"
                        h="80px"
                        objectFit="contain"
                      />
                    </Box>
                  ))}
                </Flex>
              )}
            </Flex>
          </CardBody>
        </Card>

        {/* Product Details */}
        <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">{product.name}</Heading>
              <Flex gap={2}>
                <Badge colorScheme={product.isActive ? 'green' : 'red'}>
                  {product.isActive ? t('productForm.statusActive') : t('productForm.statusInactive')}
                </Badge>
                <Badge colorScheme={product.isPublished ? 'blue' : 'yellow'}>
                  {product.isPublished ? t('productForm.statusPublished') : t('productForm.statusDraft')}
                </Badge>
              </Flex>
            </Flex>
          </CardHeader>
          <CardBody>
            <Stack spacing={4}>
              <Flex justify="space-between">
                <Text fontWeight="bold">{t('productForm.category')}:</Text>
                <Text>{product.categoryName}</Text>
              </Flex>
              
              <Flex justify="space-between">
                <Text fontWeight="bold">{t('productForm.brand')}:</Text>
                <Text>{product.brandName}</Text>
              </Flex>
              
              <Flex justify="space-between">
                <Text fontWeight="bold">{t('productForm.pharmacy')}:</Text>
                <Text>{product.pharmacyName}</Text>
              </Flex>
              
              <Flex justify="space-between">
                <Text fontWeight="bold">{t('productForm.productType')}:</Text>
                <Text>{product.productTypeName}</Text>
              </Flex>
              
              <Flex justify="space-between">
                <Text fontWeight="bold">{t('productForm.price')}:</Text>
                <Text>${product.price}</Text>
              </Flex>
              
              <Flex justify="space-between">
                <Text fontWeight="bold">{t('productForm.cost')}:</Text>
                <Text>${product.cost}</Text>
              </Flex>
              
              <Flex justify="space-between">
                <Text fontWeight="bold">{t('productForm.quantityInStock')}:</Text>
                <Text>{product.quantity}</Text>
              </Flex>
              
              {product.sku && (
                <Flex justify="space-between">
                  <Text fontWeight="bold">{t('productForm.sku')}:</Text>
                  <Text>{product.sku}</Text>
                </Flex>
              )}
              
              {product.lotNumber && (
                <Flex justify="space-between">
                  <Text fontWeight="bold">{t('productForm.lotNumber')}:</Text>
                  <Text>{product.lotNumber}</Text>
                </Flex>
              )}
              
              {product.expiryDate && (
                <Flex justify="space-between">
                  <Text fontWeight="bold">{t('productForm.expiryDate')}:</Text>
                  <Text>{new Date(product.expiryDate).toLocaleDateString()}</Text>
                </Flex>
              )}
              
              {product.discount && (
                <Flex justify="space-between">
                  <Text fontWeight="bold">{t('productForm.discount')}:</Text>
                  <Text>${product.discount} ({product.discountType})</Text>
                </Flex>
              )}
              
              {product.offerType && (
                <Flex justify="space-between">
                  <Text fontWeight="bold">{t('productForm.offerType')}:</Text>
                  <Text color="green.500">
                    {product.offerType.replace('_', ' ')}
                    {product.offerPercentage && ` (${product.offerPercentage}%)`}
                  </Text>
                </Flex>
              )}
              
              <Divider />
              
              <Box>
                <Text fontWeight="bold" mb={2}>{t('productForm.description')}:</Text>
                <Text>{product.description}</Text>
              </Box>
              

            </Stack>
          </CardBody>
        </Card>
      </Grid>

      {/* Variants and Additional Info */}
      <Tabs mt={8} variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>{t('productForm.variants')}</Tab>
          <Tab>{t('productForm.additionalInformation')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0} pt={4}>
            {product.hasVariants && product.variants?.length > 0 ? (
              <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
                <CardBody>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>{t('productForm.variant')}</Th>
                        <Th>{t('productForm.value')}</Th>
                        <Th isNumeric>{t('productForm.price')}</Th>
                        <Th isNumeric>{t('productForm.cost')}</Th>
                        <Th isNumeric>{t('productForm.stock')}</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {product.variants.map((variant) => (
                        <Tr key={variant.id}>
                          <Td>{variant.variantName}</Td>
                          <Td>
                            <Flex align="center" gap={2}>
                              {variant.imageKey && (
                                <Image 
                                  src={variant.imageKey} 
                                  alt={variant.attributeValue} 
                                  boxSize="40px"
                                  objectFit="contain"
                                  cursor="pointer"
                                  onClick={() => handleImageClick({ imageKey: variant.imageKey, id: `variant-${variant.id}` })}
                                  _hover={{ opacity: 0.8 }}
                                />
                              )}
                              <Text>{variant.attributeValue}</Text>
                            </Flex>
                          </Td>
                          <Td isNumeric>${variant.price}</Td>
                          <Td isNumeric>${variant.cost}</Td>
                          <Td isNumeric>{variant.quantity}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            ) : (
              <Text>{t('productForm.noVariants')}</Text>
            )}
          </TabPanel>
          
          <TabPanel p={0} pt={4}>
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
              <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="sm">{t('productForm.productDetails')}</Heading>
                </CardHeader>
                <CardBody>
                  <Stack spacing={4}>
                    {product.howToUse && (
                      <Box>
                        <Text fontWeight="bold" mb={2}>{t('productForm.howToUse')}:</Text>
                        <Text>{product.howToUse}</Text>
                      </Box>
                    )}
                    
                    {product.treatment && (
                      <Box>
                        <Text fontWeight="bold" mb={2}>{t('productForm.treatment')}:</Text>
                        <Text>{product.treatment}</Text>
                      </Box>
                    )}
                    
                    {product.ingredient && (
                      <Box>
                        <Text fontWeight="bold" mb={2}>{t('productForm.ingredients')}:</Text>
                        <Text>{product.ingredient}</Text>
                      </Box>
                    )}
                  </Stack>
                </CardBody>
              </Card>
              
              <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="sm">{t('productForm.arabicTranslations')}</Heading>
                </CardHeader>
                <CardBody>
                  <Stack spacing={4}>
                    {arabicTranslation && (
                      <>
                        {arabicTranslation.name && (
                          <Box>
                            <Text fontWeight="bold" mb={2}>{t('productForm.arabicName')}:</Text>
                            <Text dir="rtl" textAlign="right">{arabicTranslation.name}</Text>
                          </Box>
                        )}
                        
                        {arabicTranslation.description && (
                          <Box>
                            <Text fontWeight="bold" mb={2}>{t('productForm.arabicDescription')}:</Text>
                            <Text dir="rtl" textAlign="right">{arabicTranslation.description}</Text>
                          </Box>
                        )}
                        
                        {arabicTranslation.howToUse && (
                          <Box>
                            <Text fontWeight="bold" mb={2}>{t('productForm.arabicHowToUse')}:</Text>
                            <Text dir="rtl" textAlign="right">{arabicTranslation.howToUse}</Text>
                          </Box>
                        )}
                        
                        {arabicTranslation.treatment && (
                          <Box>
                            <Text fontWeight="bold" mb={2}>{t('productForm.arabicTreatment')}:</Text>
                            <Text dir="rtl" textAlign="right">{arabicTranslation.treatment}</Text>
                          </Box>
                        )}
                        
                        {arabicTranslation.ingredient && (
                          <Box>
                            <Text fontWeight="bold" mb={2}>{t('productForm.arabicIngredients')}:</Text>
                            <Text dir="rtl" textAlign="right">{arabicTranslation.ingredient}</Text>
                          </Box>
                        )}
                      </>
                    )}
                  </Stack>
                </CardBody>
              </Card>
            </Grid>
            
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4} mt={4}>
              <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="sm">{t('productForm.creationDetails')}</Heading>
                </CardHeader>
                <CardBody>
                  <Stack spacing={2}>
                    <Flex justify="space-between">
                      <Text fontWeight="bold">{t('productForm.createdAt')}:</Text>
                      <Text>{new Date(product.createdAt).toLocaleString()}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontWeight="bold">{t('productForm.lastUpdated')}:</Text>
                      <Text>{new Date(product.updatedAt).toLocaleString()}</Text>
                    </Flex>
                  </Stack>
                </CardBody>
              </Card>
              
              <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="sm">{t('productForm.actions')}</Heading>
                </CardHeader>
                <CardBody>
                  <Flex gap={4} wrap="wrap">
                    <Button 
                      colorScheme="blue" 
                      onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                      ml={isRTL ? 2 : 0}
                      mr={!isRTL ? 2 : 0}
                    >
                      {t('productForm.editProduct')}
                    </Button>
                    <Button 
                      colorScheme="red" 
                      variant="outline"
                      onClick={() => {
                        Swal.fire({
                          title: t('product.areYouSure'),
                          text: t('product.irreversible'),
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#3085d6',
                          cancelButtonColor: '#d33',
                          confirmButtonText: t('product.yesDelete')
                        }).then((result) => {
                          if (result.isConfirmed) {
                            // Add delete logic here
                            Swal.fire(
                              t('products.deleted'),
                              t('products.deletedMsg'),
                              'success'
                            );
                          }
                        });
                      }}
                      ml={isRTL ? 2 : 0}
                      mr={!isRTL ? 2 : 0}
                    >
                      {t('productForm.deleteProduct')}
                    </Button>
                  </Flex>
                </CardBody>
              </Card>
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>


    </Box>
  );
};

export default ShowProduct;
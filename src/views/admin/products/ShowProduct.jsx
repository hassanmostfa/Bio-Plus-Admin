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

const ShowProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: productResponse, isLoading ,refetch} = useGetProductQuery(id);
  useEffect(() => {
    refetch();
  }, []);
  const product = productResponse?.data;
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  if (isLoading) return <Text>Loading...</Text>;
  if (!product) return <Text>Product not found</Text>;

  const mainImage = product.images.find(img => img.isMain) || product.images[0];
  const arabicTranslation = product.translations.find(t => t.languageId === 'ar');

  const handleBack = () => navigate(-1);

  return (
    <Box p={4} maxW="1400px" mx="auto">
      <Button 
        leftIcon={<Icon as={FiArrowLeft} />} 
        variant="ghost" 
        mb={4}
        onClick={handleBack}
      >
        Back to Products
      </Button>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8}>
        {/* Product Images */}
        <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Product Images</Heading>
          </CardHeader>
          <CardBody>
            <Flex direction="column" gap={4}>
              <Box border="1px dashed" borderColor={borderColor} borderRadius="md" p={2}>
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
                      borderColor={image.isMain ? accentColor : borderColor}
                      borderRadius="md" 
                      p={1}
                      cursor="pointer"
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
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge colorScheme={product.isPublished ? 'blue' : 'yellow'}>
                  {product.isPublished ? 'Published' : 'Draft'}
                </Badge>
              </Flex>
            </Flex>
          </CardHeader>
          <CardBody>
            <Stack spacing={4}>
              <Flex justify="space-between">
                <Text fontWeight="bold">Brand:</Text>
                <Text>{product.brandName}</Text>
              </Flex>
              
              <Flex justify="space-between">
                <Text fontWeight="bold">Pharmacy:</Text>
                <Text>{product.pharmacyName}</Text>
              </Flex>
              
              <Flex justify="space-between">
                <Text fontWeight="bold">Price:</Text>
                <Text>${product.price}</Text>
              </Flex>
              
              {product.offerPercentage && (
                <Flex justify="space-between">
                  <Text fontWeight="bold">Offer:</Text>
                  <Text color="green.500">
                    {product.offerPercentage}% ({product.offerType.replace('_', ' ')})
                  </Text>
                </Flex>
              )}
              
              <Flex justify="space-between">
                <Text fontWeight="bold">Cost:</Text>
                <Text>${product.cost}</Text>
              </Flex>
              
              <Flex justify="space-between">
                <Text fontWeight="bold">Quantity in Stock:</Text>
                <Text>{product.quantity}</Text>
              </Flex>
              
              <Divider />
              
              <Box>
                <Text fontWeight="bold" mb={2}>Description:</Text>
                <Text>{product.description}</Text>
              </Box>
              
              {arabicTranslation && (
                <Box>
                  <Text fontWeight="bold" mb={2}>Arabic Description:</Text>
                  <Text dir="rtl" textAlign="right">{arabicTranslation.description}</Text>
                </Box>
              )}
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      {/* Variants and Additional Info */}
      <Tabs mt={8} variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Variants</Tab>
          <Tab>Additional Information</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0} pt={4}>
            {product.hasVariants && product.variants?.length > 0 ? (
              <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
                <CardBody>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Variant</Th>
                        <Th>Value</Th>
                        <Th isNumeric>Price</Th>
                        <Th isNumeric>Cost</Th>
                        <Th isNumeric>Stock</Th>
                        <Th>Status</Th>
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
                                />
                              )}
                              <Text>{variant.attributeValue}</Text>
                            </Flex>
                          </Td>
                          <Td isNumeric>${variant.price}</Td>
                          <Td isNumeric>${variant.cost}</Td>
                          <Td isNumeric>{variant.quantity}</Td>
                          <Td>
                            <Tag 
                              size="sm" 
                              colorScheme={variant.isActive ? 'green' : 'red'}
                            >
                              <TagLabel>
                                {variant.isActive ? 'Active' : 'Inactive'}
                              </TagLabel>
                            </Tag>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            ) : (
              <Text>This product has no variants</Text>
            )}
          </TabPanel>
          
          <TabPanel p={0} pt={4}>
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
              <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="sm">Creation Details</Heading>
                </CardHeader>
                <CardBody>
                  <Stack spacing={2}>
                    <Flex justify="space-between">
                      <Text fontWeight="bold">Created At:</Text>
                      <Text>{new Date(product.createdAt).toLocaleString()}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontWeight="bold">Last Updated:</Text>
                      <Text>{new Date(product.updatedAt).toLocaleString()}</Text>
                    </Flex>
                  </Stack>
                </CardBody>
              </Card>
              
              <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="sm">Actions</Heading>
                </CardHeader>
                <CardBody>
                  <Flex gap={4} wrap="wrap">
                    <Button 
                      colorScheme="blue" 
                      onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                    >
                      Edit Product
                    </Button>
                    <Button 
                      colorScheme="red" 
                      variant="outline"
                      onClick={() => {
                        Swal.fire({
                          title: 'Are you sure?',
                          text: "You won't be able to revert this!",
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#3085d6',
                          cancelButtonColor: '#d33',
                          confirmButtonText: 'Yes, delete it!'
                        }).then((result) => {
                          if (result.isConfirmed) {
                            // Add delete logic here
                            Swal.fire(
                              'Deleted!',
                              'Product has been deleted.',
                              'success'
                            );
                          }
                        });
                      }}
                    >
                      Delete Product
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
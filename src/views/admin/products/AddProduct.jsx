import React, { useState } from 'react';
import {
  Box,
  Image,
  Badge,
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
  Icon,
  Select,
  Textarea,
  Switch,
  SimpleGrid,
  Radio,
  RadioGroup,
  Stack,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  useToast,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { FaUpload, FaTrash } from 'react-icons/fa6';
import { IoMdArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { useGetVarientsQuery } from 'api/varientSlice';
import { useGetCategoriesQuery } from 'api/categorySlice';
import { useGetBrandsQuery } from 'api/brandSlice';
import { useAddProductMutation } from 'api/productSlice';
import Swal from 'sweetalert2';
import { useGetPharmaciesQuery } from 'api/pharmacySlice';
import { useAddFileMutation } from 'api/filesSlice';
import { useGetTypesQuery } from 'api/typeSlice';
import { useTranslation } from 'react-i18next';
import FormWrapper from 'components/FormWrapper';
import { useLanguage } from 'contexts/LanguageContext';

const AddProduct = () => {
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [pharmacyId, setPharmacyId] = useState('');
  const [productTypeId, setProductTypeId] = useState(''); // New state for product type
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [offerType, setOfferType] = useState('');
  const [offerPercentage, setOfferPercentage] = useState(null);
  const [hasVariants, setHasVariants] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isPublished, setIsPublished] = useState(false);
  const [images, setImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // New states for additional fields
  const [sku, setSku] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  // const [guideLineEn, setGuideLineEn] = useState('');
  // const [guideLineAr, setGuideLineAr] = useState('');
  const [howToUseEn, setHowToUseEn] = useState('');
  const [howToUseAr, setHowToUseAr] = useState('');
  const [treatmentEn, setTreatmentEn] = useState('');
  const [treatmentAr, setTreatmentAr] = useState('');
  const [ingredientsEn, setIngredientsEn] = useState('');
  const [ingredientsAr, setIngredientsAr] = useState('');

  // New states for discount
  const [discount, setDiscount] = useState(null);
  const [discountType, setDiscountType] = useState(null);

  const [addProduct, { isLoading }] = useAddProductMutation();
  const toast = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // Fetch data
  const { data: categoriesResponse } = useGetCategoriesQuery({
    page: 1,
    limit: 1000,
  });
  const { data: variantsResponse } = useGetVarientsQuery({
    page: 1,
    limit: 1000,
  });
  const { data: brandsResponse } = useGetBrandsQuery({ page: 1, limit: 1000 });
  const { data: PharmacyResponse } = useGetPharmaciesQuery({
    page: 1,
    limit: 1000,
  });
  const { data: productTypesResponse } = useGetTypesQuery({ page: 1, limit: 1000 }); // Fetch product types
  
  const categories = categoriesResponse?.data?.data || [];
  const variants = variantsResponse?.data || [];
  const brands = brandsResponse?.data || [];
  const pharmacies = PharmacyResponse?.data?.items || [];
  const productTypes = productTypesResponse?.data?.items || []; // Get product types from response
  
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const [addFile] = useAddFileMutation();

  // Image handling
  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      const newImages = Array.from(files)
        .map((file) => {
          if (!file.type.startsWith('image/')) {
            toast({
              title: t('common.error'),
              description: t('forms.imageOnlyError'),
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
            return null;
          }
          return {
            file,
            preview: URL.createObjectURL(file),
            isMain: images.length === 0,
          };
        })
        .filter((img) => img !== null);

      setImages([...images, ...newImages]);
      if (images.length === 0 && newImages.length > 0) {
        setMainImageIndex(0);
      }
    }
  };

  const handleRemoveImage = (index) => {
    URL.revokeObjectURL(images[index].preview);
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    if (mainImageIndex === index) {
      setMainImageIndex(0);
    } else if (mainImageIndex > index) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const handleSetMainImage = (index) => {
    setMainImageIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageUpload(e.dataTransfer.files);
  };

  // Variant handling
  const handleVariantSelect = (e) => {
    const variantId = e.target.value;
    const selectedVariant = variants.find((v) => v.id === variantId);

    if (selectedVariant) {
      const newAttributes = selectedVariant.attributes.map((attr) => ({
        variantId: selectedVariant.id,
        variantName: selectedVariant.name,
        attributeId: attr.id,
        attributeValue: attr.value,
        cost: '',
        price: '',
        quantity: '',
        image: null,
        isActive: true,
        lotNumber: '',
        expiryDate: '',
      }));
      setSelectedAttributes([...selectedAttributes, ...newAttributes]);
    }
  };

  const handleAttributeChange = (index, field, value) => {
    const updatedAttributes = [...selectedAttributes];
    updatedAttributes[index][field] = value;
    setSelectedAttributes(updatedAttributes);
  };

  const handleDeleteAttribute = (index) => {
    setSelectedAttributes(selectedAttributes.filter((_, i) => i !== index));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Upload product images first
      const uploadedImages = [];
      if (images.length > 0) {
        const imageUploadPromises = images.map(async (img, index) => {
          const formData = new FormData();
          formData.append('file', img.file);
  
          const uploadResponse = await addFile(formData).unwrap();
  
          if (
            uploadResponse.success &&
            uploadResponse.data.uploadedFiles.length > 0
          ) {
            return {
              imageKey: uploadResponse.data.uploadedFiles[0].url,
              order: index,
              isMain: index === mainImageIndex,
            };
          }
          return null;
        });
  
        const results = await Promise.all(imageUploadPromises);
        uploadedImages.push(...results.filter((img) => img !== null));
      }
  
      // Prepare translations
      const translations = [];
      if (nameAr || descriptionAr || howToUseAr || treatmentAr || ingredientsAr) {
        translations.push({
          languageId: 'ar',
          name: nameAr,
          description: descriptionAr,
          howToUse: howToUseAr,
          treatment: treatmentAr,
          ingredient: ingredientsAr
        });
      }
  
      // Prepare product data
      if (!price) {
        throw new Error(t('forms.priceRequired'));
      }
  
      const productData = {
        name: nameEn,
        description: descriptionEn,
        howToUse: howToUseEn,
        treatment: treatmentEn,
        ingredient: ingredientsEn,
        categoryId: categoryId,
        brandId: brandId,
        pharmacyId: pharmacyId,
        productTypeId: productTypeId,
        sku: sku,
        cost: cost ? parseFloat(cost) : undefined,
        price: parseFloat(price),
        quantity: quantity ? parseInt(quantity) : undefined,
        discount: discount != null ? parseFloat(discount) : undefined,
        discountType: discountType,
        lotNumber: lotNumber,
        expiryDate: expiryDate,
        hasVariants,
        isActive,
        isPublished,
        translations: translations,
        images: uploadedImages
      };
  
      // Only include offerType and offerPercentage if offerType is not "NONE"
      if (offerType && offerType !== "NONE") {
        productData.offerType = offerType;
        productData.offerPercentage = offerPercentage != null ? parseFloat(offerPercentage) : undefined;
      }
  
      // Remove any keys that are null or undefined
      Object.keys(productData).forEach((key) => {
        if (productData[key] == null || productData[key] === undefined) {
          delete productData[key];
        }
      });
  
      // Submit to API
      const response = await addProduct(productData).unwrap();
  
      toast({
        title: t('common.success'),
        description: t('product.productCreatedSuccess'),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
  
      navigate('/admin/products');
    } catch (err) {
      toast({
        title: t('common.error'),
        description:
          err.data?.message || err.message || t('forms.failedToCreateProduct'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: t('common.areYouSure'),
      text: t('forms.loseUnsavedChanges'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('common.yesDiscardChanges'),
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/admin/products');
      }
    });
  };

  return (
    <Box className="container add-admin-container w-100">
      <Box bg={cardBg} className="add-admin-card shadow p-4 w-100" borderRadius="lg">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            mb="20px !important"
            lineHeight="100%"
          >
            {t('product.addProduct')}
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('common.back')}
          </Button>
        </div>
        <FormWrapper>
          <form onSubmit={handleSubmit} dir="rtl">
            {/* Basic Information */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              <Box>
                <FormControl isRequired>
                  <FormLabel>{t('product.productName')} (English)</FormLabel>
                  <Input
                    placeholder={t('forms.enterProductName')}
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    color={textColor}
                  />
                </FormControl>
              </Box>
              <Box>
                <FormControl>
                  <FormLabel>{t('product.productName')} (Arabic)</FormLabel>
                  <Input
                    placeholder={t('forms.enterProductNameAr')}
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    dir="rtl"
                    color={textColor}
                  />
                </FormControl>
              </Box>
            </SimpleGrid>

            {/* Description Sections */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              <Box>
                <FormControl isRequired>
                  <FormLabel>{t('product.descriptionEn')}</FormLabel>
                  <Textarea
                    placeholder={t('forms.enterDescription')}
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                    color={textColor}
                  />
                </FormControl>
              </Box>
              <Box>
                <FormControl>
                  <FormLabel>{t('product.descriptionAr')}</FormLabel>
                  <Textarea
                    placeholder={t('forms.enterDescriptionAr')}
                    value={descriptionAr}
                    onChange={(e) => setDescriptionAr(e.target.value)}
                    dir="rtl"
                    color={textColor}
                  />
                </FormControl>
              </Box>

              {/* Guide Line */}
              {/* <Box>
                <FormControl>
                  <FormLabel>Guide Line (English)</FormLabel>
                  <Textarea
                    placeholder="Enter Guide Line"
                    value={guideLineEn}
                    onChange={(e) => setGuideLineEn(e.target.value)}
                  />
                </FormControl>
              </Box>
              <Box>
                <FormControl>
                  <FormLabel>Guide Line (Arabic)</FormLabel>
                  <Textarea
                    placeholder="أدخل دليل الاستخدام"
                    value={guideLineAr}
                    onChange={(e) => setGuideLineAr(e.target.value)}
                    dir="rtl"
                  />
                </FormControl>
              </Box> */}

              {/* How To Use */}
              <Box>
                <FormControl>
                  <FormLabel>{t('product.howToUseEn')}</FormLabel>
                  <Textarea
                    placeholder={t('forms.enterHowToUse')}
                    value={howToUseEn}
                    onChange={(e) => setHowToUseEn(e.target.value)}
                    color={textColor}
                  />
                </FormControl>
              </Box>
              <Box>
                <FormControl>
                  <FormLabel>{t('product.howToUseAr')}</FormLabel>
                  <Textarea
                    placeholder={t('forms.enterHowToUseAr')}
                    value={howToUseAr}
                    onChange={(e) => setHowToUseAr(e.target.value)}
                    dir="rtl"
                    color={textColor}
                  />
                </FormControl>
              </Box>

              {/* Treatment */}
              <Box>
                <FormControl>
                  <FormLabel>{t('product.treatmentEn')}</FormLabel>
                  <Textarea
                    placeholder={t('forms.enterTreatmentInformation')}
                    value={treatmentEn}
                    onChange={(e) => setTreatmentEn(e.target.value)}
                    color={textColor}
                  />
                </FormControl>
              </Box>
              <Box>
                <FormControl>
                  <FormLabel>{t('product.treatmentAr')}</FormLabel>
                  <Textarea
                    placeholder={t('forms.enterTreatmentAr')}
                    value={treatmentAr}
                    onChange={(e) => setTreatmentAr(e.target.value)}
                    dir="rtl"
                    color={textColor}
                  />
                </FormControl>
              </Box>

              {/* Ingredients */}
              <Box>
                <FormControl>
                  <FormLabel>{t('product.ingredientsEn')}</FormLabel>
                  <Textarea
                    placeholder={t('forms.enterIngredients')}
                    value={ingredientsEn}
                    onChange={(e) => setIngredientsEn(e.target.value)}
                    color={textColor}
                  />
                </FormControl>
              </Box>
              <Box>
                <FormControl>
                  <FormLabel>{t('product.ingredientsAr')}</FormLabel>
                  <Textarea
                    placeholder={t('forms.enterIngredientsAr')}
                    value={ingredientsAr}
                    onChange={(e) => setIngredientsAr(e.target.value)}
                    dir="rtl"
                    color={textColor}
                  />
                </FormControl>
              </Box>
            </SimpleGrid>

            {/* SKU, Lot Number, Expiry Date (only if no variants) */}
            {!hasVariants && (
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
                <Box>
                  <FormControl>
                    <FormLabel>{t('product.sku')}</FormLabel>
                    <Input
                      type="text"
                      placeholder={t('forms.enterSku')}
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      color={textColor}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl>
                    <FormLabel>{t('product.lotNumber')}</FormLabel>
                    <Input
                      type="text"
                      placeholder={t('forms.enterLotNumber')}
                      value={lotNumber}
                      onChange={(e) => setLotNumber(e.target.value)}
                      color={textColor}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl>
                    <FormLabel>{t('product.expiryDate')}</FormLabel>
                    <Input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      color={textColor}
                    />
                  </FormControl>
                </Box>
              </SimpleGrid>
            )}

            {/* Category, Brand, Pharmacy and Product Type */}
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={4}>
              <Box>
                <FormControl isRequired>
                  <FormLabel>{t('product.category')}</FormLabel>
                  <Select
                    placeholder={t('forms.selectCategory')}
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    color={textColor}
                    style={{ direction: 'ltr' }}
                  >
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.translations?.find((t) => t.languageId === 'en')
                          ?.name || cat.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <FormControl isRequired>
                  <FormLabel>{t('product.brand')}</FormLabel>
                  <Select
                    placeholder={t('forms.selectBrand')}
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    color={textColor}
                    style={{ direction: 'ltr' }}
                  >
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <FormControl>
                  <FormLabel>{t('product.pharmacy')}</FormLabel>
                  <Select
                    placeholder={t('forms.selectPharmacy')}
                    value={pharmacyId}
                    onChange={(e) => setPharmacyId(e.target.value)}
                    color={textColor}
                    style={{ direction: 'ltr' }}
                  >
                    {pharmacies?.map((pharmacy) => (
                      <option key={pharmacy.id} value={pharmacy.id}>
                        {pharmacy.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <FormControl>
                  <FormLabel>{t('product.productType')}</FormLabel>
                  <Select
                    placeholder={t('forms.selectProductType')}
                    value={productTypeId}
                    onChange={(e) => setProductTypeId(e.target.value)}
                    color={textColor}
                    style={{ direction: 'ltr' }}
                  >
                    {productTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
              <Box>
                <FormControl isRequired>
                  <FormLabel>{t('product.cost')}</FormLabel>
                  <Input
                    type="number"
                    placeholder={t('forms.enterCost')}
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    color={textColor}
                  />
                </FormControl>
              </Box>
              <Box>
                <FormControl isRequired>
                  <FormLabel>{t('product.price')}</FormLabel>
                  <Input
                    type="number"
                    placeholder={t('forms.enterPrice')}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    color={textColor}
                  />
                </FormControl>
              </Box>
              <Box>
                <FormControl isRequired>
                  <FormLabel>{t('product.quantity')}</FormLabel>
                  <Input
                    type="number"
                    placeholder={t('forms.enterQuantity')}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    color={textColor}
                  />
                </FormControl>
              </Box>
              
            </SimpleGrid>

            {/* Offer Type */}
            <Box mb={4}>
              <FormLabel>{t('product.offerType')}</FormLabel>
              <RadioGroup value={offerType} onChange={setOfferType}>
                <Stack direction="row">
                  <Radio value="MONTHLY_OFFER">{t('forms.monthlyOffer')}</Radio>
                  <Radio value="NEW_ARRIVAL">{t('forms.newArrival')}</Radio>
                  <Radio value="NONE">{t('forms.none')}</Radio>
                </Stack>
              </RadioGroup>
              {offerType === 'MONTHLY_OFFER' && (
                <Box mt={2}>
                  <FormControl>
                    <FormLabel>{t('forms.offerPercentage')}</FormLabel>
                    <Input
                      type="number"
                      placeholder={t('forms.enterOfferPercentage')}
                      value={offerPercentage}
                      onChange={(e) => setOfferPercentage(e.target.value)}
                      color={textColor}
                    />
                  </FormControl>
                </Box>
              )}
            </Box>

            {/* Discount Fields (only if no variants) */}
            {!hasVariants && (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                <Box>
                  <FormControl>
                    <FormLabel>{t('product.discount')}</FormLabel>
                    <Input
                      type="number"
                      placeholder={t('forms.enterDiscountValue')}
                      value={discount != null ? discount : ''}
                      onChange={(e) => setDiscount(e.target.value)}
                      color={textColor}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl>
                    <FormLabel>{t('product.discountType')}</FormLabel>
                    <Select
                      placeholder={t('forms.selectDiscountType')}
                      value={discountType || ''}
                      onChange={(e) => setDiscountType(e.target.value)}
                      color={textColor}
                      style={{ direction: 'ltr' }}
                    >
                      <option value="PERCENTAGE">{t('forms.percentage')}</option>
                      <option value="FIXED">{t('forms.fixed')}</option>
                    </Select>
                  </FormControl>
                </Box>
              </SimpleGrid>
            )}

            {/* Status Switches */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
            <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">{t('product.isPublished')}</FormLabel>
                <Switch
                  isChecked={isPublished}
                  onChange={() => setIsPublished(!isPublished)}
                  style={{ direction: 'ltr' }}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">{t('product.isActive')}</FormLabel>
                <Switch
                  isChecked={isActive}
                  onChange={() => setIsActive(!isActive)}
                  style={{ direction: 'ltr' }}
                />
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">{t('product.hasVariants')}</FormLabel>
                <Switch
                  isChecked={hasVariants}
                  onChange={() => setHasVariants(!hasVariants)}
                  style={{ direction: 'ltr' }}
                />
              </FormControl>
            </SimpleGrid>

            {/* Variants Section */}
            {hasVariants && (
              <Box mb={4}>
                <FormControl mb={4}>
                  <FormLabel>{t('product.selectVariant')}</FormLabel>
                  <Select
                    placeholder={t('forms.selectVariant')}
                    onChange={handleVariantSelect}
                    color={textColor}
                    style={{ direction: 'ltr' }}
                  >
                    {variants.map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {selectedAttributes.length > 0 && (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {selectedAttributes.map((attr, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <Flex justify="space-between" align="center">
                            <Text fontWeight="bold">
                              {attr.variantName} - {attr.attributeValue}
                            </Text>
                            <IconButton
                              icon={<FaTrash />}
                              aria-label={t('common.deleteVariant')}
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDeleteAttribute(index)}
                            />
                          </Flex>
                        </CardHeader>
                        <CardBody>
                          <SimpleGrid columns={2} spacing={2}>
                            <FormControl isRequired>
                              <FormLabel>{t('product.cost')}</FormLabel>
                              <Input
                                type="number"
                                value={attr.cost}
                                onChange={(e) =>
                                  handleAttributeChange(
                                    index,
                                    'cost',
                                    e.target.value,
                                  )
                                }
                                color={textColor}
                              />
                            </FormControl>
                            <FormControl isRequired>
                              <FormLabel>{t('product.price')}</FormLabel>
                              <Input
                                type="number"
                                value={attr.price}
                                onChange={(e) =>
                                  handleAttributeChange(
                                    index,
                                    'price',
                                    e.target.value,
                                  )
                                }
                                color={textColor}
                              />
                            </FormControl>
                            <FormControl isRequired>
                              <FormLabel>{t('product.quantity')}</FormLabel>
                              <Input
                                type="number"
                                value={attr.quantity}
                                onChange={(e) =>
                                  handleAttributeChange(
                                    index,
                                    'quantity',
                                    e.target.value,
                                  )
                                }
                                color={textColor}
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel>{t('product.variantImage')}</FormLabel>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    if (
                                      !e.target.files[0].type.startsWith('image/')
                                    ) {
                                      toast({
                                        title: t('common.error'),
                                        description: t('forms.imageOnlyError'),
                                        status: 'error',
                                        duration: 5000,
                                        isClosable: true,
                                      });
                                      return;
                                    }
                                    handleAttributeChange(
                                      index,
                                      'image',
                                      e.target.files[0],
                                    );
                                  }
                                }}
                                color={textColor}
                              />
                              {attr.image && (
                                <Image
                                  src={URL.createObjectURL(attr.image)}
                                  alt={t('product.variantPreview')}
                                  mt={2}
                                  maxH="100px"
                                />
                              )}
                            </FormControl>

                            {/* Variant Lot Number and Expiry Date */}
                            <FormControl>
                              <FormLabel>{t('product.lotNumber')}</FormLabel>
                              <Input
                                type="text"
                                placeholder={t('forms.enterLotNumber')}
                                value={attr.lotNumber}
                                onChange={(e) =>
                                  handleAttributeChange(
                                    index,
                                    'lotNumber',
                                    e.target.value,
                                  )
                                }
                                color={textColor}
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel>{t('product.expiryDate')}</FormLabel>
                              <Input
                                type="date"
                                value={attr.expiryDate}
                                onChange={(e) =>
                                  handleAttributeChange(
                                    index,
                                    'expiryDate',
                                    e.target.value,
                                  )
                                }
                                color={textColor}
                              />
                            </FormControl>

                            {/* Variant Discount Fields */}
                            <FormControl>
                              <FormLabel>{t('product.discount')}</FormLabel>
                              <Input
                                type="number"
                                placeholder={t('forms.enterDiscountValue')}
                                value={attr.discount != null ? attr.discount : ''}
                                onChange={(e) =>
                                  handleAttributeChange(index, 'discount', e.target.value)
                                }
                                color={textColor}
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel>{t('product.discountType')}</FormLabel>
                              <Select
                                placeholder={t('forms.selectDiscountType')}
                                value={attr.discountType || ''}
                                onChange={(e) =>
                                  handleAttributeChange(index, 'discountType', e.target.value)
                                }
                                color={textColor}
                                style={{ direction: 'ltr' }}
                              >
                                <option value="PERCENTAGE">{t('forms.percentage')}</option>
                                <option value="FIXED">{t('forms.fixed')}</option>
                              </Select>
                            </FormControl>
                          </SimpleGrid>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </Box>
            )}

            {/* Product Images */}
            <Box mb={4}>
              <FormControl isRequired={images.length === 0}>
                <FormLabel>
                  {t('product.productImages')}
                  {images.length === 0 && <span style={{ color: 'red' }}>*</span>}
                </FormLabel>
                <Box
                  border="1px dashed"
                  borderColor={isDragging ? 'brand.500' : 'gray.300'}
                  borderRadius="md"
                  p={4}
                  textAlign="center"
                  backgroundColor={isDragging ? 'brand.50' : inputBg}
                  cursor="pointer"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  mb={4}
                >
                  {images.length > 0 ? (
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                      {images.map((img, index) => (
                        <Box key={index} position="relative" display="flex" flexDirection="column" alignItems="center">
                          <Image
                            src={img.preview}
                            alt={t('product.productImage', { index: index + 1 })}
                            borderRadius="md"
                            maxH="150px"
                            border={mainImageIndex === index ? '2px solid' : '1px solid'}
                            borderColor={mainImageIndex === index ? 'brand.500' : 'gray.300'}
                            cursor="pointer"
                            onClick={() => handleSetMainImage(index)}
                          />
                          {mainImageIndex === index && (
                            <Badge position="absolute" top={2} left={2} colorScheme="brand">
                              {t('product.main')}
                            </Badge>
                          )}
                          <IconButton
                            icon={<FaTrash />}
                            aria-label={t('common.removeImage')}
                            size="sm"
                            colorScheme="red"
                            position="absolute"
                            top={2}
                            right={2}
                            onClick={() => handleRemoveImage(index)}
                          />
                        </Box>
                      ))}
                    </SimpleGrid>
                  ) : (
                    <>
                      <Icon as={FaUpload} w={8} h={8} color="#422afb" mb={2} />
                      <Text color="gray.500" mb={2}>
                        {t('forms.dragDropImageHere')}
                      </Text>
                      <Text color="gray.500" mb={2}>
                        {t('forms.or')}
                      </Text>
                      <Button
                        variant="outline"
                        color="#422afb"
                        border="none"
                        onClick={() => document.getElementById('file-upload').click()}
                      >
                        {t('forms.uploadImage')}
                        <input
                          type="file"
                          id="file-upload"
                          hidden
                          accept="image/*"
                          multiple
                          onChange={(e) => handleImageUpload(e.target.files)}
                        />
                      </Button>
                    </>
                  )}
                </Box>
              </FormControl>
            </Box>
            {/* Submit Buttons */}
            <Flex justify="flex-end" gap={4}>
              <Button variant="outline" colorScheme="red" onClick={handleCancel}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" colorScheme="blue" isLoading={isLoading}>
                {t('common.saveProduct')}
              </Button>
            </Flex>
          </form>
        </FormWrapper>
      </Box>
    </Box>
  );
};

export default AddProduct;
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
import { FaUpload, FaTrash, FaGripVertical } from 'react-icons/fa6';
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
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import SearchableSelect from 'components/SearchableSelect';

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

  // Search states for dropdowns
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [pharmacySearch, setPharmacySearch] = useState('');
  const [variantSearch, setVariantSearch] = useState('');

  const [addProduct, { isLoading }] = useAddProductMutation();
  const toast = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // Fetch data with search parameters
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useGetCategoriesQuery({
    page: 1,
    limit: 50,
    ...(categorySearch && { search: categorySearch }),
  });
  const { data: variantsResponse, isLoading: isVariantsLoading } = useGetVarientsQuery({
    page: 1,
    limit: 50,
    ...(variantSearch && { search: variantSearch }),
  });
  const { data: brandsResponse, isLoading: isBrandsLoading } = useGetBrandsQuery({ 
    page: 1,
    limit: 50,
    ...(brandSearch && { search: brandSearch }),
  });
  const { data: PharmacyResponse, isLoading: isPharmaciesLoading } = useGetPharmaciesQuery({
    page: 1,
    limit: 50,
    ...(pharmacySearch && { search: pharmacySearch }),
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
            id: `new-${Date.now()}-${Math.random()}`, // Unique ID for drag and drop
          };
        })
        .filter((img) => img !== null);

      setImages([...images, ...newImages]);
    }
  };

  const handleRemoveImage = (index) => {
    URL.revokeObjectURL(images[index].preview);
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setImages(items);
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
              isMain: index === 0, // Assuming the first image is main
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

      // Validate variants if hasVariants is true
      if (hasVariants && selectedAttributes.length === 0) {
        throw new Error('Please add at least one variant when hasVariants is enabled');
      }

      // Validate variant fields if hasVariants is true
      if (hasVariants && selectedAttributes.length > 0) {
        for (let i = 0; i < selectedAttributes.length; i++) {
          const attr = selectedAttributes[i];
          if (!attr.price || parseFloat(attr.price) <= 0) {
            throw new Error(`Price is required for variant ${i + 1}`);
          }
          if (!attr.cost || parseFloat(attr.cost) <= 0) {
            throw new Error(`Cost is required for variant ${i + 1}`);
          }
          if (!attr.quantity || parseInt(attr.quantity) <= 0) {
            throw new Error(`Quantity is required for variant ${i + 1}`);
          }
        }
      }

      // Prepare variants data if hasVariants is true
      let variantsData = undefined;
      if (hasVariants && selectedAttributes.length > 0) {
        // Upload variant images first
        const variantUploadPromises = selectedAttributes.map(async (attr) => {
          let imageKey = undefined;
          if (attr.image && attr.image instanceof File) {
            const formData = new FormData();
            formData.append('file', attr.image);
            
            try {
              const uploadResponse = await addFile(formData).unwrap();
              if (uploadResponse.success && uploadResponse.data.uploadedFiles.length > 0) {
                imageKey = uploadResponse.data.uploadedFiles[0].url;
              }
            } catch (error) {
              console.error('Failed to upload variant image:', error);
            }
          }
          
          return {
            variantId: attr.variantId,
            attributeId: attr.attributeId,
            cost: parseFloat(attr.cost) || 0,
            price: parseFloat(attr.price) || 0,
            quantity: parseInt(attr.quantity) || 0,
            imageKey: imageKey || attr.imageKey || undefined,
            isActive: attr.isActive,
            expiryDate: attr.expiryDate || undefined,
          };
        });
        
        variantsData = await Promise.all(variantUploadPromises);
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
        discountType: (discount != null && discountType && discountType.trim() !== '') ? discountType : undefined,
        lotNumber: lotNumber,
        expiryDate: expiryDate,
        hasVariants,
        isActive,
        isPublished,
        translations: translations,
        images: uploadedImages,
        variants: variantsData
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
                     <form onSubmit={handleSubmit} dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'} style={{ direction: currentLanguage === 'ar' ? 'rtl' : 'ltr', textAlign: currentLanguage === 'ar' ? 'right' : 'left' }}>
            {/* Basic Information */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              <Box>
                <FormControl isRequired>
                  <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.productName')} (English)</FormLabel>
                                     <Input
                     placeholder={t('forms.enterProductName')}
                     value={nameEn}
                     onChange={(e) => setNameEn(e.target.value)}
                     color={textColor}
                     dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                     textAlign={currentLanguage === 'ar' ? 'right' : 'left'}
                   />
                </FormControl>
              </Box>
              <Box>
                <FormControl>
                  <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.productName')} (Arabic)</FormLabel>
                  <Input
                    placeholder={t('forms.enterProductNameAr')}
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    dir="rtl"
                    color={textColor}
                    textAlign="right"
                  />
                </FormControl>
              </Box>
            </SimpleGrid>

            {/* Description Sections */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              <Box>
                <FormControl isRequired>
                  <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.descriptionEn')}</FormLabel>
                                     <Textarea
                     placeholder={t('forms.enterDescription')}
                     value={descriptionEn}
                     onChange={(e) => setDescriptionEn(e.target.value)}
                     color={textColor}
                     dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                     textAlign={currentLanguage === 'ar' ? 'right' : 'left'}
                     maxLength={500}
                   />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    {descriptionEn.length}/500 {t('common.characters')}
                  </Text>
                </FormControl>
              </Box>
              <Box>
                <FormControl>
                  <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.descriptionAr')}</FormLabel>
                  <Textarea
                    placeholder={t('forms.enterDescriptionAr')}
                    value={descriptionAr}
                    onChange={(e) => setDescriptionAr(e.target.value)}
                    dir="rtl"
                    color={textColor}
                    textAlign="right"
                    maxLength={500}
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    {descriptionAr.length}/500 {t('common.characters')}
                  </Text>
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
                  <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.howToUseEn')}</FormLabel>
                                     <Textarea
                     placeholder={t('forms.enterHowToUse')}
                     value={howToUseEn}
                     onChange={(e) => setHowToUseEn(e.target.value)}
                     color={textColor}
                     dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                     textAlign={currentLanguage === 'ar' ? 'right' : 'left'}
                     maxLength={500}
                   />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    {howToUseEn.length}/500 {t('common.characters')}
                  </Text>
                </FormControl>
              </Box>
              <Box>
                <FormControl>
                  <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.howToUseAr')}</FormLabel>
                  <Textarea
                    placeholder={t('forms.enterHowToUseAr')}
                    value={howToUseAr}
                    onChange={(e) => setHowToUseAr(e.target.value)}
                    dir="rtl"
                    color={textColor}
                    textAlign="right"
                    maxLength={500}
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    {howToUseAr.length}/500 {t('common.characters')}
                  </Text>
                </FormControl>
              </Box>

              {/* Treatment */}
              <Box>
                <FormControl>
                  <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.treatmentEn')}</FormLabel>
                                     <Textarea
                     placeholder={t('forms.enterTreatmentInformation')}
                     value={treatmentEn}
                     onChange={(e) => setTreatmentEn(e.target.value)}
                     color={textColor}
                     dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                     textAlign={currentLanguage === 'ar' ? 'right' : 'left'}
                     maxLength={500}
                   />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    {treatmentEn.length}/500 {t('common.characters')}
                  </Text>
                </FormControl>
              </Box>
              <Box>
                <FormControl>
                  <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.treatmentAr')}</FormLabel>
                  <Textarea
                    placeholder={t('forms.enterTreatmentAr')}
                    value={treatmentAr}
                    onChange={(e) => setTreatmentAr(e.target.value)}
                    dir="rtl"
                    color={textColor}
                    textAlign="right"
                    maxLength={500}
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    {treatmentAr.length}/500 {t('common.characters')}
                  </Text>
                </FormControl>
              </Box>

              {/* Ingredients */}
              <Box>
                <FormControl>
                  <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.ingredientsEn')}</FormLabel>
                                     <Textarea
                     placeholder={t('forms.enterIngredients')}
                     value={ingredientsEn}
                     onChange={(e) => setIngredientsEn(e.target.value)}
                     color={textColor}
                     dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                     textAlign={currentLanguage === 'ar' ? 'right' : 'left'}
                     maxLength={500}
                   />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    {ingredientsEn.length}/500 {t('common.characters')}
                  </Text>
                </FormControl>
              </Box>
              <Box>
                <FormControl>
                  <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.ingredientsAr')}</FormLabel>
                  <Textarea
                    placeholder={t('forms.enterIngredientsAr')}
                    value={ingredientsAr}
                    onChange={(e) => setIngredientsAr(e.target.value)}
                    dir="rtl"
                    color={textColor}
                    textAlign="right"
                    maxLength={500}
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    {ingredientsAr.length}/500 {t('common.characters')}
                  </Text>
                </FormControl>
              </Box>
            </SimpleGrid>

            {/* SKU, Lot Number, Expiry Date (only if no variants) */}
            {!hasVariants && (
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
                <Box>
                  <FormControl>
                    <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.sku')}</FormLabel>
                                         <Input
                       type="text"
                       placeholder={t('forms.enterSku')}
                       value={sku}
                       onChange={(e) => setSku(e.target.value)}
                       color={textColor}
                       dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                       textAlign={currentLanguage === 'ar' ? 'right' : 'left'}
                     />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl>
                    <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.lotNumber')}</FormLabel>
                                         <Input
                       type="text"
                       placeholder={t('forms.enterLotNumber')}
                       value={lotNumber}
                       onChange={(e) => setLotNumber(e.target.value)}
                       color={textColor}
                       dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                       textAlign={currentLanguage === 'ar' ? 'right' : 'left'}
                     />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl>
                    <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.expiryDate')}</FormLabel>
                                         <Input
                       type="date"
                       value={expiryDate}
                       onChange={(e) => setExpiryDate(e.target.value)}
                       color={textColor}
                       dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                       textAlign={currentLanguage === 'ar' ? 'right' : 'left'}
                     />
                  </FormControl>
                </Box>
              </SimpleGrid>
            )}

            {/* Category, Brand, Pharmacy and Product Type */}
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={4}>
              <SearchableSelect
                label={t('product.category')}
                    placeholder={t('forms.selectCategory')}
                    value={categoryId}
                onChange={setCategoryId}
                options={categories}
                isLoading={isCategoriesLoading}
                onSearch={setCategorySearch}
                displayKey="translations.name"
                isRequired
                noOptionsText={t('forms.noCategoriesFound')}
              />
              
              <SearchableSelect
                label={t('product.brand')}
                    placeholder={t('forms.selectBrand')}
                    value={brandId}
                onChange={setBrandId}
                options={brands}
                isLoading={isBrandsLoading}
                onSearch={setBrandSearch}
                displayKey="name"
                isRequired
                noOptionsText={t('forms.noBrandsFound')}
              />
              
              <SearchableSelect
                label={t('product.pharmacy')}
                    placeholder={t('forms.selectPharmacy')}
                    value={pharmacyId}
                onChange={setPharmacyId}
                options={pharmacies}
                isLoading={isPharmaciesLoading}
                onSearch={setPharmacySearch}
                displayKey="name"
                noOptionsText={t('forms.noPharmaciesFound')}
              />
              
              <Box>
                <FormControl>
                  <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.productType')}</FormLabel>
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
                  <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.cost')}</FormLabel>
                                     <Input
                     type="number"
                     placeholder={t('forms.enterCost')}
                     value={cost}
                     onChange={(e) => setCost(e.target.value)}
                     color={textColor}
                     dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                     textAlign={currentLanguage === 'ar' ? 'right' : 'left'}
                     min="0"
                     step="0.01"
                   />
                </FormControl>
              </Box>
              <Box>
                <FormControl isRequired>
                  <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.price')}</FormLabel>
                                     <Input
                     type="number"
                     placeholder={t('forms.enterPrice')}
                     value={price}
                     onChange={(e) => setPrice(e.target.value)}
                     color={textColor}
                     dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                     textAlign={currentLanguage === 'ar' ? 'right' : 'left'}
                     min="0"
                     onKeyDown={(e) => {
                       if (e.key === '-') {
                         e.preventDefault();
                       }
                     }}
                   />
                </FormControl>
              </Box>
              <Box>
                <FormControl isRequired>
                  <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.quantity')}</FormLabel>
                                     <Input
                     type="number"
                     placeholder={t('forms.enterQuantity')}
                     value={quantity}
                     onChange={(e) => {
                       const value = e.target.value;
                       if (value.length <= 5) {
                         setQuantity(value);
                       }
                     }}
                     color={textColor}
                     dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                     textAlign={currentLanguage === 'ar' ? 'right' : 'left'}
                     min="0"
                     max="99999"
                     onKeyDown={(e) => {
                       if (e.key === '-') {
                         e.preventDefault();
                       }
                     }}
                   />
                </FormControl>
              </Box>
              
            </SimpleGrid>

            {/* Offer Type */}
            <Box mb={4}>
              <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.offerType')}</FormLabel>
              <RadioGroup value={offerType} onChange={setOfferType} textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>
                <Stack direction={currentLanguage === 'ar' ? 'row-reverse' : 'row'} justifyContent={currentLanguage === 'ar' ? 'flex-start' : 'flex-end'}>
                  <Radio value="MONTHLY_OFFER">{t('forms.monthlyOffer')}</Radio>
                  <Radio value="NEW_ARRIVAL">{t('forms.newArrival')}</Radio>
                  <Radio value="BEST_SELLER">{t('forms.bestSeller')}</Radio>
                  <Radio value="NONE">{t('forms.none')}</Radio>
                </Stack>
              </RadioGroup>
              {offerType === 'MONTHLY_OFFER' && (
                <Box mt={2}>
                  <FormControl>
                    <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('forms.offerPercentage')}</FormLabel>
                                         <Input
                       type="number"
                       placeholder={t('forms.enterOfferPercentage')}
                       value={offerPercentage}
                       onChange={(e) => setOfferPercentage(e.target.value)}
                       color={textColor}
                       dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                       textAlign={currentLanguage === 'ar' ? 'right' : 'left'}
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
                    <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.discount')}</FormLabel>
                                         <Input
                       type="number"
                       placeholder={t('forms.enterDiscountValue')}
                       value={discount != null ? discount : ''}
                       onChange={(e) => setDiscount(e.target.value)}
                       color={textColor}
                       dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                       textAlign={currentLanguage === 'ar' ? 'right' : 'left'}
                       min="0"
                       onKeyDown={(e) => {
                         if (e.key === '-') {
                           e.preventDefault();
                         }
                       }}
                     />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl>
                    <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.discountType')}</FormLabel>
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
                <FormLabel mb="0" textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.isPublished')}</FormLabel>
                <Switch
                  isChecked={isPublished}
                  onChange={() => setIsPublished(!isPublished)}
                  style={{ direction: 'ltr' }}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0" textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.isActive')}</FormLabel>
                <Switch
                  isChecked={isActive}
                  onChange={() => setIsActive(!isActive)}
                  style={{ direction: 'ltr' }}
                />
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0" textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.hasVariants')}</FormLabel>
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
                <Box mb={4}>
                  <SearchableSelect
                    label={t('product.selectVariant')}
                    placeholder={t('forms.selectVariant')}
                    value=""
                    onChange={(variantId) => {
                      const event = { target: { value: variantId } };
                      handleVariantSelect(event);
                    }}
                    options={variants}
                    isLoading={isVariantsLoading}
                    onSearch={setVariantSearch}
                    displayKey="name"
                    noOptionsText={t('forms.noVariantsFound')}
                  />
                </Box>

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
                              <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.cost')}</FormLabel>
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
                                textAlign="left"
                                min="0"
                                step="0.01"
                              />
                            </FormControl>
                            <FormControl isRequired>
                              <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.price')}</FormLabel>
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
                                textAlign="left"
                                min="0"
                                onKeyDown={(e) => {
                                  if (e.key === '-') {
                                    e.preventDefault();
                                  }
                                }}
                              />
                            </FormControl>
                            <FormControl isRequired>
                              <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.quantity')}</FormLabel>
                              <Input
                                type="number"
                                value={attr.quantity}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value.length <= 5) {
                                    handleAttributeChange(
                                      index,
                                      'quantity',
                                      value,
                                    );
                                  }
                                }}
                                color={textColor}
                                textAlign="left"
                                min="0"
                                max="99999"
                                onKeyDown={(e) => {
                                  if (e.key === '-') {
                                    e.preventDefault();
                                  }
                                }}
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.variantImage')}</FormLabel>
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
                                textAlign="left"
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

                            {/* Variant Expiry Date */}
                            <FormControl>
                              <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>{t('product.expiryDate')}</FormLabel>
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
                <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>
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
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="images" direction="horizontal">
                        {(provided) => (
                          <SimpleGrid 
                            columns={{ base: 2, md: 4 }} 
                            spacing={4}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {images.map((img, index) => (
                              <Draggable key={img.id} draggableId={img.id} index={index}>
                                {(provided, snapshot) => (
                                  <Box
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    position="relative"
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center"
                                    opacity={snapshot.isDragging ? 0.8 : 1}
                                  >
                                    <Box
                                      {...provided.dragHandleProps}
                                      position="absolute"
                                      top={2}
                                      left={2}
                                      zIndex={2}
                                      cursor="grab"
                                      _hover={{ cursor: 'grabbing' }}
                                    >
                                      <Icon as={FaGripVertical} color="white" bg="blackAlpha.600" borderRadius="sm" p={1} />
                                    </Box>
                                    <Image
                                      src={img.preview}
                                      alt={t('product.productImage', { index: index + 1 })}
                                      borderRadius="md"
                                      maxH="150px"
                                      border={index === 0 ? '2px solid' : '1px solid'}
                                      borderColor={index === 0 ? 'brand.500' : 'gray.300'}
                                    />
                                    {index === 0 && (
                                      <Badge position="absolute" top={2} right={2} colorScheme="brand">
                                        {t('product.main')}
                                      </Badge>
                                    )}
                                    <Badge position="absolute" bottom={2} left={2} colorScheme="gray">
                                      {index + 1}
                                    </Badge>
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
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </SimpleGrid>
                        )}
                      </Droppable>
                    </DragDropContext>
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
                {images.length > 0 && (
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    {t('product.dragToReorder')} • {t('product.firstImageMain')}
                  </Text>
                )}
              </FormControl>
            </Box>
            {/* Submit Buttons */}
            <Flex justify={currentLanguage === 'ar' ? 'flex-start' : 'flex-end'} gap={4}>
              <Button 
                variant="outline" 
                colorScheme="red" 
                onClick={handleCancel}
                isDisabled={isLoading}
              >
                {t('common.cancel')}
              </Button>
              <Button 
                type="submit" 
                colorScheme="blue" 
                isLoading={isLoading}
                isDisabled={isLoading}
                loadingText={t('common.saving')}
              >
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
import React, { useEffect, useState } from 'react';
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
  Spinner,
} from '@chakra-ui/react';
import { FaUpload, FaTrash } from 'react-icons/fa6';
import { IoMdArrowBack } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetVarientsQuery } from 'api/varientSlice';
import { useGetCategoriesQuery } from 'api/categorySlice';
import { useGetBrandsQuery } from 'api/brandSlice';
import { useGetPharmaciesQuery } from 'api/pharmacySlice';
import { useGetProductQuery, useUpdateProductMutation } from 'api/productSlice';
import Swal from 'sweetalert2';
import { useAddFileMutation } from 'api/filesSlice';
import { useGetTypesQuery } from 'api/typeSlice';
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // State for form fields
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [pharmacyId, setPharmacyId] = useState('');
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [productTypeId, setProductTypeId] = useState(''); // New state for product type
  const [offerType, setOfferType] = useState('');
  const [offerPercentage, setOfferPercentage] = useState('');
  const [hasVariants, setHasVariants] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isPublished, setIsPublished] = useState(false);
  const [images, setImages] = useState([]); // Newly uploaded images
  const [existingImages, setExistingImages] = useState([]); // Existing images from server
  const [mainImageIndex, setMainImageIndex] = useState(0);
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
  const [discount, setDiscount] = useState(null);
  const [discountType, setDiscountType] = useState(null); // Assuming discountType might be needed later, adding state for consistency

  // State for variants
  const [selectedAttributes, setSelectedAttributes] = useState([]);

  // API queries
  const { data: productResponse, isLoading: isProductLoading , refetch } =
    useGetProductQuery(id);

       // Trigger refetch when component mounts (navigates to)
   React.useEffect(() => {
    // Only trigger refetch if the data is not being loaded
    if (!isProductLoading) {
      refetch(); // Manually trigger refetch when component is mounted
    }
  }, [refetch, isProductLoading]); // Dependency array to ensure it only runs on mount

  
  const { data: categoriesResponse } = useGetCategoriesQuery({
    page: 1,
    limit: 1000,
  });
  const { data: variantsResponse } = useGetVarientsQuery({
    page: 1,
    limit: 1000,
  });
  const { data: brandsResponse } = useGetBrandsQuery({ page: 1, limit: 1000 });
  const { data: pharmaciesResponse } = useGetPharmaciesQuery({
    page: 1,
    limit: 1000,
  });
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const { data: productTypesResponse } = useGetTypesQuery({ page: 1, limit: 1000 }); // Fetch product types
  const productTypes = productTypesResponse?.data?.items || []; // Get product types from response

  // Extract data from responses
  const product = productResponse?.data;
  const categories = categoriesResponse?.data?.data || [];
  const variants = variantsResponse?.data || [];
  const brands = brandsResponse?.data || [];
  const pharmacies = pharmaciesResponse?.data?.items || [];
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const [addFile] = useAddFileMutation();
  // Initialize form with product data
  useEffect(() => {
    if (product) {
      setNameEn(product.name || '');
      setNameAr(
        product.translations?.find((t) => t.languageId === 'ar')?.name || '',
      );
      setDescriptionEn(product.description || '');
      setDescriptionAr(
        product.translations?.find((t) => t.languageId === 'ar')?.description ||
          '',
      );
      setCategoryId(product.categoryId || '');
      setBrandId(product.brandId || '');
      setPharmacyId(product.pharmacyId || '');
      setProductTypeId(product.productTypeId || '');
      setCost(product.cost || '');
      setPrice(product.price || '');
      setQuantity(product.quantity || '');
      setOfferType(product.offerType || '');
      setOfferPercentage(product.offerPercentage || '');
      setHasVariants(product.hasVariants || false);
      setIsActive(product.isActive ?? true);
      setIsPublished(product.isPublished ?? false);

      // Set existing images
      if (product.images?.length > 0) {
        setExistingImages(product.images);
        const mainIndex = product.images.findIndex((img) => img.isMain);
        setMainImageIndex(mainIndex >= 0 ? mainIndex : 0);
      }

      // Set variants if they exist
      if (product.variants?.length > 0) {
        const attributes = product.variants.map((variant) => ({
          variantId: variant.variantId,
          variantName: variant.variantName || 'Variant',
          attributeId: variant.attributeId,
          attributeValue: variant.attributeValue || '',
          cost: variant.cost || '',
          price: variant.price || '',
          quantity: variant.quantity || '',
          image: variant.imageKey
            ? { name: variant.imageKey }
            : null,
          isActive: variant.isActive ?? true,
          expiryDate: variant.expiryDate || '',
        }));
        setSelectedAttributes(attributes);
      }

      // Initialize new fields
      setSku(product.sku || '');
      setLotNumber(product.lotNumber || '');
      setExpiryDate(product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '');
      // setGuideLineEn(product.translations?.find(t => t.languageId === 'en')?.guideLine || '');
      // setGuideLineAr(product.translations?.find(t => t.languageId === 'ar')?.guideLine || '');
      setHowToUseEn(product.howToUse || '');
      setHowToUseAr(product.translations?.find(t => t.languageId === 'ar')?.howToUse || '');
      setTreatmentEn(product.treatment || '');
      setTreatmentAr(product.translations?.find(t => t.languageId === 'ar')?.treatment || '');
      setIngredientsEn(product.ingredient || '');
      setIngredientsAr(product.translations?.find(t => t.languageId === 'ar')?.ingredient || '');
      setDiscount(product.discount != null ? product.discount : '');
      setDiscountType(product.discountType || '');
    }
  }, [product]);

  // Image handling
  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      const newImages = Array.from(files)
        .map((file) => {
          // Validate file type
          if (!file.type.startsWith('image/')) {
            toast({
              title: 'Error',
              description: 'Please upload only image files',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
            return null;
          }
          return {
            file,
            preview: URL.createObjectURL(file),
            isMain: images.length === 0 && existingImages.length === 0, // First image is main if no others exist
          };
        })
        .filter((img) => img !== null);

      setImages([...images, ...newImages]);

      // Set first uploaded image as main if no main exists
      if (
        existingImages.length === 0 &&
        images.length === 0 &&
        newImages.length > 0
      ) {
        setMainImageIndex(0);
      }
    }
  };

  const handleSetMainImage = (index, isExisting) => {
    if (isExisting) {
      setMainImageIndex(index);
      // Update isMain flags for existing images
      setExistingImages(
        existingImages.map((img, i) => ({
          ...img,
          isMain: i === index,
        })),
      );
    } else {
      // For new images, the index is offset by existing images count
      setMainImageIndex(index + existingImages.length);
    }
  };
  const handleRemoveImage = (index, isExisting) => {
    if (isExisting) {
      setExistingImages(existingImages.filter((_, i) => i !== index));
      if (mainImageIndex === index) {
        setMainImageIndex(0); // Reset to first image if main was removed
      } else if (mainImageIndex > index) {
        setMainImageIndex(mainImageIndex - 1); // Adjust index if needed
      }
    } else {
      const newIndex = index - existingImages.length;
      URL.revokeObjectURL(images[newIndex].preview); // Clean up memory

      const newImages = images.filter((_, i) => i !== newIndex);
      setImages(newImages);

      if (mainImageIndex === index) {
        setMainImageIndex(0);
      } else if (mainImageIndex > index) {
        setMainImageIndex(mainImageIndex - 1);
      }
    }
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
      // Upload new images first
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
              order: existingImages.length + index,
              isMain: existingImages.length + index === mainImageIndex,
            };
          }
          return null;
        });

        const results = await Promise.all(imageUploadPromises);
        uploadedImages.push(...results.filter((img) => img !== null));
      }

      // Prepare existing images data
      const existingImagesData = existingImages.map((img, index) => ({
        id: img.id,
        imageKey: img.imageKey,
        order: index,
        isMain: index === mainImageIndex,
      }));

      // Prepare translations
      const translations = [];
      if (nameAr || descriptionAr || howToUseAr || treatmentAr || ingredientsAr) {
        translations.push({
          languageId: 'ar',
          name: nameAr,
          description: descriptionAr,
          howToUse: howToUseAr,
          treatment: treatmentAr,
          ingredients: ingredientsAr,
        });
      }
      if (nameEn || descriptionEn || howToUseEn || treatmentEn || ingredientsEn) {
        translations.push({
          languageId: 'en',
          name: nameEn,
          description: descriptionEn,
         
          howToUse: howToUseEn,
          treatment: treatmentEn,
          ingredients: ingredientsEn,
        });
      }

      // Prepare variants data
      const variantsData = selectedAttributes.map((attr) => ({
        variantId: attr.variantId,
        attributeId: attr.attributeId,
        cost: parseFloat(attr.cost) || 0,
        price: parseFloat(attr.price) || 0,
        quantity: parseInt(attr.quantity) || 0,
        imageKey: attr.imageKey || undefined,
        isActive: attr.isActive,
        expiryDate: attr.expiryDate || undefined,
      }));

      // Prepare product data
      const productData = {
        name: nameEn,
        description: descriptionEn,
        categoryId,
        brandId,
        pharmacyId,
        productTypeId,
        cost: cost ? parseFloat(cost) : null,
        price: parseFloat(price),
        quantity: quantity ? parseInt(quantity) : null,
        offerType: offerType || null,
        offerPercentage: offerPercentage ? parseFloat(offerPercentage) : null,
        hasVariants,
        isActive,
        isPublished,
        translations: translations.filter((t) => t.name || t.description || t.guideLine || t.howToUse || t.treatment || t.ingredients),
        images: [...existingImagesData, ...uploadedImages],
        variants: hasVariants ? variantsData : undefined,
        ...( !hasVariants && { sku: sku || undefined }),
        ...( !hasVariants && { lotNumber: lotNumber || undefined }),
        ...( !hasVariants && { expiryDate: expiryDate || undefined }),
        ...( !hasVariants && { discount: discount != null ? parseFloat(discount) : undefined }),
        ...( !hasVariants && { discountType: discountType ? discountType.toUpperCase() : undefined }),
      };

      // Remove null values
      Object.keys(productData).forEach((key) => {
        if (productData[key] === null || productData[key] === undefined) {
          delete productData[key];
        }
      });

      // Submit to API
      const response = await updateProduct({ id, data: productData }).unwrap();

      toast({
        title: 'Success',
        description: 'Product updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      navigate('/admin/products');
    } catch (err) {
      toast({
        title: 'Error',
        description:
          err.data?.message || err.message || 'Failed to update product',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will lose all unsaved changes',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, discard changes',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/admin/products');
      }
    });
  };

  if (isProductLoading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!product) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Text>Product not found</Text>
      </Flex>
    );
  }

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
            {t('product.editProduct')}
          </Text>
          <Button
            type="button"
            onClick={handleCancel}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('common.back')}
          </Button>
        </div>
        <form onSubmit={handleSubmit} dir="rtl">
          {/* Basic Information */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
            <Box>
              <FormControl isRequired>
                <FormLabel>{t('product.productNameEn')}</FormLabel>
                <Input
                  placeholder={t('product.enterProductName')}
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  color={textColor}
                />
              </FormControl>
            </Box>
            <Box>
              <FormControl>
                <FormLabel>{t('product.productNameAr')}</FormLabel>
                <Input
                  placeholder={t('product.enterProductNameArabic')}
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  dir="rtl"
                  color={textColor}
                />
              </FormControl>
            </Box>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
            <Box>
              <FormControl isRequired>
                <FormLabel>{t('product.descriptionEn')}</FormLabel>
                <Textarea
                  placeholder={t('product.enterProductDescription')}
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  color={textColor}
                  maxLength={500}
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  {descriptionEn.length}/500 {t('common.characters')}
                </Text>
              </FormControl>
            </Box>
            <Box>
              <FormControl>
                <FormLabel>{t('product.descriptionAr')}</FormLabel>
                <Textarea
                  placeholder={t('product.enterProductDescriptionArabic')}
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  dir="rtl"
                  color={textColor}
                  maxLength={500}
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  {descriptionAr.length}/500 {t('common.characters')}
                </Text>
              </FormControl>
            </Box>
          </SimpleGrid>

          {/* Guide Line */}
          {/* <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
            <Box>
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
            </Box>
          </SimpleGrid> */}

          {/* How To Use */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
            <Box>
              <FormControl>
                <FormLabel>{t('product.howToUseEn')}</FormLabel>
                <Textarea
                  placeholder={t('product.enterHowToUse')}
                  value={howToUseEn}
                  onChange={(e) => setHowToUseEn(e.target.value)}
                  color={textColor}
                  maxLength={500}
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  {howToUseEn.length}/500 {t('common.characters')}
                </Text>
              </FormControl>
            </Box>
            <Box>
              <FormControl>
                <FormLabel>{t('product.howToUseAr')}</FormLabel>
                <Textarea
                  placeholder={t('product.enterHowToUseArabic')}
                  value={howToUseAr}
                  onChange={(e) => setHowToUseAr(e.target.value)}
                  dir="rtl"
                  color={textColor}
                  maxLength={500}
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  {howToUseAr.length}/500 {t('common.characters')}
                </Text>
              </FormControl>
            </Box>
          </SimpleGrid>

          {/* Treatment */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
            <Box>
              <FormControl>
                <FormLabel>{t('product.treatmentEn')}</FormLabel>
                <Textarea
                  placeholder={t('product.enterTreatmentInformation')}
                  value={treatmentEn}
                  onChange={(e) => setTreatmentEn(e.target.value)}
                  color={textColor}
                  maxLength={500}
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  {treatmentEn.length}/500 {t('common.characters')}
                </Text>
              </FormControl>
            </Box>
            <Box>
              <FormControl>
                <FormLabel>{t('product.treatmentAr')}</FormLabel>
                <Textarea
                  placeholder={t('product.enterTreatmentInformationArabic')}
                  value={treatmentAr}
                  onChange={(e) => setTreatmentAr(e.target.value)}
                  dir="rtl"
                  color={textColor}
                  maxLength={500}
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  {treatmentAr.length}/500 {t('common.characters')}
                </Text>
              </FormControl>
            </Box>
          </SimpleGrid>

          {/* Ingredients */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
            <Box>
              <FormControl>
                <FormLabel>{t('product.ingredientsEn')}</FormLabel>
                <Textarea
                  placeholder={t('product.enterIngredients')}
                  value={ingredientsEn}
                  onChange={(e) => setIngredientsEn(e.target.value)}
                  color={textColor}
                  maxLength={500}
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  {ingredientsEn.length}/500 {t('common.characters')}
                </Text>
              </FormControl>
            </Box>
            <Box>
              <FormControl>
                <FormLabel>{t('product.ingredientsAr')}</FormLabel>
                <Textarea
                  placeholder={t('product.enterIngredientsArabic')}
                  value={ingredientsAr}
                  onChange={(e) => setIngredientsAr(e.target.value)}
                  dir="rtl"
                  color={textColor}
                  maxLength={500}
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  {ingredientsAr.length}/500 {t('common.characters')}
                </Text>
              </FormControl>
            </Box>
          </SimpleGrid>

          {/* Category, Brand, and Pharmacy */}
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={4}>
            <Box>
              <FormControl isRequired>
                <FormLabel>{t('product.category')}</FormLabel>
                <Select
                  placeholder={t('product.selectCategory')}
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
                  placeholder={t('product.selectBrand')}
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
              <FormControl isRequired>
                <FormLabel>{t('product.pharmacy')}</FormLabel>
                <Select
                  placeholder={t('product.selectPharmacy')}
                  value={pharmacyId}
                  onChange={(e) => setPharmacyId(e.target.value)}
                  color={textColor}
                  style={{ direction: 'ltr' }}
                >
                  {pharmacies.map((pharmacy) => (
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
                    placeholder={t('product.selectProductType')}
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

          {/* Pricing Information */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
            <Box>
              <FormControl>
                <FormLabel>{t('product.cost')}</FormLabel>
                <Input
                  type="number"
                  placeholder={t('product.enterCost')}
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  color={textColor}
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
                <FormLabel>{t('product.price')}</FormLabel>
                <Input
                  type="number"
                  placeholder={t('product.enterPrice')}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  color={textColor}
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
                <FormLabel>{t('product.quantity')}</FormLabel>
                <Input
                  type="number"
                  placeholder={t('product.enterQuantity')}
                  value={quantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 5) {
                      setQuantity(value);
                    }
                  }}
                  color={textColor}
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

          {/* SKU, Lot Number, Expiry Date, Discount (only if no variants) */}
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={4}>
              <Box>
                <FormControl>
                  <FormLabel>{t('product.sku')}</FormLabel>
                  <Input
                    type="text"
                    placeholder={t('product.enterSKU')}
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
                    placeholder={t('product.enterLotNumber')}
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
               <Box>
                <FormControl>
                  <FormLabel>{t('product.discount')}</FormLabel>
                  <Input
                    type="number"
                    placeholder={t('product.enterDiscountValue')}
                    value={discount != null ? discount : ''}
                    onChange={(e) => setDiscount(e.target.value)}
                    color={textColor}
                    min="0"
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
            <FormLabel>{t('product.offerType')}</FormLabel>
            <RadioGroup
              value={offerType}
              onChange={(value) => {
                setOfferType(value);
                if (value !== 'MONTHLY_OFFER') {
                  setOfferPercentage('');
                }
              }}
            >
              <Stack direction="row">
                <Radio value="MONTHLY_OFFER">Monthly Offer</Radio>
                <Radio value="NEW_ARRIVAL">New Arrival</Radio>
                <Radio value="">None</Radio>
              </Stack>
            </RadioGroup>
            {offerType === 'MONTHLY_OFFER' && (
              <Box mt={2}>
                <FormControl>
                  <FormLabel>{t('product.offerPercentage')}</FormLabel>
                  <Input
                    type="number"
                    placeholder={t('product.enterOfferPercentage')}
                    value={offerPercentage}
                    onChange={(e) => setOfferPercentage(e.target.value)}
                    color={textColor}
                  />
                </FormControl>
              </Box>
            )}
          </Box>

          {/* Status Switches */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">{t('product.hasVariants')}</FormLabel>
              <Switch
                isChecked={hasVariants}
                onChange={() => setHasVariants(!hasVariants)}
                style={{ direction: 'ltr' }}
              />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">{t('product.active')}</FormLabel>
              <Switch
                isChecked={isActive}
                onChange={() => setIsActive(!isActive)}
                style={{ direction: 'ltr' }}
              />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">{t('product.published')}</FormLabel>
              <Switch
                isChecked={isPublished}
                onChange={() => setIsPublished(!isPublished)}
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
                  placeholder={t('product.selectVariant')}
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
                            aria-label="Delete variant"
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteAttribute(index)}
                          />
                        </Flex>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={2} spacing={2}>
                          <FormControl>
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
                              min="0"
                              onKeyDown={(e) => {
                                if (e.key === '-') {
                                  e.preventDefault();
                                }
                              }}
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
                              min="0"
                              onKeyDown={(e) => {
                                if (e.key === '-') {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>{t('product.quantity')}</FormLabel>
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
                            <FormLabel>{t('product.variantImage')}</FormLabel>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleAttributeChange(
                                  index,
                                  'image',
                                  e.target.files[0],
                                )
                              }
                              color={textColor}
                            />
                            {attr.image && (
                              <Box mt={2}>
                                <Image
                                  src={attr.image ? attr.image.name : undefined}
                                  alt="Selected variant"
                                  boxSize="100px"
                                  objectFit="cover"
                                  borderRadius="md"
                                />
                              </Box>
                            )}
                          </FormControl>

                          {/* Variant Expiry Date */}
                          <FormControl>
                            <FormLabel>{t('product.expiryDate')}</FormLabel>
                            <Input
                              type="date"
                              value={attr.expiryDate}
                              onChange={(e) =>
                                handleAttributeChange(index, 'expiryDate', e.target.value)
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
            <FormControl>
              <FormLabel>{t('product.productImages')}</FormLabel>
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
                {(existingImages.length > 0 || images.length > 0) ? (
                  <>
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
                      {existingImages.map((img, index) => (
                        <Box key={`existing-${index}`} position="relative" display="flex" flexDirection="column" alignItems="center">
                          <Image
                            src={img.imageKey}
                            alt={`Product image ${index + 1}`}
                            borderRadius="md"
                            maxH="150px"
                            border={index === mainImageIndex ? '2px solid' : '1px solid'}
                            borderColor={index === mainImageIndex ? 'brand.500' : 'gray.300'}
                            cursor="pointer"
                            onClick={() => handleSetMainImage(index, true)}
                          />
                          {index === mainImageIndex && (
                            <Badge position="absolute" top={2} left={2} colorScheme="brand">
                              Main
                            </Badge>
                          )}
                          <IconButton
                            icon={<FaTrash />}
                            aria-label="Remove image"
                            size="sm"
                            colorScheme="red"
                            position="absolute"
                            top={2}
                            right={2}
                            onClick={() => handleRemoveImage(index, true)}
                          />
                        </Box>
                      ))}
                      {images.map((img, index) => {
                        const globalIndex = existingImages.length + index;
                        return (
                          <Box key={`new-${index}`} position="relative" display="flex" flexDirection="column" alignItems="center">
                            <Image
                              src={img.preview}
                              alt={`New image ${index + 1}`}
                              borderRadius="md"
                              maxH="150px"
                              border={globalIndex === mainImageIndex ? '2px solid' : '1px solid'}
                              borderColor={globalIndex === mainImageIndex ? 'brand.500' : 'gray.300'}
                              cursor="pointer"
                              onClick={() => handleSetMainImage(globalIndex, false)}
                            />
                            {globalIndex === mainImageIndex && (
                              <Badge position="absolute" top={2} left={2} colorScheme="brand">
                                Main
                              </Badge>
                            )}
                            <IconButton
                              icon={<FaTrash />}
                              aria-label="Remove image"
                              size="sm"
                              colorScheme="red"
                              position="absolute"
                              top={2}
                              right={2}
                              onClick={() => handleRemoveImage(globalIndex, false)}
                            />
                          </Box>
                        );
                      })}
                    </SimpleGrid>
                    
                    {/* Add More Images Section */}
                    <Box 
                      border="1px dashed" 
                      borderColor="gray.300" 
                      borderRadius="md" 
                      p={4} 
                      textAlign="center"
                      backgroundColor="gray.50"
                      cursor="pointer"
                      onClick={() => document.getElementById('file-upload').click()}
                      _hover={{ backgroundColor: 'gray.100' }}
                    >
                      <Icon as={FaUpload} w={6} h={6} color="#422afb" mb={2} />
                      <Text color="gray.600" fontSize="sm">
                        {t('product.addMoreImages')}
                      </Text>
                      <Text color="gray.500" fontSize="xs">
                        {t('product.dragDropImageHere')} {t('common.or')} {t('product.clickToUpload')}
                      </Text>
                      <input
                        type="file"
                        id="file-upload"
                        hidden
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(e.target.files)}
                      />
                    </Box>
                  </>
                ) : (
                  <>
                    <Icon as={FaUpload} w={8} h={8} color="#422afb" mb={2} />
                    <Text color="gray.500" mb={2}>
                      {t('product.dragDropImageHere')}
                    </Text>
                    <Text color="gray.500" mb={2}>
                      {t('common.or')}
                    </Text>
                    <Button
                      variant="outline"
                      color="#422afb"
                      border="none"
                      onClick={() => document.getElementById('file-upload').click()}
                    >
                      {t('product.uploadImage')}
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
            <Button 
              variant="outline" 
              colorScheme="red" 
              onClick={handleCancel}
              isDisabled={isUpdating}
            >
              {t('product.cancel')}
            </Button>
            <Button 
              type="submit" 
              colorScheme="blue" 
              isLoading={isUpdating}
              isDisabled={isUpdating}
              loadingText={t('common.saving')}
            >
              {t('product.updateProduct')}
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default EditProduct;

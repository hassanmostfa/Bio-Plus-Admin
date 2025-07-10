import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
  Grid,
  GridItem,
  Textarea,
  Icon,
  Radio,
  RadioGroup,
  Stack,
  SimpleGrid,
  useToast,
  Checkbox,
} from '@chakra-ui/react';
import { IoMdArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { FaUpload } from 'react-icons/fa6';
import { useAddPharmacyMutation } from 'api/pharmacySlice';
import { useAddFileMutation } from 'api/filesSlice';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../contexts/LanguageContext';

const AddPharmacy = () => {
  const [formData, setFormData] = useState({
    name: '',
    imageKey: '',
    description: '',
    whatsappNumber: '',
    numOfBranches: 0,
    email: '',
    password: '',
    workingHours: '',
    revenueShare: 0, // Percentage
    fixedFees: 0, // Fixed amount
    feesStartDate: '',
    feesEndDate: '',
    isActive: true,
 
    hasZoneDelivery: false,
    hasSameDayDispatch: false,
    hasDeliveryFee: false,
    isHealthyPharmacyDelivery: false,
    translations: [
      {
        languageId: 'ar',
        name: '',
        description: '',
      },
      {
        languageId: 'en',
        name: '',
        description: '',
      },
    ],
    branches: [],
  });

  const [numberOfBranches, setNumberOfBranches] = useState(0); // State for number of branches
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const navigate = useNavigate();
  const toast = useToast();
  const [error, setError] = useState(null);
  const [addFile] = useAddFileMutation();
  // Mutation hook for creating a pharmacy
  const [createPharmacy, { isLoading }] = useAddPharmacyMutation();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleTranslationChange = (languageId, field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      translations: prevData.translations?.map((translation) =>
        translation.languageId === languageId
          ? { ...translation, [field]: value }
          : translation
      ),
    }));
  };

  const handleRevenueShareTypeChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      revenueShareType: value,
      revenueShare: value === 'percentage' ? prevData.revenueShare : 0,
      fixedFees: value === 'fixed' ? prevData.fixedFees : 0,
    }));
  };

  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setImage(selectedFile);
      
      // Update the form data with the file name (temporary until we get the actual key from API)
      setFormData((prevData) => ({
        ...prevData,
        imageKey: selectedFile.name,
      }));
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
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    handleImageUpload(files);
  };

  const handleNumberOfBranchesChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setNumberOfBranches(value >= 0 ? value : ''); // Ensure the value is non-negative

    // Initialize branches array with empty objects
    setFormData((prevData) => ({
      ...prevData,
      numOfBranches: value,
      branches: Array.from({ length: value })?.map((_, index) => ({
        name: '',
        address: '',
        locationLink: '',
        isActive: true,
        translations: [
          {
            languageId: 'ar',
            name: '',
            address: '',
          },
          {
            languageId: 'en',
            name: '',
            address: '',
          },
        ],
      })),
    }));
  };

  const handleBranchChange = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      branches: prevData.branches?.map((branch, i) =>
        i === index
          ? {
              ...branch,
              name: branch.translations.find((t) => t.languageId === 'en').name,
              address: branch.translations.find((t) => t.languageId === 'en')
                .address,
            }
          : branch
      ),
    }));
  };

  const handleBranchTranslationChange = (index, languageId, field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      branches: prevData.branches?.map((branch, i) =>
        i === index
          ? {
              ...branch,
              name: branch.translations.find((t) => t.languageId === 'en').name,
              address: branch.translations.find((t) => t.languageId === 'en')
                .address,
              translations: branch.translations?.map((translation) =>
                translation.languageId === languageId
                  ? { ...translation, [field]: value }
                  : translation
              ),
            }
          : branch
      ),
    }));
  };

  const handleSend = async () => {
    try {
      // First upload the image if it exists
      let imageKey = formData.imageKey;
      if (image) {
        const formDataFile = new FormData();
        formDataFile.append('file', image); // Use 'file' as the key as per your API requirement
        
        const uploadResponse = await addFile(formDataFile).unwrap();
        
        if (uploadResponse.success && uploadResponse.data.uploadedFiles.length > 0) {
          imageKey = uploadResponse?.data?.uploadedFiles[0]?.url;
        }
      }
  
      // Format the data based on revenueShareType
      const payload = {
        ...formData,
        imageKey, // Use the uploaded image key
        feesStartDate: formData.feesStartDate ? formData.feesStartDate + 'T00:00:00Z' : '2024-05-01T00:00:00Z',
        feesEndDate: formData.feesEndDate ? formData.feesEndDate + 'T00:00:00Z' : '2025-05-01T00:00:00Z',
        name: formData.translations.find((t) => t.languageId === 'en').name,
        description: formData.translations.find((t) => t.languageId === 'en').description,
        revenueShare: formData.revenueShareType === 'percentage' ? parseInt(formData.revenueShare) : 0,
        fixedFees: formData.revenueShareType === 'fixed' ? parseInt(formData.fixedFees) : 0,

      };
      delete payload.revenueShareType;
  
      // Send the data to the API
      const response = await createPharmacy(payload).unwrap();
  
      // Show success message
      toast({
        title: 'Success',
        description: 'Pharmacy created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
  
      // Navigate back or to another page
      navigate('/admin/pharmacy');
    } catch (error) {
      setError(error.data);
      // Show error message
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to create pharmacy',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  return (
    <Box w={"100%"} 
     className="container add-admin-container w-100">
      <Box bg={cardBg} className="add-admin-card shadow p-4 w-100">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            {t('pharmacy.addNewPharmacy')}
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('pharmacy.back')}
          </Button>
        </div>
        <form dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
          {error?.success === false && (
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Validation failed</h4>
              <ul>
                {error.errors?.map((err) => (
                  <li key={err.field}>
                    {err.field} - {err.message.en || err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            {/* Row 1: Pharmacy Name En and Pharmacy Name Ar */}
            <GridItem>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('pharmacy.pharmacyNameEn')} <span className="text-danger">*</span>
              </Text>
              <Input
                name="name"
                value={formData.translations.find((t) => t.languageId === 'en').name}
                onChange={(e) => handleTranslationChange('en', 'name', e.target.value)}
                mt={2}
                bg={inputBg}
                color={textColor}
              />
            </GridItem>
            <GridItem>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('pharmacy.pharmacyNameAr')} <span className="text-danger">*</span>
              </Text>
              <Input
                name="nameAr"
                value={formData.translations.find((t) => t.languageId === 'ar').name}
                onChange={(e) => handleTranslationChange('ar', 'name', e.target.value)}
                mt={2}
                bg={inputBg}
                color={textColor}
              />
            </GridItem>

            {/* Row 2: Email and Iban */}
            <GridItem>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('pharmacy.email')} <span className="text-danger">*</span>
              </Text>
              <Input name="email"
                bg={inputBg}
                color={textColor}
                value={formData.email}
                onChange={handleChange} mt={2} 
                />
            </GridItem>
            <GridItem>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('pharmacy.iban')} <span className="text-danger">*</span>
              </Text>
              <Input name="iban" bg={inputBg} color={textColor} value={formData.iban} onChange={handleChange} mt={2} />
            </GridItem>

            {/* Row 3: Password and WhatsApp Number */}
            <GridItem>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('pharmacy.password')} <span className="text-danger">*</span>
              </Text>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                mt={2}
                bg={inputBg}
                color={textColor}
              />
            </GridItem>
            <GridItem>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('pharmacy.whatsappNumber')} <span className="text-danger">*</span>
              </Text>
              <Input
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                mt={2}
                bg={inputBg}
                color={textColor}
              />
            </GridItem>

            {/* Row 4: Working Hours and Revenue Share Type */}
            <GridItem>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('pharmacy.workingHours')} <span className="text-danger">*</span>
              </Text>
              <Input
                name="workingHours"
                value={formData.workingHours}
                onChange={handleChange}
                mt={2}
                bg={inputBg}
                color={textColor}
              />
            </GridItem>
            <GridItem>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('pharmacy.revenueShareType')} <span className="text-danger">*</span>
              </Text>
              <RadioGroup
                onChange={handleRevenueShareTypeChange}
                value={formData.revenueShareType}
                mt={2}
              >
                <Stack direction="row">
                  <Radio value="percentage">{t('pharmacy.percentage')}</Radio>
                  <Radio value="fixed">{t('pharmacy.fixedFees')}</Radio>
                </Stack>
              </RadioGroup>
            </GridItem>

            {/* Row 5: Conditional Inputs Based on Revenue Share Type */}
            {formData.revenueShareType === 'percentage' ? (
              <GridItem colSpan={2}>
                <Text color={textColor} fontSize="sm" fontWeight="700">
                  {t('pharmacy.percentage')} <span className="text-danger">*</span>
                </Text>
                <Input
                  type="number"
                  name="revenueShare"
                  value={formData.revenueShare}
                  onChange={handleChange}
                  mt={2}
                  bg={inputBg}
                  color={textColor}
                />
              </GridItem>
            ) : (
              <>
                <GridItem>
                  <Text color={textColor} fontSize="sm" fontWeight="700">
                    {t('pharmacy.fixedFees')} <span className="text-danger">*</span>
                  </Text>
                  <Input
                    type="number"
                    name="fixedFees"
                    value={formData.fixedFees}
                    onChange={handleChange}
                    mt={2}
                    bg={inputBg}
                    color={textColor}
                  />
                </GridItem>
                <GridItem>
                  <Text color={textColor} fontSize="sm" fontWeight="700">
                    {t('pharmacy.feesStartDate')} <span className="text-danger">*</span>
                  </Text>
                  <Input
                    type="date"
                    name="feesStartDate"
                    value={formData.feesStartDate}
                    onChange={handleChange}
                    mt={2}
                    bg={inputBg}
                    color={textColor}
                  />
                </GridItem>
                <GridItem>
                  <Text color={textColor} fontSize="sm" fontWeight="700">
                    {t('pharmacy.feesEndDate')} <span className="text-danger">*</span>
                  </Text>
                  <Input
                    type="date"
                    name="feesEndDate"
                    value={formData.feesEndDate}
                    onChange={handleChange}
                    mt={2}
                    bg={inputBg}
                    color={textColor}
                  />
                </GridItem>
              </>
            )}
          </Grid>

          {/* Row 6: Description En and Description Ar */}
          <Grid templateColumns="repeat(2, 1fr)" gap={4} mt={4}>
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('pharmacy.descriptionEn')} <span className="text-danger">*</span>
              </Text>
              <Textarea
                value={formData.translations.find((t) => t.languageId === 'en').description}
                onChange={(e) => handleTranslationChange('en', 'description', e.target.value)}
                mt={2}
                mb={4}
                width="100%"
                bg={inputBg}
                color={textColor}
              />
            </Box>
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                {t('pharmacy.descriptionAr')} <span className="text-danger">*</span>
              </Text>
              <Textarea
                value={formData.translations.find((t) => t.languageId === 'ar').description}
                onChange={(e) => handleTranslationChange('ar', 'description', e.target.value)}
                mt={2}
                mb={4}
                width="100%"
                bg={inputBg}
                color={textColor}
              />
            </Box>
          </Grid>

          {/* Drag-and-Drop Upload Section */}
          <Box
            border="1px dashed"
            borderColor="gray.300"
            borderRadius="md"
            p={4}
            textAlign="center"
            backgroundColor={inputBg}
            cursor="pointer"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            mb={4}
          >
            <Icon as={FaUpload} w={8} h={8} color="#422afb" mb={2} />
            <Text color="gray.500" mb={2}>
              {t('pharmacy.dragDropImageHere')}
            </Text>
            <Text color="gray.500" mb={2}>
              {t('pharmacy.or')}
            </Text>
            <Button
              variant="outline"
              color="#422afb"
              border="none"
              onClick={() => document.getElementById('fileInput').click()}
            >
              {t('pharmacy.uploadImage')}
              <input
                type="file"
                id="fileInput"
                hidden
                accept="image/*"
                onChange={handleFileInputChange}
              />
            </Button>
            {image && (
              <Box
                mt={4}
                display={'flex'}
                justifyContent="center"
                alignItems="center"
              >
                <img
                  src={URL.createObjectURL(image)}
                  alt={image.name}
                  width={80}
                  height={80}
                  borderRadius="md"
                />
              </Box>
            )}
          </Box>

          {/* Input for Number of Branches */}
          <Box mt={4}>
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('pharmacy.numberOfBranches')} <span className="text-danger">*</span>
            </Text>
            <Input
              type="number"
              value={numberOfBranches}
              onChange={handleNumberOfBranchesChange}
              mt={2}
              min={0}
              bg={inputBg}
              color={textColor}
            />
          </Box>

          {/* Render Inputs Dynamically with Card Styles */}
          {Array.from({ length: numberOfBranches })?.map((_, index) => (
            <Box
              key={index}
              mt={4}
              p={4}
              borderRadius="lg"
              boxShadow="sm"
              border="1px solid #ccc"
              bg={cardBg}
            >
              <Text color={textColor} fontSize="md" fontWeight="bold">
                {t('pharmacy.branch')} {index + 1}
              </Text>

              <SimpleGrid columns={2} mt={4} spacing={4}>
                <Box>
                  <Text color={textColor} fontSize="sm" fontWeight="700">
                    {t('pharmacy.branchEnName')} <span className="text-danger">*</span>
                  </Text>
                  <Input
                    bg={inputBg}
                    color={textColor}
                    placeholder={t('pharmacy.enterBranchEnName')}
                    value={formData.branches[index]?.translations.find((t) => t.languageId === 'en').name || ''}
                    onChange={(e) =>
                      handleBranchTranslationChange(index, 'en', 'name', e.target.value)
                    }
                  />
                </Box>

                <Box>
                  <Text color={textColor} fontSize="sm" fontWeight="700">
                    {t('pharmacy.branchEnAddress')} <span className="text-danger">*</span>
                  </Text>
                  <Input
                    bg={inputBg}
                    color={textColor}
                    placeholder={t('pharmacy.enterBranchEnAddress')}
                    value={formData.branches[index]?.translations.find((t) => t.languageId === 'en').address || ''}
                    onChange={(e) =>
                      handleBranchTranslationChange(index, 'en', 'address', e.target.value)
                    }
                  />
                </Box>

                <Box>
                  <Text color={textColor} fontSize="sm" fontWeight="700">
                    {t('pharmacy.branchArName')} <span className="text-danger">*</span>
                  </Text>
                  <Input
                  bg={inputBg}
                  color={textColor}
                    placeholder={t('pharmacy.enterBranchArName')}
                    value={formData.branches[index]?.translations.find((t) => t.languageId === 'ar').name || ''}
                    onChange={(e) =>
                      handleBranchTranslationChange(index, 'ar', 'name', e.target.value)
                    }
                  />
                </Box>

                <Box>
                  <Text color={textColor} fontSize="sm" fontWeight="700">
                    {t('pharmacy.branchArAddress')} <span className="text-danger">*</span>
                  </Text>
                  <Input
                  bg={inputBg}
                  color={textColor}
                    placeholder={t('pharmacy.enterBranchArAddress')}
                    value={formData.branches[index]?.translations.find((t) => t.languageId === 'ar').address || ''}
                    onChange={(e) =>
                      handleBranchTranslationChange(index, 'ar', 'address', e.target.value)
                    }
                  />
                </Box>
              </SimpleGrid>

              <SimpleGrid columns={12} mt={4}>
                <Box gridColumn="span 12">
                  <Text color={textColor} fontSize="sm" fontWeight="700">
                    {t('pharmacy.location')} <span className="text-danger">*</span>
                  </Text>
                  <Input
                    bg={inputBg}
                    color={textColor}
                    placeholder={t('pharmacy.enterBranchLocation')}
                    value={formData.branches[index]?.locationLink || ''}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        branches: prevData.branches.map((branch, i) =>
                          i === index ? { ...branch, locationLink: e.target.value } : branch
                        ),
                      }))
                    }
                  />
                </Box>
              </SimpleGrid>
            </Box>
          ))}

          {/* Additional Checkboxes Section */}
          <Box mt={6} p={4} borderRadius="lg" boxShadow="sm" border="1px solid #ccc" bg={cardBg}>
            <Text color={textColor} fontSize="md" fontWeight="bold" mb={4}>
              {t('pharmacy.additionalSettings')}
            </Text>
            <Stack spacing={3}>
              <Checkbox
                isChecked={formData.hasZoneDelivery}
                onChange={(e) => setFormData(prev => ({ ...prev, hasZoneDelivery: e.target.checked }))}
              >
                {t('pharmacy.deliveryAcrossYourZone')}
              </Checkbox>
              <Checkbox
                isChecked={formData.hasSameDayDispatch}
                onChange={(e) => setFormData(prev => ({ ...prev, hasSameDayDispatch: e.target.checked }))}
              >
                {t('pharmacy.usuallyDispatchesOrdersOnTheSameDay')}
              </Checkbox>
              <Checkbox
                isChecked={formData.hasDeliveryFee}
                onChange={(e) => setFormData(prev => ({ ...prev, hasDeliveryFee: e.target.checked }))}
              >
                {t('pharmacy.deliveryFeeWillApply')}
              </Checkbox>
              <Checkbox
                isChecked={formData.isHealthyPharmacyDelivery}
                onChange={(e) => setFormData(prev => ({ ...prev, isHealthyPharmacyDelivery: e.target.checked }))}
              >
                {t('pharmacy.allOrdersWillBeDeliveredByHealthyPharmacy')}
              </Checkbox>
            </Stack>
          </Box>

          {/* Save and Cancel Buttons */}
          <Flex justify="center" mt={6}>
            <Button variant="outline" colorScheme="red" mr={2} onClick={() => navigate(-1)}>
              {t('pharmacy.cancel')}
            </Button>
            <Button
              variant="darkBrand"
              color="white"
              fontSize="sm"
              fontWeight="500"
              borderRadius="70px"
              px="24px"
              py="5px"
              onClick={handleSend}
              isLoading={isLoading}
            >
              {t('pharmacy.save')}
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default AddPharmacy;
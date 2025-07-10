import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Input,
  Textarea,
  Text,
  useColorModeValue,
  Icon,
  Switch,
  FormControl,
  FormLabel,
  Checkbox,
  Select,
  Image,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { FaUpload, FaTrash, FaPlus } from 'react-icons/fa6';
import { IoMdArrowBack } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetDoctorQuery, useUpdateDoctorMutation } from 'api/doctorSlice';
import { useGetSpecializationsQuery } from 'api/doctorSpecializationSlice';
import { useGetClinicsQuery } from 'api/clinicSlice';
import Swal from 'sweetalert2';
import { useAddFileMutation } from 'api/filesSlice';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../contexts/LanguageContext';

const EditDoctor = () => {
  const { id } = useParams();
  const { data: doctorResponse, refetch } = useGetDoctorQuery(id);
  const [updateDoctor] = useUpdateDoctorMutation();
  const { data: clinicsResponse } = useGetClinicsQuery({}); // Get all clinics without pagination
  const { data: specializationsResponse } = useGetSpecializationsQuery({});
  const toast = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const clinics = clinicsResponse?.data || [];
  const specializations = specializationsResponse?.data || [];
  const [addFile] = useAddFileMutation();

  // Debug logging for clinics
  React.useEffect(() => {
    console.log('Clinics Debug:', {
      clinicsCount: clinics.length,
      clinicsData: clinics,
      clinicsResponse
    });
  }, [clinics, clinicsResponse]);

  // Color mode values
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const inputBorder = useColorModeValue('gray.300', 'gray.600');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const dropZoneBg = useColorModeValue('gray.50', 'gray.800');
  const dropZoneBorder = useColorModeValue('gray.300', 'gray.600');
  const dropZoneActiveBorder = useColorModeValue('brand.500', 'brand.200');
  const dropZoneActiveBg = useColorModeValue('brand.50', 'brand.900');

  // Form state
  const [formData, setFormData] = useState({
    imageKey: '',
    firstName: '',
    lastName: '',
    email: '',
    password: null,
    aboutEn: '',
    aboutAr: '',
    clinicFees: '',
    onlineFees: '',
    isRecommended: true,
    hasClinicConsult: true,
    hasOnlineConsult: true,
    gender: 'MALE',
    title: 'CONSULTANT',
    specializationId: '',
  });

  const [languages, setLanguages] = useState([{ language: '' }]);
  const [phones, setPhones] = useState([{ phoneNumber: '' }]);
  const [selectedClinics, setSelectedClinics] = useState([]);
  const [image, setImage] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isActive, setIsActive] = useState(doctorResponse?.data?.isActive ?? true);

  useEffect(() => {
    refetch();
  }, []);

  // Initialize form with existing data
  useEffect(() => {
    if (doctorResponse?.data) {
      const doctor = doctorResponse.data;
      setFormData({
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        password: null,
        aboutEn: doctor.about,
        aboutAr: '',
        clinicFees: doctor.clinicFees,
        onlineFees: doctor.onlineFees,
        isRecommended: doctor.isRecommended,
        hasClinicConsult: doctor.hasClinicConsult,
        hasOnlineConsult: doctor.hasOnlineConsult,
        gender: doctor.gender,
        title: doctor.title,
        specializationId: doctor.specializationId,
        imageKey: doctor.imageKey,
      });

      setIsActive(doctor.isActive);
      setPhones(doctor.phones.map((phone) => ({ phoneNumber: phone.phoneNumber })));
      setLanguages(doctor.languages.map((lang) => ({ language: lang })));
      setSelectedClinics(doctor.clinics.map((clinic) => clinic.clinicId));
      
      if (doctor.imageKey) {
        setImage(doctor.imageKey);
      }
      
      setCertificates(doctor.certificates.map((cert) => ({
        imageKey: cert.imageKey,
        id: cert.id,
      })));
    }
  }, [doctorResponse]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle number input key down to prevent minus sign
  const handleNumberInputKeyDown = (e) => {
    if (e.key === '-') {
      e.preventDefault();
    }
  };

  // Handle toggle switches
  const handleToggle = (field) => {
    setFormData({
      ...formData,
      [field]: !formData[field],
    });
  };

  // Image upload handlers
  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setImage(selectedFile);
      setFormData((prev) => ({
        ...prev,
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
    handleImageUpload(e.dataTransfer.files);
  };

  const handleFileInputChange = (e) => {
    handleImageUpload(e.target.files);
  };

  const handleCertificateUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newCertificates = files.map((file) => ({
        imageKey: file,
      }));
      setCertificates([...certificates, ...newCertificates]);
    }
  };

  // Phone number handlers
  const handleAddPhone = () => {
    setPhones([...phones, { phoneNumber: '' }]);
  };

  const handlePhoneChange = (index, value) => {
    // Only allow digits and limit to 8 characters
    const numericValue = value.replace(/\D/g, '').slice(0, 8);
    const newPhones = [...phones];
    newPhones[index].phoneNumber = numericValue;
    setPhones(newPhones);
  };

  const handleDeletePhone = (index) => {
    const newPhones = phones.filter((_, i) => i !== index);
    setPhones(newPhones);
  };

  // Language handlers
  const handleAddLanguage = () => {
    setLanguages([...languages, { language: '' }]);
  };

  const handleLanguageChange = (index, field, value) => {
    const newLanguages = [...languages];
    newLanguages[index][field] = value;
    setLanguages(newLanguages);
  };

  const handleDeleteLanguage = (index) => {
    const newLanguages = languages.filter((_, i) => i !== index);
    setLanguages(newLanguages);
  };

  // Clinic selection handlers
  const handleClinicSelection = (clinicId) => {
    setSelectedClinics((prev) =>
      prev.includes(clinicId)
        ? prev.filter((id) => id !== clinicId)
        : [...prev, clinicId]
    );
  };

  const handleSelectAllClinics = () => {
    if (selectedClinics.length === clinics.length) {
      setSelectedClinics([]);
    } else {
      setSelectedClinics(clinics.map(clinic => clinic.id));
    }
  };

  const getSelectedClinicsNames = () => {
    return selectedClinics
      .map(id => clinics.find(clinic => clinic.id === id)?.name)
      .filter(name => name)
      .join(', ');
  };

  // Certificate handlers
  const handleDeleteCertificate = (index) => {
    const newCertificates = certificates.filter((_, i) => i !== index);
    setCertificates(newCertificates);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone numbers
    const invalidPhones = phones.filter(phone => phone.phoneNumber.length !== 8);
    if (invalidPhones.length > 0) {
      toast({
        title: t('doctors.error'),
        description: t('doctors.phoneNumberMustBe8Digits'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      let imageKey = formData.imageKey;
      let uploadedCertificates = [];

      // Upload doctor image if a new one is selected
      if (image && typeof image !== 'string') {
        const formDataFile = new FormData();
        formDataFile.append('file', image);

        const uploadResponse = await addFile(formDataFile).unwrap();

        if (uploadResponse.success && uploadResponse.data.uploadedFiles.length > 0) {
          imageKey = uploadResponse.data.uploadedFiles[0].url;
        }
      }

      // Upload new certificates if they exist
      const newCertificates = certificates.filter(
        (cert) => cert.imageKey && typeof cert.imageKey !== 'string'
      );
      if (newCertificates.length > 0) {
        const certUploadPromises = newCertificates.map(async (cert) => {
          const certFormData = new FormData();
          certFormData.append('file', cert.imageKey);

          const certResponse = await addFile(certFormData).unwrap();
          if (certResponse.success && certResponse.data.uploadedFiles.length > 0) {
            return {
              imageKey: certResponse.data.uploadedFiles[0].url,
              id: cert.id,
            };
          }
          return null;
        });

        uploadedCertificates = await Promise.all(certUploadPromises);
        uploadedCertificates = uploadedCertificates.filter((cert) => cert !== null);
      }

      // Combine existing and new certificates
      const allCertificates = [
        ...certificates.filter((cert) => cert.id && !cert.file),
        ...uploadedCertificates,
      ];

      // Prepare the data for API
      const doctorData = {
        ...formData,
        imageKey: imageKey || formData.imageKey,
        clinicFees: parseFloat(formData.clinicFees),
        onlineFees: parseFloat(formData.onlineFees),
        languages: languages
          .map((lang) => lang.language)
          .filter((lang) => lang),
        phones: phones
          .filter((phone) => phone.phoneNumber)
          .map((phone) => ({ phoneNumber: phone.phoneNumber })),
        clinics: selectedClinics,
        certificates: allCertificates,
        isActive: isActive,
      };

      if (!formData.password) {
        delete doctorData.password;
      }

      // Call the API
      await updateDoctor({ id, data: doctorData }).unwrap();

      // Show success message
      toast({
        title: t('doctors.success'),
        description: t('doctors.doctorUpdatedSuccessfully'),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Navigate back
      navigate('/admin/doctors');
    } catch (err) {
      toast({
        title: t('doctors.error'),
        description: err.data?.message || t('doctors.failedToUpdateDoctor'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: t('doctors.confirmCancel'),
      text: t('doctors.unsavedChangesWarning'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('doctors.yesDiscardChanges'),
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/admin/doctors');
      }
    });
  };

  return (
    <Flex justify="center" p="20px" mt="80px" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <Box w="100%" p="6" boxShadow="md" borderRadius="lg" bg={cardBg}>
        <Flex justify="space-between" align="center" mb="20px">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            {t('doctors.editDoctor')}
          </Text>
          <Button
            onClick={handleCancel}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('doctors.back')}
          </Button>
        </Flex>

        <form onSubmit={handleSubmit}>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            {/* Basic Information */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('doctors.firstName')}<span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </Text>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
                mt="8px"
              />
            </Box>

            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('doctors.lastName')}<span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </Text>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
                mt="8px"
              />
            </Box>

            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('doctors.email')}<span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </Text>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
                mt="8px"
              />
            </Box>

            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('doctors.password')}
              </Text>
              <Input
                type="password"
                name="password"
                value={formData.password || ''}
                onChange={handleInputChange}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                mt="8px"
              />
            </Box>

            {/* Professional Information */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('doctors.gender')}<span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </Text>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
                mt="8px"
                dir='ltr'
              >
                <option value="MALE">{t('doctors.male')}</option>
                <option value="FEMALE">{t('doctors.female')}</option>
              </Select>
            </Box>

            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('doctors.title')}<span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </Text>
              <Select
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
                mt="8px"
                dir='ltr'
              >
                <option value="CONSULTANT">{t('doctors.consultant')}</option>
                <option value="SPECIALIST">{t('doctors.specialist')}</option>
                <option value="REGISTRAR">{t('doctors.registrar')}</option>
              </Select>
            </Box>

            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('doctors.specialization')}<span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </Text>
              <Select
                name="specializationId"
                value={formData.specializationId}
                onChange={handleInputChange}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
                mt="8px"
                dir='ltr'
              >
                <option value="">{t('doctors.selectSpecialization')}</option>
                {specializations.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.name}
                  </option>
                ))}
              </Select>
            </Box>

            {/* Fees */}
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('doctors.clinicFees')}<span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </Text>
              <Input
                type="number"
                name="clinicFees"
                value={formData.clinicFees}
                onChange={handleInputChange}
                onKeyDown={handleNumberInputKeyDown}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
                mt="8px"
                min={0}
              />
            </Box>

            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('doctors.onlineFees')}<span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </Text>
              <Input
                type="number"
                name="onlineFees"
                value={formData.onlineFees}
                onChange={handleInputChange}
                onKeyDown={handleNumberInputKeyDown}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
                mt="8px"
                min={0}
              />
            </Box>

            {/* About Sections */}
            <Box gridColumn="1 / -1">
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('doctors.aboutEnglish')}<span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </Text>
              <Textarea
                name="aboutEn"
                value={formData.aboutEn}
                onChange={handleInputChange}
                bg={inputBg}
                color={textColor}
                borderColor={inputBorder}
                required
                mt="8px"
                maxLength={500}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                {formData.aboutEn.length}/500 {t('doctors.characters')}
              </Text>
            </Box>

            {/* Toggles */}
            <Box>
              <FormControl display="flex" alignItems="center" mt={4}>
                <FormLabel htmlFor="isRecommended" mb="0" color={textColor}>
                  {t('doctors.recommendedDoctor')}
                </FormLabel>
                <Switch
                  id="isRecommended"
                  isChecked={formData.isRecommended}
                  onChange={() => handleToggle('isRecommended')}
                  colorScheme="brand"
                  dir='ltr'
                />
              </FormControl>
            </Box>

            <Box>
              <FormControl display="flex" alignItems="center" mt={4}>
                <FormLabel htmlFor="hasClinicConsult" mb="0" color={textColor}>
                  {t('doctors.clinicConsultation')}
                </FormLabel>
                <Switch
                  id="hasClinicConsult"
                  isChecked={formData.hasClinicConsult}
                  onChange={() => handleToggle('hasClinicConsult')}
                  colorScheme="brand"
                  dir='ltr'
                />
              </FormControl>
            </Box>

            <Box>
              <FormControl display="flex" alignItems="center" mt={4}>
                <FormLabel htmlFor="hasOnlineConsult" mb="0" color={textColor}>
                  {t('doctors.onlineConsultation')}
                </FormLabel>
                <Switch
                  id="hasOnlineConsult"
                  isChecked={formData.hasOnlineConsult}
                  onChange={() => handleToggle('hasOnlineConsult')}
                  colorScheme="brand"
                  dir='ltr'
                />
              </FormControl>
            </Box>

            {/* Active Status */}
            <Box>
              <FormControl display="flex" alignItems="center" mt={4}>
                <FormLabel htmlFor="isActive" mb="0" color={textColor}>
                  {t('doctors.active')}
                </FormLabel>
                <Switch
                  id="isActive"
                  isChecked={isActive}
                  onChange={() => setIsActive(!isActive)}
                  colorScheme="brand"
                  dir='ltr'
                />
              </FormControl>
            </Box>

            {/* Phones */}
            <Box gridColumn="1 / -1" mt={2} mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('doctors.phoneNumbers')}<span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </Text>
              {phones.map((phone, index) => (
                <Flex key={index} align="center" mt="8px" mb={2}>
                  <Input
                    type="text"
                    placeholder={`${t('doctors.phone')} ${index + 1} (8 digits)`}
                    value={phone.phoneNumber}
                    onChange={(e) => handlePhoneChange(index, e.target.value)}
                    bg={inputBg}
                    color={textColor}
                    borderColor={inputBorder}
                    required={index === 0}
                    flex="1"
                    mr={2}
                    maxLength={8}
                  />
                  {phones.length > 1 && (
                    <Icon
                      as={FaTrash}
                      w="30px"
                      h="35px"
                      color="red.500"
                      cursor="pointer"
                      onClick={() => handleDeletePhone(index)}
                      border={`1px solid ${borderColor}`}
                      padding="5px"
                      borderRadius="5px"
                    />
                  )}
                </Flex>
              ))}
              <Button
                variant="outline"
                colorScheme="teal"
                size="sm"
                mt={2}
                leftIcon={<FaPlus />}
                onClick={handleAddPhone}
              >
                {t('doctors.addPhone')}
              </Button>
            </Box>

            {/* Languages */}
            <Box gridColumn="1 / -1" mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('doctors.languages')}<span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </Text>
              {languages.map((lang, index) => (
                <Flex key={index} align="center" mt="8px" mb={2}>
                  <Input
                    type="text"
                    placeholder={`${t('doctors.language')} ${index + 1}`}
                    value={lang.language}
                    onChange={(e) =>
                      handleLanguageChange(index, 'language', e.target.value)
                    }
                    bg={inputBg}
                    color={textColor}
                    borderColor={inputBorder}
                    required={index === 0}
                    flex="1"
                    mr={2}
                  />
                  {languages.length > 1 && (
                    <Icon
                      as={FaTrash}
                      w="30px"
                      h="35px"
                      color="red.500"
                      cursor="pointer"
                      onClick={() => handleDeleteLanguage(index)}
                      border={`1px solid ${borderColor}`}
                      padding="5px"
                      borderRadius="5px"
                      ml={2}
                    />
                  )}
                </Flex>
              ))}
              <Button
                variant="outline"
                colorScheme="teal"
                size="sm"
                mt={2}
                leftIcon={<FaPlus />}
                onClick={handleAddLanguage}
              >
                {t('doctors.addLanguage')}
              </Button>
            </Box>

            {/* Clinics */}
            <Box gridColumn="1 / -1" mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('doctors.clinics')} ({clinics.length} available)
              </Text>
              <Button
                onClick={onOpen}
                variant="outline"
                colorScheme="teal"
                size="sm"
                mt="8px"
                width="100%"
                justifyContent="space-between"
              >
                <Text>
                  {selectedClinics.length > 0 
                    ? `${selectedClinics.length} ${t('doctors.clinicsSelected')}`
                    : t('doctors.selectClinics')
                  }
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {selectedClinics.length > 0 ? getSelectedClinicsNames() : ''}
                </Text>
              </Button>
            </Box>

            {/* Clinics Selection Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>{t('doctors.selectClinics')}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Box mb={4}>
                    <Checkbox
                      isChecked={selectedClinics.length === clinics.length && clinics.length > 0}
                      isIndeterminate={selectedClinics.length > 0 && selectedClinics.length < clinics.length}
                      onChange={handleSelectAllClinics}
                      colorScheme="teal"
                      mb={3}
                    >
                      <Text fontWeight="bold">{t('doctors.selectAllClinics')}</Text>
                    </Checkbox>
                    <Text fontSize="sm" color="gray.500">
                      {selectedClinics.length} of {clinics.length} {t('doctors.clinicsSelected')}
                    </Text>
                  </Box>
                  
                  <Box maxH="400px" overflowY="auto">
                    <Grid templateColumns="repeat(1, 1fr)" gap={3}>
                      {clinics.map((clinic) => (
                        <Checkbox
                          key={clinic.id}
                          isChecked={selectedClinics.includes(clinic.id)}
                          onChange={() => handleClinicSelection(clinic.id)}
                          colorScheme="teal"
                        >
                          <Box>
                            <Text fontWeight="medium">{clinic.name}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {clinic.email}
                            </Text>
                          </Box>
                        </Checkbox>
                      ))}
                    </Grid>
                  </Box>
                </ModalBody>
                <ModalFooter>
                  <Button colorScheme="teal" onClick={onClose}>
                    {t('doctors.confirmSelection')}
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            {/* Doctor Image */}
            <Box gridColumn="1 / -1" mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('doctors.doctorImage')}
              </Text>
              <Box
                border="1px dashed"
                borderColor={isDragging ? dropZoneActiveBorder : dropZoneBorder}
                borderRadius="md"
                p={4}
                textAlign="center"
                backgroundColor={isDragging ? dropZoneActiveBg : dropZoneBg}
                cursor="pointer"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                mt="8px"
              >
                {image ? (
                  <Flex direction="column" align="center">
                    <Image
                      src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                      alt={t('doctors.doctor')}
                      maxH="200px"
                      mb={2}
                      borderRadius="md"
                    />
                    <Button
                      variant="outline"
                      colorScheme="red"
                      size="sm"
                      onClick={() => {
                        setImage(null);
                        setFormData((prev) => ({ ...prev, imageKey: '' }));
                      }}
                    >
                      {t('doctors.removeImage')}
                    </Button>
                  </Flex>
                ) : (
                  <>
                    <Icon as={FaUpload} w={8} h={8} color="brand.500" mb={2} />
                    <Text color={textColor} mb={2}>
                      {t('doctors.dragDropImage')}
                    </Text>
                    <Text color={textColor} mb={2}>
                      {t('doctors.or')}
                    </Text>
                    <Button
                      variant="outline"
                      colorScheme="brand"
                      onClick={() => document.getElementById('doctorImage').click()}
                    >
                      {t('doctors.uploadImage')}
                      <input
                        type="file"
                        id="doctorImage"
                        hidden
                        accept="image/*"
                        onChange={handleFileInputChange}
                      />
                    </Button>
                  </>
                )}
              </Box>
            </Box>

            {/* Certificates */}
            <Box gridColumn="1 / -1">
              <Text color={textColor} fontSize="sm" fontWeight="700" mb="1">
                {t('doctors.certificates')}
              </Text>
              <Box mt={2}>
                <Button
                  as="label"
                  variant="outline"
                  colorScheme="teal"
                  leftIcon={<FaPlus />}
                  cursor="pointer"
                >
                  {t('doctors.addCertificates')}
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleCertificateUpload}
                  />
                </Button>
              </Box>
              {certificates.length > 0 && (
                <Grid templateColumns="repeat(3, 1fr)" gap={4} mt={4}>
                  {certificates.map((cert, index) => (
                    <Box key={index} position="relative">
                      <Image
                        src={typeof cert.imageKey === 'string' ? cert.imageKey : URL.createObjectURL(cert.imageKey)}
                        alt={`${t('doctors.certificate')} ${index + 1}`}
                        borderRadius="md"
                        boxShadow="md"
                      />
                      <Icon
                        as={FaTrash}
                        position="absolute"
                        top={2}
                        right={2}
                        color="red.500"
                        cursor="pointer"
                        onClick={() => handleDeleteCertificate(index)}
                        bg={cardBg}
                        p={1}
                        borderRadius="full"
                        boxShadow="md"
                      />
                    </Box>
                  ))}
                </Grid>
              )}
            </Box>
          </Grid>

          {/* Action Buttons */}
          <Flex justify="center" mt={6} gap={4}>
            <Button
              variant="outline"
              colorScheme="red"
              onClick={handleCancel}
              width="150px"
            >
              {t('doctors.cancel')}
            </Button>
            <Button
              type="submit"
              colorScheme="brandScheme"
              color="white"
              fontSize="sm"
              fontWeight="500"
              borderRadius="70px"
              px="24px"
              py="5px"
              width="150px"
            >
              {t('doctors.saveDoctor')}
            </Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  );
};

export default EditDoctor;
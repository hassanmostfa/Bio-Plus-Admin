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
} from '@chakra-ui/react';
import { FaUpload, FaTrash, FaPlus } from 'react-icons/fa6';
import { IoMdArrowBack } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import { useAddDoctorMutation } from 'api/doctorSlice';
import { useGetSpecializationsQuery } from 'api/doctorSpecializationSlice';
import { useGetClinicsQuery } from 'api/clinicSlice';
import Swal from 'sweetalert2';
import { useGetDoctorQuery } from 'api/doctorSlice';
import { useUpdateDoctorMutation } from 'api/doctorSlice';
import { useAddFileMutation } from 'api/filesSlice';

const EditDoctor = () => {
  const { id } = useParams();
  const { data: doctorResponse, refetch } = useGetDoctorQuery(id);

  const [updateDoctor] = useUpdateDoctorMutation();
  const { data: clinicsResponse } = useGetClinicsQuery({});
  const { data: specializationsResponse } = useGetSpecializationsQuery({});
  const toast = useToast();
  const navigate = useNavigate();

  const clinics = clinicsResponse?.data || [];
  const specializations = specializationsResponse?.data || [];
  useEffect(() => {
    refetch();
  }, []);
  const [addFile] = useAddFileMutation();
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

  const [languages, setLanguages] = useState([
    { language: '', isActive: true },
  ]);
  const [phones, setPhones] = useState([{ phoneNumber: '' }]);
  const [selectedClinics, setSelectedClinics] = useState([]);
  const [image, setImage] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Initialize form with existing data
  useEffect(() => {
    if (doctorResponse?.data) {
      const doctor = doctorResponse.data;
      setFormData({
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        password: null, // Typically don't pre-fill password for security
        aboutEn: doctor.about,
        aboutAr: '', // Add Arabic about if available in your API
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

      // Set phones
      setPhones(
        doctor.phones.map((phone) => ({ phoneNumber: phone.phoneNumber })),
      );

      // Set languages
      setLanguages(
        doctor.languages.map((lang) => ({ language: lang, isActive: true })),
      );

      // Set selected clinics
      setSelectedClinics(doctor.clinics.map((clinic) => clinic.clinicId));
      // Set image if it exists
      if (doctor.imageKey) {
        setImage(doctor.imageKey);
      }
      // Set certificates (if you need to display existing ones)
      // Note: You'll need to handle existing vs new certificates differently
      setCertificates(
        doctor.certificates.map((cert) => ({
          imageKey: cert.imageKey,
          id: cert.id, // Keep track of existing certificates
        })),
      );
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

      // Update the form data with the file name (temporary until we get the actual key from API)
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
        imageKey: file, // Temporary until we get the actual key from API
      }));
      setCertificates([...certificates, ...newCertificates]);
    }
  };
  // Phone number handlers
  const handleAddPhone = () => {
    setPhones([...phones, { phoneNumber: '' }]);
  };

  const handlePhoneChange = (index, value) => {
    const newPhones = [...phones];
    newPhones[index].phoneNumber = value;
    setPhones(newPhones);
  };

  const handleDeletePhone = (index) => {
    const newPhones = phones.filter((_, i) => i !== index);
    setPhones(newPhones);
  };

  // Language handlers
  const handleAddLanguage = () => {
    setLanguages([...languages, { language: '', isActive: true }]);
  };

  const handleLanguageChange = (index, field, value) => {
    const newLanguages = [...languages];
    if (field === 'isActive') {
      newLanguages[index][field] = value;
    } else {
      newLanguages[index][field] = value;
    }
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
        : [...prev, clinicId],
    );
  };

  // Certificate handlers
  const handleDeleteCertificate = (index) => {
    const newCertificates = certificates.filter((_, i) => i !== index);
    setCertificates(newCertificates);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageKey = formData.imageKey;
      let uploadedCertificates = [];

      // Upload doctor image if a new one is selected
      if (image && typeof image !== 'string') {
        // Check if image is a File object (new upload)
        const formDataFile = new FormData();
        formDataFile.append('file', image);

        const uploadResponse = await addFile(formDataFile).unwrap();

        if (
          uploadResponse.success &&
          uploadResponse.data.uploadedFiles.length > 0
        ) {
          imageKey = uploadResponse.data.uploadedFiles[0].url;
        }
      }

      // Upload new certificates if they exist
      const newCertificates = certificates.filter(
        (cert) => cert.imageKey && typeof cert.imageKey !== 'string',
      );
      if (newCertificates.length > 0) {
        const certUploadPromises = newCertificates.map(async (cert) => {
          const certFormData = new FormData();
          certFormData.append('file', cert.imageKey);

          const certResponse = await addFile(certFormData).unwrap();
          if (
            certResponse.success &&
            certResponse.data.uploadedFiles.length > 0
          ) {
            return {
              imageKey: certResponse.data.uploadedFiles[0].url,
              id: cert.id, // Preserve existing ID if it exists
            };
          }
          return null;
        });

        uploadedCertificates = await Promise.all(certUploadPromises);
        uploadedCertificates = uploadedCertificates.filter(
          (cert) => cert !== null,
        );
      }

      // Combine existing certificates (with IDs) and newly uploaded ones
      const allCertificates = [
        ...certificates.filter((cert) => cert.id && !cert.file), // Existing certificates
        ...uploadedCertificates, // Newly uploaded certificates
      ];

      // Prepare the data for API
      const doctorData = {
        ...formData,
        imageKey: imageKey || formData.imageKey, // Use new key or existing one
        clinicFees: parseFloat(formData.clinicFees),
        onlineFees: parseFloat(formData.onlineFees),
        languages: languages
          .map((lang) => lang.language)
          .filter((lang) => lang),
        phones: phones
          .filter((phone) => phone.phoneNumber) // Remove empty phone numbers
          .map((phone) => ({ phoneNumber: phone.phoneNumber })), // Format as array of objects
        clinics: selectedClinics,
        certificates: allCertificates,
      };

      if (!formData.password) {
        delete doctorData.password;
      }

      // Call the API
      await updateDoctor({ id, data: doctorData }).unwrap();

      // Show success message
      toast({
        title: 'Success',
        description: 'Doctor updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Navigate back or reset form
      navigate('/admin/doctors');
    } catch (err) {
      toast({
        title: 'Error',
        description: err.data?.message || 'Failed to update doctor',
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
        navigate('/admin/doctors');
      }
    });
  };

  return (
    <div className="container add-admin-container w-100">
      <div className="add-admin-card shadow p-4 bg-white w-100">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            mb="20px !important"
            lineHeight="100%"
          >
            Edit Doctor
          </Text>
          <Button
            type="button"
            onClick={handleCancel}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            Back
          </Button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="row" gap={6}>
            {/* Basic Information */}
            <Box className="col-md-6 " mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                First Name<span className="text-danger mx-1">*</span>
              </Text>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                mt={'8px'}
              />
            </Box>

            <Box className="col-md-6" mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Last Name<span className="text-danger mx-1">*</span>
              </Text>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                mt={'8px'}
              />
            </Box>

            <Box className="col-md-6" mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Email<span className="text-danger mx-1">*</span>
              </Text>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                mt={'8px'}
              />
            </Box>

            <Box className="col-md-6" mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Password
              </Text>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                // required
                mt={'8px'}
              />
            </Box>

            {/* Professional Information */}
            <Box className="col-md-6" mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Gender<span className="text-danger mx-1">*</span>
              </Text>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                mt={'8px'}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </Select>
            </Box>

            <Box className="col-md-6" mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Title<span className="text-danger mx-1">*</span>
              </Text>
              <Select
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                mt={'8px'}
              >
                <option value="CONSULTANT">Consultant</option>
                <option value="SPECIALIST">Specialist</option>
                <option value="REGISTRAR">Registrar</option>
              </Select>
            </Box>

            <Box className="col-md-6" mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Specialization<span className="text-danger mx-1">*</span>
              </Text>
              <Select
                name="specializationId"
                value={formData.specializationId}
                onChange={handleInputChange}
                required
                mt={'8px'}
              >
                <option value="">Select Specialization</option>
                {specializations.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.name}
                  </option>
                ))}
              </Select>
            </Box>

            {/* Fees */}
            <Box className="col-md-6" mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Clinic Fees<span className="text-danger mx-1">*</span>
              </Text>
              <Input
                type="number"
                name="clinicFees"
                value={formData.clinicFees}
                onChange={handleInputChange}
                required
                mt={'8px'}
              />
            </Box>

            <Box className="col-md-6" mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Online Fees<span className="text-danger mx-1">*</span>
              </Text>
              <Input
                type="number"
                name="onlineFees"
                value={formData.onlineFees}
                onChange={handleInputChange}
                required
                mt={'8px'}
              />
            </Box>

            <Box> </Box>
            {/* About Sections */}
            <Box className="col-md-12" mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                About (English)<span className="text-danger mx-1">*</span>
              </Text>
              <Textarea
                name="aboutEn"
                value={formData.aboutEn}
                onChange={handleInputChange}
                required
                mt={'8px'}
              />
            </Box>

            {/* <Box className="col-md-6" mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                About (Arabic)<span className="text-danger mx-1">*</span>
              </Text>
              <Textarea
                name="aboutAr"
                value={formData.aboutAr}
                onChange={handleInputChange}
                required
                mt={'8px'}
              />
            </Box> */}
            <Box> </Box>
            <Box className="col-md-4">
              <FormControl display="flex" alignItems="center" mt={4}>
                <FormLabel htmlFor="isRecommended" mb="0">
                  Recommended Doctor
                </FormLabel>
                <Switch
                  id="isRecommended"
                  isChecked={formData.isRecommended}
                  onChange={() => handleToggle('isRecommended')}
                  colorScheme="brand"
                />
              </FormControl>
            </Box>

            <Box className="col-md-4">
              <FormControl display="flex" alignItems="center" mt={4}>
                <FormLabel htmlFor="hasClinicConsult" mb="0">
                  Clinic Consultation
                </FormLabel>
                <Switch
                  id="hasClinicConsult"
                  isChecked={formData.hasClinicConsult}
                  onChange={() => handleToggle('hasClinicConsult')}
                  colorScheme="brand"
                />
              </FormControl>
            </Box>

            <Box className="col-md-4">
              <FormControl display="flex" alignItems="center" mt={4}>
                <FormLabel htmlFor="hasOnlineConsult" mb="0">
                  Online Consultation
                </FormLabel>
                <Switch
                  id="hasOnlineConsult"
                  isChecked={formData.hasOnlineConsult}
                  onChange={() => handleToggle('hasOnlineConsult')}
                  colorScheme="brand"
                />
              </FormControl>
            </Box>

            {/* Phones */}
            <Box className="col-md-12 mt-2" mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Phone Numbers<span className="text-danger mx-1">*</span>
              </Text>
              {phones.map((phone, index) => (
                <Flex key={index} align="center" mt={'8px'} mb={2}>
                  <Input
                    type="text"
                    placeholder={`Phone ${index + 1}`}
                    value={phone.phoneNumber}
                    onChange={(e) => handlePhoneChange(index, e.target.value)}
                    required={index === 0}
                    flex="1"
                    mr={2}
                  />
                  {phones.length > 1 && (
                    <Icon
                      as={FaTrash}
                      w="30px"
                      h="35px"
                      color="red.500"
                      cursor="pointer"
                      onClick={() => handleDeletePhone(index)}
                      border={'1px solid #ddd'}
                      padding={'5px'}
                      borderRadius={'5px'}
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
                Add Phone
              </Button>
            </Box>

            {/* Languages */}
            <Box className="col-md-12" mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Languages<span className="text-danger mx-1">*</span>
              </Text>
              {languages.map((lang, index) => (
                <Flex key={index} align="center" mt={'8px'} mb={2}>
                  <Input
                    type="text"
                    placeholder={`Language ${index + 1}`}
                    value={lang.language}
                    onChange={(e) =>
                      handleLanguageChange(index, 'language', e.target.value)
                    }
                    required={index === 0}
                    flex="1"
                    mr={2}
                  />
                  <FormControl display="flex" alignItems="center" width="auto">
                    <FormLabel htmlFor={`active-${index}`} mb="0" mr={2}>
                      Active
                    </FormLabel>
                    <Switch
                      id={`active-${index}`}
                      isChecked={lang.isActive}
                      onChange={(e) =>
                        handleLanguageChange(
                          index,
                          'isActive',
                          e.target.checked,
                        )
                      }
                      colorScheme="brand"
                    />
                  </FormControl>
                  {languages.length > 1 && (
                    <Icon
                      as={FaTrash}
                      w="30px"
                      h="35px"
                      color="red.500"
                      cursor="pointer"
                      onClick={() => handleDeleteLanguage(index)}
                      border={'1px solid #ddd'}
                      padding={'5px'}
                      borderRadius={'5px'}
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
                Add Language
              </Button>
            </Box>

            {/* Clinics */}
            <Box className="col-md-12" mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Clinics
              </Text>
              <Flex wrap="wrap" gap={4} mt={2}>
                {clinics.map((clinic) => (
                  <Checkbox
                    key={clinic.id}
                    isChecked={selectedClinics.includes(clinic.id)}
                    onChange={() => handleClinicSelection(clinic.id)}
                    colorScheme="brand"
                  >
                    {clinic.name}
                  </Checkbox>
                ))}
              </Flex>
            </Box>

            {/* Doctor Image */}
            <Box className="col-md-12" mb={3}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Doctor Image
              </Text>
              <Box
                border="1px dashed"
                borderColor={isDragging ? 'brand.500' : 'gray.300'}
                borderRadius="md"
                p={4}
                textAlign="center"
                backgroundColor={isDragging ? 'brand.50' : 'gray.50'}
                cursor="pointer"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                mt={'8px'}
              >
                {image ? (
                  <Flex direction="column" align="center">
                    <Image
                      src={
                        typeof image === 'string'
                          ? image
                          : URL.createObjectURL(image)
                      }
                      alt="Doctor"
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
                      Remove Image
                    </Button>
                  </Flex>
                ) : (
                  <>
                    <Icon as={FaUpload} w={8} h={8} color="#422afb" mb={2} />
                    <Text color="gray.500" mb={2}>
                      Drag & Drop Image Here
                    </Text>
                    <Text color="gray.500" mb={2}>
                      or
                    </Text>
                    <Button
                      variant="outline"
                      color="#422afb"
                      border="none"
                      onClick={() =>
                        document.getElementById('doctorImage').click()
                      }
                    >
                      Upload Image
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
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Certificates
              </Text>
              <Box mt={2}>
                <Button
                  as="label"
                  variant="outline"
                  colorScheme="teal"
                  leftIcon={<FaPlus />}
                  cursor="pointer"
                >
                  Add Certificates
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
                        src={
                          typeof cert.imageKey === 'string'
                            ? cert.imageKey
                            : URL.createObjectURL(cert.imageKey)
                        }
                        alt={`Certificate ${index + 1}`}
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
                        onClick={() => {
                          const newCertificates = [...certificates];
                          newCertificates.splice(index, 1);
                          setCertificates(newCertificates);
                        }}
                        bg="white"
                        p={1}
                        borderRadius="full"
                        boxShadow="md"
                      />
                    </Box>
                  ))}
                </Grid>
              )}
            </Box>
          </div>

          {/* Action Buttons */}
          <Flex justify="center" mt={6} gap={4}>
            <Button
              variant="outline"
              colorScheme="red"
              onClick={handleCancel}
              width="150px"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="darkBrand"
              color="white"
              fontSize="sm"
              fontWeight="500"
              borderRadius="70px"
              px="24px"
              py="5px"
              width="150px"
            >
              Save Doctor
            </Button>
          </Flex>
        </form>
      </div>
    </div>
  );
};

export default EditDoctor;

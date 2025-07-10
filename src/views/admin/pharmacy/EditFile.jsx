import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
  Icon,
  Image,
} from '@chakra-ui/react';
import { FaUpload } from 'react-icons/fa6';
import { IoMdArrowBack } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import { useAddFileMutation } from 'api/filesSlice';
import Swal from 'sweetalert2';
import { useAddPharmacyFileMutation } from 'api/pharmacyFiles';
import { useUpdatePharmacyFileMutation } from 'api/pharmacyFiles';
import { useGetPharmacyFilesQuery } from 'api/pharmacyFiles';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../contexts/LanguageContext';

const EditFile = () => {
  const [fileName, setFileName] = useState(''); // State for file name
  const [image, setImage] = useState(null); // State for image file
  const [isDragging, setIsDragging] = useState(false); // State for drag-and-drop
  const [addFile] = useAddFileMutation(); // Mutation hook for adding a file
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const navigate = useNavigate();

  const {pharmacyId} = useParams();
  const {id} = useParams();
  const { data: files, refetch, isLoading } = useGetPharmacyFilesQuery({ id: pharmacyId, page: 1, limit: 10 });

  React.useEffect(() => {
    refetch();
  }, [refetch]);

  const [fileData, setFileData] = React.useState([]);

  React.useEffect(() => {
    const updatedFileData = files?.data?.filter((file) => file.id === id).map((file) => ({
      id: file.id,
      fileName: file.name,
      fileUrl: file.fileKey,
    })) || [];
    setFileData(updatedFileData);
    setFileName(updatedFileData[0]?.fileName || '');
    setImage(updatedFileData[0]?.fileUrl || null);
  }, [files, id]);

  console.log(fileData);
  const [addPharmacyFile] = useAddPharmacyFileMutation();
  const [updatePharmacyFile] = useUpdatePharmacyFileMutation();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');

  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // Handle image upload
  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      // Validate file type if needed
      if (!selectedFile.type.startsWith('image/')) {
        Swal.fire('Error!', 'Please upload an image file', 'error');
        return;
      }
      setImage(selectedFile);
    }
  };

  // Handle drag-and-drop events
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

  // Handle file input change
  const handleFileInputChange = (e) => {
    const files = e.target.files;
    handleImageUpload(files);
  };

  // Handle cancel action
  const handleCancel = () => {
    setFileName('');
    setImage(null);
  };

  // Handle form submission
  const handleSend = async () => {
    if (!fileName || !image) {
      Swal.fire('Error!', 'Please fill all required fields.', 'error');
      return;
    }

    try {
      // First upload the image
      let imageKey = image;

      // Check if the image is a new file or an existing one
      if (typeof image !== 'string') {
        const formData = new FormData();
        formData.append('file', image);

        const uploadResponse = await addFile(formData).unwrap();

        if (!uploadResponse.success || uploadResponse.data.uploadedFiles.length === 0) {
          throw new Error('Failed to upload image');
        }

        imageKey = uploadResponse.data.uploadedFiles[0].url;
      }

      // Prepare the payload for saving
      const payload = {
        name: fileName,
        fileKey: imageKey,
        isActive: true,
      };
      const response = await updatePharmacyFile({id:pharmacyId,fileId:id,data:payload}).unwrap();
      if (!response.success) {
        Swal.fire('Error!', 'Failed to save file.', 'error');
      }
      // Show success message
      Swal.fire('Success!', 'File uploaded successfully.', 'success');
      navigate(`/admin/pharmacy/${pharmacyId}/files`); // Redirect to the files page or any other page
    } catch (error) {
      console.error('Failed to upload file:', error);
      Swal.fire('Error!', error.message || 'Failed to upload file.', 'error');
    }
  };

  return (
    <div className="container add-file-container w-100">
      <Box bg={cardBg} className="add-file-card shadow p-4 w-100">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text color={textColor} fontSize="22px" fontWeight="700" mb="20px !important" lineHeight="100%">
            {t('files.editFile')}
          </Text>
          <Button type="button" onClick={() => navigate(-1)} colorScheme="teal" size="sm" leftIcon={<IoMdArrowBack />}>
            {t('files.back')}
          </Button>
        </div>
        <form dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
          {/* Title or File Name Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('files.fileName')}
              <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="text"
              id="file_name"
              placeholder={t('files.enterFileName')}
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              required
              mt={'8px'}
              bg={inputBg}
            />
          </div>

          {/* Drag-and-Drop Upload Section */}
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
                {image ? (
                  <Flex direction="column" align="center">
                  <a href={typeof image === 'string' ? image : URL.createObjectURL(image)} target="_blank" rel="noopener noreferrer">
                    <Image src={typeof image === 'string' ? image : URL.createObjectURL(image)} alt="File" maxH="200px" mb={2} borderRadius="md" />
                  </a>
                  <Button variant="outline" colorScheme="red" size="sm" onClick={() => setImage(null)}>
                    {t('files.removeImage')}
                  </Button>
                  </Flex>
                ) : (
                  <>
                  <Icon as={FaUpload} w={8} h={8} color="#422afb" mb={2} />
                  <Text color="gray.500" mb={2}>
                    {t('files.dragDropImageHere')}
                  </Text>
                  <Text color="gray.500" mb={2}>
                    {t('files.or')}
                  </Text>
                  <Button variant="outline" color="#422afb" border="none" onClick={() => document.getElementById('fileInput').click()}>
                    {t('files.uploadImage')}
                    <input
                    type="file"
                    id="fileInput"
                    hidden
                    accept="image/*"
                    onChange={handleFileInputChange}
                    />
                  </Button>
                  </>
                )}
                </Box>

                {/* Action Buttons */}
          <Flex justify="center" mt={4}>
            <Button variant="outline" colorScheme="red" onClick={handleCancel} mr={2}>
              {t('files.cancel')}
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
            >
              {t('files.save')}
            </Button>
          </Flex>
        </form>
      </Box>
    </div>
  );
};

export default EditFile;

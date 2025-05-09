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
  useToast,
} from '@chakra-ui/react';
import { IoMdArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { FaUpload } from 'react-icons/fa6';
import { useAddReturnMutation } from 'api/returnSlice';
import Swal from 'sweetalert2';
import { useAddFileMutation } from 'api/filesSlice';


const AddReturn = () => {
  const [formData, setFormData] = useState({
    contentEn: '',
    contentAr: '',
    imageKey: '',
  });

  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const navigate = useNavigate();
  const toast = useToast();
  const [error, setError] = useState(null);
  const [addFile] = useAddFileMutation();

  // Mutation hook for creating return policy
  const [createReturnPolicy, { isLoading }] = useAddReturnMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      setImage(files[0]);
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

  const handleSend = async () => {
    try {
       // First upload the image
       const file = new FormData();
       file.append('file', image);
 
       const uploadResponse = await addFile(file).unwrap();
       
       if (!uploadResponse.success || !uploadResponse.data.uploadedFiles[0]?.url) {
         throw new Error('Failed to upload image');
       }
       const imageKey = uploadResponse.data.uploadedFiles[0]?.url;
 
      // Prepare the payload in the required format
      const payload = {
        contentEn: formData.contentEn,
        contentAr: formData.contentAr,
        image: imageKey, // Or your actual image handling logic
      };

      // Send the data to the API
      const response = await createReturnPolicy(payload).unwrap();

      // Show success message
      Swal.fire({
        title: 'Success',
        description: 'Return policy created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Navigate back or to another page
      navigate('/admin/undefined/cms/returned');
    } catch (error) {
      setError(error.data);
      // Show error message
      Swal.fire({
        title: 'Error',
        description: error.data?.message || 'Failed to create return policy',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box w={"100%"} className="container add-admin-container w-100">
      <Box bg={cardBg} className="add-admin-card shadow p-4 w-100">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            Add Return Policy
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            Back
          </Button>
        </div>
        <form>
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

          {/* English Content */}
          <Box mt={4}>
            <Text color={textColor} fontSize="sm" fontWeight="700">
              English Content <span className="text-danger">*</span>
            </Text>
            <Textarea
              name="contentEn"
              value={formData.contentEn}
              onChange={handleChange}
              mt={2}
              height="200px"
              bg={inputBg}
              color={textColor}
              placeholder="Enter English content (Markdown supported)"
            />
          </Box>

          {/* Arabic Content */}
          <Box mt={4}>
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Arabic Content <span className="text-danger">*</span>
            </Text>
            <Textarea
              name="contentAr"
              value={formData.contentAr}
              onChange={handleChange}
              mt={2}
              height="200px"
              bg={inputBg}
              color={textColor}
              placeholder="أدخل المحتوى بالعربية (يدعم Markdown)"
              dir="rtl"
            />
          </Box>

          {/* Image Upload */}
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
            mt={4}
            mb={4}
          >
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
              onClick={() => document.getElementById('fileInput').click()}
            >
              Upload Image
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
                <Text ml={2} color={textColor}>
                  {image.name}
                </Text>
              </Box>
            )}
          </Box>

          {/* Save and Cancel Buttons */}
          <Flex justify="center" mt={6}>
            <Button variant="outline" colorScheme="red" mr={2} onClick={() => navigate(-1)}>
              Cancel
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
              Save Policy
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default AddReturn;
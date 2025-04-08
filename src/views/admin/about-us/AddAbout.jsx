import React, { useState, useEffect } from "react";
import {
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
  Spinner,
  Textarea,
} from "@chakra-ui/react";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

import Swal from "sweetalert2";
import { useGetAboutQuery } from "api/aboutSlice";
import { useAddAboutMutation } from "api/aboutSlice";

const AboutPage = () => {
  const { data: aboutData, isLoading: isFetching } = useGetAboutQuery();
  const [updateAbout, { isLoading: isUpdating }] = useAddAboutMutation();
  const navigate = useNavigate();
  const textColor = useColorModeValue("secondaryGray.900", "white");

  const [formData, setFormData] = useState({
    phone: "",
    location: "",
    mapUrl: "",
    // Add other fields as needed
  });

  // Initialize form with existing data
  useEffect(() => {
    if (aboutData?.data) {
      setFormData({
        phone: aboutData.data.phone || "",
        location: aboutData.data.location || "",
        mapUrl: aboutData.data.mapUrl || "",
        // Initialize other fields
      });
    }
  }, [aboutData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updateAbout(formData).unwrap();
      Swal.fire('Success!', 'About information saved successfully.', 'success');
    } catch (error) {
      console.error('Failed to save about:', error);
      Swal.fire(
        'Error!',
        error.data?.message || 'Failed to save about information.',
        'error'
      );
    }
  };

  if (isFetching) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

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
            {aboutData ? 'Edit About' : 'Add About'}
          </Text>
          
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Phone Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Phone
              <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="text"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleInputChange}
              required
              mt="8px"
            />
          </div>

          {/* Location Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Location
              <span className="text-danger mx-1">*</span>
            </Text>
            <Textarea
              name="location"
              placeholder="Enter location details"
              value={formData.location}
              onChange={handleInputChange}
              required
              mt="8px"
              rows={3}
            />
          </div>

          {/* Map URL Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Map URL
              <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="text"
              name="mapUrl"
              placeholder="Enter map URL"
              value={formData.mapUrl}
              onChange={handleInputChange}
              required
              mt="8px"
            />
          </div>

          {/* Action Buttons */}
          <Flex justify="flex-start" mt={6}>
            <Button
              variant='darkBrand'
              color='white'
              fontSize='sm'
              fontWeight='500'
              borderRadius='70px'
              px='24px'
              py='5px'
              type="submit"
              isLoading={isUpdating}
              loadingText="Saving..."
              mt='30px'
            >
              {aboutData ? 'Update' : 'Save'}
            </Button>
          </Flex>
        </form>
      </div>
    </div>
  );
};

export default AboutPage;
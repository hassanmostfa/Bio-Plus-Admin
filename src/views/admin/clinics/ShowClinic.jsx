import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Text,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { IoMdArrowBack } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetClinicQuery } from 'api/clinicSlice';

const ShowClinic = () => {
  const { id } = useParams();
  const { data, isLoading } = useGetClinicQuery(id);
  const clinic = data?.data || {};
  
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const navigate = useNavigate();

  // Get Arabic translation
  const arabicTranslation = clinic.translations?.find(t => t.languageId === 'ar');

  if (isLoading) {
    return <div>Loading...</div>;
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
            Clinic Details
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

        <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={8}>
          {/* Basic Info */}
          <Box>
            <Text fontSize="lg" fontWeight="600" mb={4}>Basic Information</Text>
            
            <Box mb={3}>
              <Text color="gray.500" fontSize="sm">English Name</Text>
              <Text fontSize="md">{clinic.name}</Text>
            </Box>
            
            <Box mb={3}>
              <Text color="gray.500" fontSize="sm">Arabic Name</Text>
              <Text fontSize="md" dir="">{arabicTranslation?.name || 'N/A'}</Text>
            </Box>
            
            <Box mb={3}>
              <Text color="gray.500" fontSize="sm">Email</Text>
              <Text fontSize="md">{clinic.email}</Text>
            </Box>
            
            <Box mb={3}>
              <Text color="gray.500" fontSize="sm">Status</Text>
              <Badge 
                colorScheme={clinic.isActive ? 'green' : 'red'} 
                fontSize="sm"
                p={1}
                borderRadius="md"
              >
                {clinic.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </Box>
          </Box>

          {/* Working Hours */}
          <Box>
            <Text fontSize="lg" fontWeight="600" mb={4}>Working Hours</Text>
            
            <Box mb={3}>
              <Text color="gray.500" fontSize="sm">Opening Time</Text>
              <Text fontSize="md">{clinic.fromTime}</Text>
            </Box>
            
            <Box mb={3}>
              <Text color="gray.500" fontSize="sm">Closing Time</Text>
              <Text fontSize="md">{clinic.toTime}</Text>
            </Box>
          </Box>

          {/* Locations */}
          <Box gridColumn="1 / -1">
            <Text fontSize="lg" fontWeight="600" mb={4}>Locations</Text>
            
            {clinic.locations?.map((location, index) => {
              const locationArabicName = location.translations?.find(t => t.languageId === 'ar')?.name;
              
              return (
                <Box 
                  key={index} 
                  mb={4} 
                  p={4} 
                  border="1px solid" 
                  borderColor={borderColor}
                  borderRadius="md"
                >
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <Box>
                      <Text color="gray.500" fontSize="sm">English Name</Text>
                      <Text fontSize="md">{location.name}</Text>
                    </Box>
                    
                    <Box>
                      <Text color="gray.500" fontSize="sm">Arabic Name</Text>
                      <Text fontSize="md" dir="">{locationArabicName || 'N/A'}</Text>
                    </Box>
                    
                    <Box>
                      <Text color="gray.500" fontSize="sm">Status</Text>
                      <Badge 
                        colorScheme={location.isActive ? 'green' : 'red'} 
                        fontSize="sm"
                        p={1}
                        borderRadius="md"
                      >
                        {location.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Box>
                  </Grid>
                </Box>
              );
            })}
          </Box>
        </Grid>

        <Flex justify="center" mt={6}>
          <Button
            variant="outline"
            colorScheme="teal"
            onClick={() => navigate(-1)}
            width="120px"
          >
            Back to List
          </Button>
        </Flex>
      </div>
    </div>
  );
};

export default ShowClinic;
import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  useColorModeValue,
  Image,
  Flex,
  Icon
} from '@chakra-ui/react';
import { IoMdArrowBack } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetReturnQuery } from 'api/returnSlice';
import Swal from 'sweetalert2';

const ShowReturn = () => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const navigate = useNavigate();
  const { id } = useParams();

  // API hook to fetch data
  const { data: returnData, isLoading: isFetching, error } = useGetReturnQuery(id);

  useEffect(() => {
    if (error) {
      Swal.fire({
        title: 'Error!',
        text: error.data?.message || 'Failed to load return policy',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  }, [error]);

  if (isFetching) {
    return <Box>Loading...</Box>;
  }

  if (!returnData?.data) {
    return <Box>No data found</Box>;
  }

  return (
    <Box w="100%" className="container add-admin-container w-100">
      <Box bg={cardBg} className="add-admin-card shadow p-4 w-100">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text color={textColor} fontSize="22px" fontWeight="700">
            View Return Policy
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<Icon as={IoMdArrowBack} />}
          >
            Back
          </Button>
        </div>

        {/* English Content */}
        <Box mt={4}>
          <Text color={textColor} fontSize="sm" fontWeight="700">
            English Content
          </Text>
          <Box 
            mt={2}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            bg="gray.50"
            color={textColor}
          >
            {returnData.data.contentEn || 'No content available'}
          </Box>
        </Box>

        {/* Arabic Content */}
        <Box mt={4}>
          <Text color={textColor} fontSize="sm" fontWeight="700">
            Arabic Content
          </Text>
          <Box 
            mt={2}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            bg="gray.50"
            color={textColor}
            dir="rtl"
          >
            {returnData.data.contentAr || 'لا يوجد محتوى متاح'}
          </Box>
        </Box>

        {/* Image Display */}
        {returnData.data.image && (
          <Box mt={4}>
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Image
            </Text>
            <Flex
              mt={2}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              bg="gray.50"
              justify="center"
            >
              <Image
                src={`${process.env.REACT_APP_API_URL}/uploads/${returnData.data.image}`}
                alt="Return policy"
                maxH="300px"
                objectFit="contain"
              />
            </Flex>
          </Box>
        )}

        {/* Back Button */}
        <Flex justify="center" mt={6}>
          <Button 
            variant="outline" 
            colorScheme="teal" 
            onClick={() => navigate(-1)}
          >
            Back to List
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default ShowReturn;
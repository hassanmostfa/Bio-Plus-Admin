import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
  Stack,
  SimpleGrid,
  useToast,
  Image,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { IoMdArrowBack } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetPharmacyQuery } from 'api/pharmacySlice';

const ShowPharmacy = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');

  const {
    data,
    isLoading: isFetching,
    error: fetchError,
  } = useGetPharmacyQuery(id);
  const pharmacy = data?.data;

  useEffect(() => {
    if (fetchError) {
      toast({
        title: 'Error',
        description: fetchError.data?.message || 'Failed to load pharmacy data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [fetchError, toast]);

  if (isFetching) return <Text>Loading...</Text>;
  if (fetchError) return <Text>Error loading pharmacy data.</Text>;
  if (!pharmacy) return <Text>No pharmacy data found.</Text>;

  return (
    <Box p={{ base: "20px", md: "30px" }}>
      <Flex justify="space-between" align="center" mb="30px">
        <Text color={textColor} fontSize="2xl" fontWeight="bold">
          Pharmacy Details
        </Text>
        <Button
          leftIcon={<IoMdArrowBack />}
          colorScheme="teal"
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Basic Information Card */}
        <Card bg={cardBg} boxShadow="lg" borderRadius="xl">
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Text fontSize="xl" fontWeight="bold">Basic Information</Text>
              <Badge colorScheme={pharmacy.isActive ? "green" : "red"}>
                {pharmacy.isActive ? "Active" : "Inactive"}
              </Badge>
            </Flex>
          </CardHeader>
          <CardBody>
            <Stack spacing={4}>
              <Stat>
                <StatLabel color="gray.500">Pharmacy Name (English)</StatLabel>
                <StatNumber fontSize="lg">{pharmacy.name}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="gray.500">Pharmacy Name (Arabic)</StatLabel>
                <StatNumber fontSize="lg">{pharmacy.name}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="gray.500">Email</StatLabel>
                <StatNumber fontSize="lg">{pharmacy.email}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="gray.500">WhatsApp Number</StatLabel>
                <StatNumber fontSize="lg">{pharmacy.whatsappNumber}</StatNumber>
              </Stat>
            </Stack>
          </CardBody>
        </Card>

        {/* Image Card */}
        <Card bg={cardBg} boxShadow="lg" borderRadius="xl">
          <CardHeader>
            <Text fontSize="xl" fontWeight="bold">Pharmacy Image</Text>
          </CardHeader>
          <CardBody>
            {pharmacy.imageKey ? (
              <Box>
                <Image
                  src={pharmacy.imageKey}
                  alt="Pharmacy"
                  maxH="300px"
                  borderRadius="md"
                  mx="auto"
                  objectFit="cover"
                />
              </Box>
            ) : (
              <Text color="gray.500" textAlign="center">No image available</Text>
            )}
          </CardBody>
        </Card>

        {/* Revenue Settings Card */}
        <Card bg={cardBg} boxShadow="lg" borderRadius="xl">
          <CardHeader>
            <Text fontSize="xl" fontWeight="bold">Revenue Settings</Text>
          </CardHeader>
          <CardBody>
            <Stack spacing={4}>
              <Stat>
                <StatLabel color="gray.500">Revenue Share Type</StatLabel>
                <StatNumber fontSize="lg">
                  {pharmacy.revenueShareType === 'percentage' ? 'Percentage' : 'Fixed Fees'}
                </StatNumber>
              </Stat>

              {pharmacy.revenueShareType === 'percentage' ? (
                <Stat>
                  <StatLabel color="gray.500">Percentage</StatLabel>
                  <StatNumber fontSize="lg">{pharmacy.revenueShare}%</StatNumber>
                </Stat>
              ) : (
                <>
                  <Stat>
                    <StatLabel color="gray.500">Fixed Fees</StatLabel>
                    <StatNumber fontSize="lg">{pharmacy.fixedFees}</StatNumber>
                  </Stat>
                  <SimpleGrid columns={2} spacing={4}>
                    <Stat>
                      <StatLabel color="gray.500">Start Date</StatLabel>
                      <StatNumber fontSize="md">
                        {new Date(pharmacy.feesStartDate).toLocaleDateString()}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel color="gray.500">End Date</StatLabel>
                      <StatNumber fontSize="md">
                        {new Date(pharmacy.feesEndDate).toLocaleDateString()}
                      </StatNumber>
                    </Stat>
                  </SimpleGrid>
                </>
              )}
            </Stack>
          </CardBody>
        </Card>

        {/* Additional Settings Card */}
        <Card bg={cardBg} boxShadow="lg" borderRadius="xl">
          <CardHeader>
            <Text fontSize="xl" fontWeight="bold">Additional Settings</Text>
          </CardHeader>
          <CardBody>
            <Stack spacing={4}>
              <Stat>
                <StatLabel color="gray.500">Working Hours</StatLabel>
                <StatNumber fontSize="lg">{pharmacy.workingHours}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="gray.500">IBAN</StatLabel>
                <StatNumber fontSize="lg">{pharmacy.iban}</StatNumber>
              </Stat>
              <Divider />
              <Stack spacing={3}>
                <Text color="gray.500">Delivery Settings:</Text>
                <Text>• Delivery across your zone</Text>
                <Text>• Usually dispatches orders on the same day</Text>
                <Text>• Delivery fee will apply</Text>
                <Text>• All orders will be delivered by healthy pharmacy</Text>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Branches Section */}
      <Card bg={cardBg} boxShadow="lg" borderRadius="xl" mt={6}>
        <CardHeader>
          <Text fontSize="xl" fontWeight="bold">Branches ({pharmacy.numOfBranches})</Text>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {pharmacy.branches?.map((branch, index) => (
              <Card key={index} variant="outline" p={4}>
                <Flex justify="space-between" align="center" mb={4}>
                  <Text fontSize="lg" fontWeight="bold">Branch {index + 1}</Text>
                  <Badge colorScheme={branch.isActive ? "green" : "red"}>
                    {branch.isActive ? "Active" : "Inactive"}
                  </Badge>
                </Flex>
                <Stack spacing={4}>
                  <Stat>
                    <StatLabel color="gray.500">Name (English)</StatLabel>
                    <StatNumber fontSize="lg">{branch.name}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel color="gray.500">Name (Arabic)</StatLabel>
                    <StatNumber fontSize="lg">{branch.name}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel color="gray.500">Address (English)</StatLabel>
                    <StatNumber fontSize="lg">{branch.address}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel color="gray.500">Address (Arabic)</StatLabel>
                    <StatNumber fontSize="lg">{branch.address}</StatNumber>
                  </Stat>
                  {branch.locationLink && (
                    <Stat>
                      <StatLabel color="gray.500">Location Link</StatLabel>
                      <StatHelpText>
                        <a href={branch.locationLink} target="_blank" rel="noopener noreferrer" style={{ color: 'teal' }}>
                          View Location
                        </a>
                      </StatHelpText>
                    </Stat>
                  )}
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
};

export default ShowPharmacy;
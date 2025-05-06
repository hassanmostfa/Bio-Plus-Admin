import { useGetDoctorQuery } from 'api/doctorSlice';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Flex, 
  Grid, 
  Heading, 
  Text, 
  Avatar, 
  Badge, 
  Stack, 
  List, 
  ListItem, 
  ListIcon,
  Image,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  FaPhone, 
  FaClinicMedical, 
  FaLaptopMedical, 
  FaCertificate, 
  FaLanguage, 
  FaVenusMars, 
  FaUserMd,
  FaEnvelope
} from 'react-icons/fa';
import { GiDoctorFace } from 'react-icons/gi';


const ShowDoctor = () => {
  const {id} = useParams();
  const {data: doctorData,refetch} = useGetDoctorQuery(id);
  useEffect(() => {
    refetch();
  }, []);
  const doctor = doctorData?.data;

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const primaryColor = useColorModeValue('blue.500', 'blue.300');
  const secondaryColor = useColorModeValue('teal.500', 'teal.300');

  if (!doctor) return (
    <Flex justify="center" align="center" h="100vh">
      <Text>Loading...</Text>
    </Flex>
  );

  return (
    <Box className="container row py-5">
      {/* Main Profile Card */}
      <Box className="row">
        <Box className="col-12">
          <Box 
            bg={cardBg}
            borderRadius="xl"
            boxShadow="lg"
            overflow="hidden"
            mb={6}
          >
            {/* Doctor Header */}
            <Flex direction={{ base: 'column', md: 'row' }}>
              <Flex 
                align="center" 
                justify="center"
                bgGradient={`linear(to-br, ${primaryColor}, ${secondaryColor})`}
                p={8}
                minW={{ md: '300px' }}
              >
                {doctor.imageKey ? (
                  <Avatar 
                    size="2xl" 
                    src={`${doctor.imageKey}`} 
                    name={doctor.fullName}
                    border="4px solid white"
                    boxShadow="lg"
                  />
                ) : (
                  <Box 
                    as={GiDoctorFace} 
                    size="120px" 
                    color="white" 
                  />
                )}
              </Flex>
              
              <Box p={8} flex={1}>
                <Badge 
                  colorScheme="blue" 
                  fontSize="sm" 
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  {doctor.specialization}
                </Badge>
                
                <Heading as="h1" size="xl" mt={2}>
                  {doctor.title} {doctor.fullName}
                </Heading>
                
                <Flex align="center" mt={4} wrap="wrap" gap={4}>
                  <Flex align="center">
                    <Box as={FaVenusMars} mr={2} />
                    <Text>{doctor.gender === 'MALE' ? 'Male' : 'Female'}</Text>
                  </Flex>
                  
                  <Flex align="center">
                    <Box as={FaUserMd} mr={2} />
                    <Text color={doctor.isRecommended ? 'green.500' : 'gray.500'}>
                      {doctor.isRecommended ? 'Recommended' : 'Not Recommended'}
                    </Text>
                  </Flex>
                </Flex>
                
                <Box mt={6}>
                  <Heading as="h2" size="md" mb={2}>
                    About
                  </Heading>
                  <Text color="gray.600">
                    {doctor.about || 'No information provided'}
                  </Text>
                </Box>
              </Box>
            </Flex>
          </Box>
        </Box>
      </Box>

      {/* Contact Information */}
      <Box className="row mb-5 col-md-12">
        <Box className="col-12">
          <Box 
            bg={cardBg}
            borderRadius="xl"
            boxShadow="lg"
            p={6}
          >
            <Heading as="h2" size="lg" mb={4}>
              Contact Information
            </Heading>
            
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
              <Box>
                <Flex align="center" mb={2}>
                  <Box as={FaPhone} color={primaryColor} mr={2} />
                  <Heading as="h3" size="sm">
                    Phone Numbers
                  </Heading>
                </Flex>
                <List spacing={2}>
                  {doctor.phones?.map((phone) => (
                    <ListItem key={phone.id}>
                      <Text>{phone.phoneNumber}</Text>
                    </ListItem>
                  ))}
                </List>
              </Box>
              
              <Box>
                <Flex align="center" mb={2}>
                  <Box as={FaEnvelope} color={primaryColor} mr={2} />
                  <Heading as="h3" size="sm">
                    Email
                  </Heading>
                </Flex>
                <Text>{doctor.email}</Text>
              </Box>
            </Grid>
          </Box>
        </Box>
      </Box>

      {/* Languages */}
      {doctor.languages?.length > 0 && (
        <Box className="row mb-5">
          <Box className="col-12">
            <Box 
              bg={cardBg}
              borderRadius="xl"
              boxShadow="lg"
              p={6}
            >
              <Heading as="h2" size="lg" mb={4}>
                Languages Spoken
              </Heading>
              <Flex wrap="wrap" gap={2}>
                {doctor.languages.map((language, index) => (
                  <Badge 
                    key={index} 
                    colorScheme="blue" 
                    px={3} 
                    py={1} 
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                  >
                    <Box as={FaLanguage} mr={1} />
                    {language}
                  </Badge>
                ))}
              </Flex>
            </Box>
          </Box>
        </Box>
      )}

      {/* Consultation Options */}
      <Box className="row mb-5">
        <Box className="col-12">
          <Box 
            bg={cardBg}
            borderRadius="xl"
            boxShadow="lg"
            p={6}
          >
            <Heading as="h2" size="lg" mb={4}>
              Consultation Options
            </Heading>
            
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
              {doctor.hasClinicConsult && (
                <Box 
                  borderWidth="1px" 
                  borderRadius="lg" 
                  p={4}
                  borderColor={borderColor}
                >
                  <Flex align="center" mb={3}>
                    <Box as={FaClinicMedical} color="green.500" fontSize="xl" mr={3} />
                    <Heading as="h3" size="md">
                      Clinic Visit
                    </Heading>
                  </Flex>
                  <Text color="gray.600" mb={4}>
                    In-person consultation at the doctor's clinic
                  </Text>
                  
                  <Heading as="h4" size="sm" mb={2}>
                    Available Clinics:
                  </Heading>
                  <List spacing={2}>
                    {doctor.clinics?.map(clinic => (
                      <ListItem key={clinic.id}>
                        <Flex justify="space-between">
                          <Text>{clinic.clinicName}</Text>
                          <Text fontWeight="bold">${doctor.clinicFees}</Text>
                        </Flex>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              {doctor.hasOnlineConsult && (
                <Box 
                  borderWidth="1px" 
                  borderRadius="lg" 
                  p={4}
                  borderColor={borderColor}
                >
                  <Flex align="center" mb={3}>
                    <Box as={FaLaptopMedical} color="purple.500" fontSize="xl" mr={3} />
                    <Heading as="h3" size="md">
                      Online Consultation
                    </Heading>
                  </Flex>
                  <Text color="gray.600" mb={4}>
                    Video or phone consultation from anywhere
                  </Text>
                  
                  <Flex justify="space-between">
                    <Text fontWeight="medium">Consultation Fee:</Text>
                    <Text fontWeight="bold">${doctor.onlineFees}</Text>
                  </Flex>
                </Box>
              )}
            </Grid>
          </Box>
        </Box>
      </Box>

      {/* Certificates */}
      {doctor.certificates?.length > 0 && (
        <Box className="row">
          <Box className="col-12">
            <Box 
              bg={cardBg}
              borderRadius="xl"
              boxShadow="lg"
              p={6}
            >
              <Heading as="h2" size="lg" mb={4}>
                Certifications
              </Heading>
              
              <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr' }} gap={4}>
                {doctor.certificates.map(cert => (
                  <Box 
                    key={cert.id} 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    overflow="hidden"
                    borderColor={borderColor}
                  >
                    <Image 
                      src={`${cert.imageKey}`} 
                      alt="Certificate" 
                      objectFit="contain"
                      bg="gray.100"
                      h="200px"
                      w="100%"
                    />
                    <Box p={3} bg="gray.50">
                      <Flex align="center">
                        <Box as={FaCertificate} color="yellow.500" mr={2} />
                        <Text fontSize="sm" color="gray.600">
                          Issued: {new Date(cert.createdAt).toLocaleDateString()}
                        </Text>
                      </Flex>
                    </Box>
                  </Box>
                ))}
              </Grid>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ShowDoctor;
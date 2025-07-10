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
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../contexts/LanguageContext';

const ShowPharmacy = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const {
    data,
    isLoading: isFetching,
    error: fetchError,
  } = useGetPharmacyQuery(id);
  const pharmacy = data?.data;

  useEffect(() => {
    if (fetchError) {
      toast({
        title: t('common.error'),
        description: fetchError.data?.message || t('pharmacy.failedToLoadData'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [fetchError, toast, t]);

  if (isFetching) return <Text>{t('pharmacy.loading')}</Text>;
  if (fetchError) return <Text>{t('pharmacy.errorFetching')}</Text>;
  if (!pharmacy) return <Text>{t('pharmacy.noData')}</Text>;

  return (
    <Box p={{ base: "20px", md: "30px" }} dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'} mt={10}>
      <Flex justify="space-between" align="center" mb="30px">
        <Text color={textColor} fontSize="2xl" fontWeight="bold">
          {t('pharmacy.showPharmacy')}
        </Text>
        <Button
          leftIcon={<IoMdArrowBack />}
          colorScheme="teal"
          variant="outline"
          onClick={() => navigate(-1)}
        >
          {t('pharmacy.back')}
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Basic Information Card */}
        <Card bg={cardBg} boxShadow="lg" borderRadius="xl">
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Text fontSize="xl" fontWeight="bold">{t('pharmacy.basicInformation')}</Text>
              <Badge colorScheme={pharmacy.isActive ? "green" : "red"}>
                {pharmacy.isActive ? t('pharmacy.active') : t('pharmacy.inactive')}
              </Badge>
            </Flex>
          </CardHeader>
          <CardBody>
            <Stack spacing={4}>
              <Stat>
                <StatLabel color="gray.500">{t('pharmacy.pharmacyNameEn')}</StatLabel>
                <StatNumber fontSize="lg">{ pharmacy.name}</StatNumber>
              </Stat>
              
              <Stat>
                <StatLabel color="gray.500">{t('pharmacy.email')}</StatLabel>
                <StatNumber fontSize="lg">{pharmacy.email}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="gray.500">{t('pharmacy.whatsappNumber')}</StatLabel>
                <StatNumber fontSize="lg">{pharmacy.whatsappNumber}</StatNumber>
              </Stat>
            </Stack>
          </CardBody>
        </Card>

        {/* Image Card */}
        <Card bg={cardBg} boxShadow="lg" borderRadius="xl">
          <CardHeader>
            <Text fontSize="xl" fontWeight="bold">{t('pharmacy.pharmacyImage')}</Text>
          </CardHeader>
          <CardBody>
            {pharmacy.imageKey ? (
              <Box>
                <Image
                  src={pharmacy.imageKey}
                  alt={t('pharmacy.pharmacy')}
                  maxH="300px"
                  borderRadius="md"
                  mx="auto"
                  objectFit="cover"
                />
              </Box>
            ) : (
              <Text color="gray.500" textAlign="center">{t('pharmacy.noImageAvailable')}</Text>
            )}
          </CardBody>
        </Card>

        {/* Revenue Settings Card */}
        <Card bg={cardBg} boxShadow="lg" borderRadius="xl">
          <CardHeader>
            <Text fontSize="xl" fontWeight="bold">{t('pharmacy.revenueSettings')}</Text>
          </CardHeader>
          <CardBody>
            <Stack spacing={4}>
              <Stat>
                <StatLabel color="gray.500">{t('pharmacy.revenueShareType')}</StatLabel>
                <StatNumber fontSize="lg">
                  {pharmacy.revenueShareType === 'percentage' ? t('pharmacy.percentage') : t('pharmacy.fixedFees')}
                </StatNumber>
              </Stat>

              {pharmacy.revenueShareType === 'percentage' ? (
                <Stat>
                  <StatLabel color="gray.500">{t('pharmacy.percentage')}</StatLabel>
                  <StatNumber fontSize="lg">{pharmacy.revenueShare}%</StatNumber>
                </Stat>
              ) : (
                <>
                  <Stat>
                    <StatLabel color="gray.500">{t('pharmacy.fixedFees')}</StatLabel>
                    <StatNumber fontSize="lg">{pharmacy.fixedFees}</StatNumber>
                  </Stat>
                  <SimpleGrid columns={2} spacing={4}>
                    <Stat>
                      <StatLabel color="gray.500">{t('pharmacy.feesStartDate')}</StatLabel>
                      <StatNumber fontSize="md">
                        {new Date(pharmacy.feesStartDate).toLocaleDateString()}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel color="gray.500">{t('pharmacy.feesEndDate')}</StatLabel>
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
            <Text fontSize="xl" fontWeight="bold">{t('pharmacy.additionalSettings')}</Text>
          </CardHeader>
          <CardBody>
            <Stack spacing={4}>
              <Stat>
                <StatLabel color="gray.500">{t('pharmacy.workingHours')}</StatLabel>
                <StatNumber fontSize="lg">{pharmacy.workingHours}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="gray.500">{t('pharmacy.iban')}</StatLabel>
                <StatNumber fontSize="lg">{pharmacy.iban}</StatNumber>
              </Stat>
              <Divider />
              <Stack spacing={3}>
                <Text color="gray.500">{t('pharmacy.deliverySettings')}:</Text>
                <Text>• {t('pharmacy.deliveryAcrossZone')}</Text>
                <Text>• {t('pharmacy.usuallyDispatchesOrders')}</Text>
                <Text>• {t('pharmacy.deliveryFeeWillApply')}</Text>
                <Text>• {t('pharmacy.allOrdersWillBeDelivered')}</Text>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Branches Section */}
      <Card bg={cardBg} boxShadow="lg" borderRadius="xl" mt={6}>
        <CardHeader>
          <Text fontSize="xl" fontWeight="bold">{t('pharmacy.branches')} ({pharmacy.numOfBranches})</Text>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {pharmacy.branches?.map((branch, index) => (
              <Card key={index} variant="outline" p={4}>
                <Flex justify="space-between" align="center" mb={4}>
                  <Text fontSize="lg" fontWeight="bold">{t('pharmacy.branch')} {index + 1}</Text>
                  <Badge colorScheme={branch.isActive ? "green" : "red"}>
                    {branch.isActive ? t('pharmacy.active') : t('pharmacy.inactive')}
                  </Badge>
                </Flex>
                <Stack spacing={4}>
                  <Stat>
                    <StatLabel color="gray.500">{t('pharmacy.branchNameEn')}</StatLabel>
                    <StatNumber fontSize="lg">{branch.name}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel color="gray.500">{t('pharmacy.branchNameAr')}</StatLabel>
                    <StatNumber fontSize="lg">{branch.name}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel color="gray.500">{t('pharmacy.addressEn')}</StatLabel>
                    <StatNumber fontSize="lg">{branch.address}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel color="gray.500">{t('pharmacy.addressAr')}</StatLabel>
                    <StatNumber fontSize="lg">{branch.address}</StatNumber>
                  </Stat>
                  {branch.locationLink && (
                    <Stat>
                      <StatLabel color="gray.500">{t('pharmacy.locationLink')}</StatLabel>
                      <StatHelpText>
                        <a href={branch.locationLink} target="_blank" rel="noopener noreferrer" style={{ color: 'teal' }}>
                          {t('pharmacy.viewLocation')}
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
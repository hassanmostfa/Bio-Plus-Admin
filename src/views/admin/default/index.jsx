import {
  Box,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import IconBox from "components/icons/IconBox";
import MiniStatistics from "components/card/MiniStatistics";
import {
  MdOutlineGroup,
  MdOutlineLocalPharmacy,
  MdOutlineMedicalServices,
  MdOutlineStore,
  MdOutlineShoppingCart,
  MdOutlineEventNote,
  MdOutlinePerson,
  MdOutlineBrandingWatermark,
  MdFamilyRestroom,
} from "react-icons/md";
import { useEffect } from "react";
import { AiOutlineProduct } from "react-icons/ai";
import { LuShoppingBasket, LuLayers3 } from "react-icons/lu";
import { useGetStatsQuery } from "../../../api/statsSlice";
import { useTranslation } from 'react-i18next';

export default function UserReports() {
  const { t } = useTranslation();
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");

  const { data, isLoading , refetch } = useGetStatsQuery();
  console.log(data);
  const stats = data?.data;
  useEffect(() => {
    refetch();
  }, [refetch , isLoading]);

  const cardData = [
    { name: t('dashboard.totalAdmins'), value: stats?.totalAdmins || 0, icon: MdOutlineGroup },
    { name: t('dashboard.totalPharmacies'), value: stats?.totalPharmacies || 0, icon: MdOutlineLocalPharmacy },
    { name: t('dashboard.totalDoctors'), value: stats?.totalDoctors || 0, icon: MdOutlineMedicalServices },
    { name: t('dashboard.totalClinics'), value: stats?.totalClinics || 0, icon: MdOutlineStore },
    { name: t('dashboard.totalOrders'), value: stats?.totalOrders || 0, icon: MdOutlineShoppingCart },
    { name: t('dashboard.totalAppointments'), value: stats?.totalAppointments || 0, icon: MdOutlineEventNote },
    { name: t('dashboard.totalUsers'), value: stats?.totalUsers || 0, icon: MdOutlinePerson },
    { name: t('dashboard.totalBrands'), value: stats?.totalBrands || 0, icon: MdOutlineBrandingWatermark },
    { name: t('dashboard.totalProducts'), value: stats?.totalProducts || 0, icon: LuShoppingBasket },
    { name: t('dashboard.totalProductTypes'), value: stats?.totalProductTypes || 0, icon: AiOutlineProduct },
    { name: t('dashboard.totalCategories'), value: stats?.totalCategories || 0, icon: LuLayers3 },
    { name: t('dashboard.totalFamilyAccounts'), value: stats?.totalFamilyMembers || 0, icon: MdFamilyRestroom },
  ];

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="20px" mb="20px">
        {cardData.map((card, index) => (
          <MiniStatistics
            key={index}
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={<Icon w="32px" h="32px" as={card.icon} color={brandColor} />}
              />
            }
            name={card.name}
            value={card.value}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
}

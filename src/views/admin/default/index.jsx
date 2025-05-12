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

export default function UserReports() {
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");

  const { data, isLoading , refetch } = useGetStatsQuery();
  const stats = data?.data;

  useEffect(() => {
    refetch();
  }, [refetch , isLoading]);

  const cardData = [
    { name: "Total Admins", value: stats?.totalAdmins || 0, icon: MdOutlineGroup },
    { name: "Total Pharmacy", value: stats?.totalPharmacies || 0, icon: MdOutlineLocalPharmacy },
    { name: "Total Doctors", value: stats?.totalDoctors || 0, icon: MdOutlineMedicalServices },
    { name: "Total Clinics", value: stats?.totalClinics || 0, icon: MdOutlineStore },
    { name: "Total Orders", value: stats?.totalOrders || 0, icon: MdOutlineShoppingCart },
    { name: "Total Appointments", value: stats?.totalAppointments || 0, icon: MdOutlineEventNote },
    { name: "Total Users", value: stats?.totalUsers || 0, icon: MdOutlinePerson },
    { name: "Total Brands", value: stats?.totalBrands || 0, icon: MdOutlineBrandingWatermark },
    { name: "Total Products", value: stats?.totalProducts || 0, icon: LuShoppingBasket },
    { name: "Total Product Types", value: stats?.totalProductTypes || 0, icon: AiOutlineProduct },
    { name: "Total Categories", value: stats?.totalCategories || 0, icon: LuLayers3 },
    { name: "Total Family Accounts", value: stats?.totalFamilyMembers || 0, icon: MdFamilyRestroom },
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

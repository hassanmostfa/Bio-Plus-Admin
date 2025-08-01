import React from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdBarChart,
  MdHome,
  MdOutlineShoppingCart,
  MdSettings,
  MdLocalPharmacy,
  MdMedicalServices,
  MdPeople,
  MdCategory,
  MdInventory,
  MdAssignment,
  MdList,
} from 'react-icons/md';

import { TbBrandAdonisJs } from 'react-icons/tb';
import { MdAdminPanelSettings } from 'react-icons/md';
import { TiMinus } from 'react-icons/ti';
import { BiSolidCategoryAlt } from 'react-icons/bi';
import { FaRegCalendarDays } from 'react-icons/fa6';
import { LiaClinicMedicalSolid } from 'react-icons/lia';
import { IoNotificationsOutline } from 'react-icons/io5';
import { CiDiscount1 } from 'react-icons/ci';
import { BsEnvelopeArrowUpFill } from "react-icons/bs";
import { FaIdCard } from "react-icons/fa6";
import { LuDatabaseBackup } from "react-icons/lu";
// Admin Imports
import MainDashboard from 'views/admin/default';
import NFTMarketplace from 'views/admin/marketplace';
import Admins from 'views/admin/admins/Admins';
import AddAdmin from 'views/admin/admins/AddAdmin';
import Roles from 'views/admin/roles/Roles';
import Users from 'views/admin/users/Users';
import FamilyAccounts from 'views/admin/users/FamilyAccounts';
import PromoCodes from 'views/admin/promoCodes/PromoCodes';
import AddPromoCode from 'views/admin/promoCodes/AddPromoCode';
import AddRole from 'views/admin/roles/AddRole';
import AllNotification from 'views/admin/notification/AllNotification';
import AddNotification from 'views/admin/notification/AddNotification';
import AllTypes from 'views/admin/productType/AllTypes';
import AddType from 'views/admin/productType/AddType';
import AllBrands from 'views/admin/brand/AllBrands';
import AddBrand from 'views/admin/brand/AddBrand';
import AllCategories from 'views/admin/category/AllCategories';
import AddCategory from 'views/admin/category/AddCategory';
import Blogs from 'views/admin/blog/Blogs';
import AddBlog from 'views/admin/blog/AddBlog';
import Ads from 'views/admin/ads/Ads';
import AddAd from 'views/admin/ads/AddAd';
import Banner from 'views/admin/banner/Banner';
import AddBanner from 'views/admin/banner/AddBanner';
import About from 'views/admin/about-us/About';
import AddAbout from 'views/admin/about-us/AddAbout';
import PrivcyAndPolicy from 'views/admin/privcyAndPolicy/PrivcyAndPolicy';
import AddPrivcy from 'views/admin/privcyAndPolicy/AddPrivcy';
import Returns from 'views/admin/return/Returns';
import AddReturn from 'views/admin/return/AddReturn';
import Pharmacy from 'views/admin/pharmacy/Pharmacy';
import AddPharmacy from 'views/admin/pharmacy/AddPharmacy';
import Branches from 'views/admin/pharmacy/Branches';
import AddBranch from 'views/admin/pharmacy/AddBranch';
import Variants from 'views/admin/variants/Variants';
import AddVariant from 'views/admin/variants/AddVariant';
import Attributes from 'views/admin/variants/Attributes';
import AddAttribute from 'views/admin/variants/AddAttribute';
import Tags from 'views/admin/tags/Tags';
import AddTag from 'views/admin/tags/AddTag';
import Presecibtions from 'views/admin/presecibtions/Presecibtions';
import AddPresecibtions from 'views/admin/presecibtions/AddPresecibtions';
import ProtectedRoute from 'components/protectedRoute/ProtectedRoute';
import EditRole from 'views/admin/roles/EditRole';
import Products from 'views/admin/products/Products';
import AddProduct from 'views/admin/products/AddProduct';
import Doctors from 'views/admin/doctors/Doctors';
import AddDoctor from 'views/admin/doctors/AddDoctor';
import Clinics from 'views/admin/clinics/Clinics';
import AddClinic from 'views/admin/clinics/AddClinic';
import EditAdmin from 'views/admin/admins/EditAdmin';
import ShowAdmin from 'views/admin/admins/ShowAdmin';
import EditPharmacy from 'views/admin/pharmacy/EditPharmacy';
import Orders from 'views/admin/orders/Orders';
import Appointments from 'views/admin/appointments/Appointments';
import PharmacyRequests from 'views/admin/pharmacy/PharmacyRequests';
import EditCategory from 'views/admin/category/EditCategory';
import EditBrand from 'views/admin/brand/EditBrand';
import EditType from 'views/admin/productType/EditType';
import EditVariant from 'views/admin/variants/EditVariant';
import EditClinic from 'views/admin/clinics/EditClinic';
import ShowClinic from 'views/admin/clinics/ShowClinic';
import EditPromoCode from 'views/admin/promoCodes/EditPromoCode';
import EditTag from 'views/admin/tags/EditTag';
import EditReturn from 'views/admin/return/EditReturn';
import ShowReturn from 'views/admin/return/ShowReturn';
import EditBlog from 'views/admin/blog/EditBlog';
import EditBanner from 'views/admin/banner/EditBanner';
import Specialization from 'views/admin/doctorSpecializations/Specialization';
import AddSpecialize from 'views/admin/doctorSpecializations/AddSpecialize';
import EditSpecialization from 'views/admin/doctorSpecializations/EditSpecialization';
import ShowDoctor from 'views/admin/doctors/ShowDoctor';
import EditDoctor from 'views/admin/doctors/EditDoctor';
import ShowProduct from 'views/admin/products/ShowProduct';
import EditProduct from 'views/admin/products/EditProduct';
import EditAd from 'views/admin/ads/EditAd';
import ActvityLog from 'views/admin/activityLog/ActivityLog';
import AddUser from 'views/admin/users/AddUser';
import AddOrder from 'views/admin/orders/AddOrder';
import FileManager from 'views/admin/pharmacy/FileManger';
import AddFile from 'views/admin/pharmacy/AddFile';
import Reports from 'views/admin/reports/Reports';
import BackupAndRestore from 'views/admin/backup/BackupAndRestore';
import DeliveryFees from 'views/admin/deliveryFees/DeliveryFees';
import EditUser from 'views/admin/users/EditUser';
import HomeBanners from 'views/admin/homeBanner/HomeBanners';
import EditHomeBanner from 'views/admin/homeBanner/EditHomeBanner';
import AddHomeBanner from 'views/admin/homeBanner/AddHomeBanner';
import EditFile from 'views/admin/pharmacy/EditFile';
import ShowPharmacy from 'views/admin/pharmacy/ShowPharmacy';

const getRoutes = (t) => {
  return [
    {
      name: t('sidebar.superAdmin'),
      layout: '/admin',
      path: '/dashboard',
      icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
      component:<ProtectedRoute><MainDashboard /></ProtectedRoute> ,
      showInSidebar: true,
    },
    /* Start Admin Routes */
    {
      name: t('sidebar.adminManagement'),
      layout: '/admin',
      icon: (
        <Icon
        as={MdAdminPanelSettings}
        width="20px"
        height="20px"
        color="#8f9bba"
        />
      ),
      component: null,
      showInSidebar: true,
      subRoutes: [
        {
          name: t('sidebar.admins'),
          path: '/admins',
          icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
          component: <Admins />,
          showInSidebar: true,
        },
        {
          name: t('sidebar.roles'),
          path: '/roles',
          icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
          component: <Roles />,
          showInSidebar: true,
        },
        {
          name: t('sidebar.activityLogs'),
          path: '/logs',
          icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
          component: <ActvityLog />,
          showInSidebar: true,
        },
      ],
    },
    {
      name: t('sidebar.adminManagement'),
      layout: '/admin',
      path: '/add-New-Role',
      icon: (
        <Icon as={FaRegCalendarDays} width="20px" height="20px" color="inherit" />
      ),
      component: <AddRole />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.adminManagement'),
      layout: '/admin',
      path: '/edit/role/:id',
      icon: (
        <Icon as={FaRegCalendarDays} width="20px" height="20px" color="inherit" />
      ),
      component: <EditRole />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.adminManagement'),
      layout: '/admin',
      path: '/add-admin',
      component: <AddAdmin />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.adminManagement'),
      layout: '/admin',
      path: '/edit-admin/:id',
      component: <EditAdmin />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.adminManagement'),
      layout: '/admin',
      path: '/admin/details/:id',
      component: <ShowAdmin />,
      showInSidebar: false,
    },
    /* End Admin Routes */
    {
      name: t('sidebar.pharmacyManagement'),
      layout: '/admin',
      path: '/pharmacy',
      icon: (
        <Icon as={MdLocalPharmacy} width="20px" height="20px" color="inherit" />
      ),
      component: <Pharmacy />,
      showInSidebar: true,
    },
    {
      name: t('sidebar.pharmacyManagement'),
      layout: '/admin',
      path: '/add-pharmacy',
      component: <AddPharmacy />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.pharmacyManagement'),
      layout: '/admin',
      path: '/edit-pharmacy/:id',
      component: <EditPharmacy />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.pharmacyManagement'),
      layout: '/admin',
      path: '/show/pharmacy/:id',
      component: <ShowPharmacy />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.pharmacyManagement'),
      layout: '/admin',
      path: '/pharmacy-branches',
      component: <Branches />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.pharmacyManagement'),
      layout: '/admin',
      path: '/add-branch',
      component: <AddBranch />,
      showInSidebar: false,
    },
    {
      name: 'Pharmacy Files',
      layout: '/admin',
      path: '/pharmacy/:pharmacyId/files',
      component: <FileManager />,
      showInSidebar: false,
    },
    {
      name: 'Pharmacy add file',
      layout: '/admin',
      path: '/pharmacy/:pharmacyId/add/file',
      component: <AddFile />,
      showInSidebar: false,
    },
    {
      name: 'Pharmacy edit file',
      layout: '/admin',
      path: '/pharmacy/:pharmacyId/edit-file/:id',
      component: <EditFile />,
      showInSidebar: false,
    },

    /* Start Clinics Routes */
    {
      name: t('sidebar.clinicManagement'),
      layout: '/admin',
      path: '/clinics',
      icon: (
        <Icon
          as={LiaClinicMedicalSolid}
          width="20px"
          height="20px"
          color="inherit"
        />
      ),
      component: <Clinics />,
      showInSidebar: true,
    },
    {
      name: t('sidebar.clinicManagement'),
      layout: '/admin',
      path: '/add-clinic',
      component: <AddClinic />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.clinicManagement'),
      layout: '/admin',
      path: '/edit-clinic/:id',
      component: <EditClinic />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.clinicManagement'),
      layout: '/admin',
      path: '/show-clinic/:id',
      component: <ShowClinic />,
      showInSidebar: false,
    },
    /* Start Clinics Routes */

    /* Start Doctors Routes */
    {
      name: t('sidebar.doctorManagement'),
      layout: '/admin',
      path: '/doctors',
      icon: (
        <Icon as={MdMedicalServices} width="20px" height="20px" color="inherit" />
      ),
      component: <Doctors />,
      showInSidebar: true,
    },
    {
      name: t('sidebar.doctorManagement'),
      layout: '/admin',
      path: '/add/doctor',
      component: <AddDoctor />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.doctorManagement'),
      layout: '/admin',
      path: '/doctor/:id',
      component: <ShowDoctor />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.doctorManagement'),
      layout: '/admin',
      path: '/edit/doctor/:id',
      component: <EditDoctor />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.doctorsSpecializations'),
      layout: '/admin',
      path: '/specializations',
      icon: (
        <Icon as={FaIdCard} width="20px" height="20px" color="inherit" />
      ),
      component: <Specialization />,
      showInSidebar: true,
    },
    {
      name: 'create Doctor Specializations',
      layout: '/admin',
      path: '/add-specialization',
      icon: (
        <Icon as={MdMedicalServices} width="20px" height="20px" color="inherit" />
      ),
      component: <AddSpecialize />,
      showInSidebar: false,
    },
    {
      name: 'edit Doctor Specializations',
      layout: '/admin',
      path: '/edit-specialization/:id',
      icon: (
        <Icon as={MdMedicalServices} width="20px" height="20px" color="inherit" />
      ),
      component: <EditSpecialization />,
      showInSidebar: false,
    },
    /* End Doctors Routes */
    
    {
      name: t('sidebar.userManagement'),
      layout: '/admin',
      path: '/users',
      icon: <Icon as={MdPeople} width="20px" height="20px" color="inherit" />,
      component: <Users />,
      showInSidebar: true,
    },
    {
      name: t('sidebar.userManagement'),
      layout: '/admin',
      path: '/add-user',
      component: <AddUser />,
      showInSidebar: false,
    },
    {
      name: 'Edit User',
      layout: '/admin',
      path: '/users/edit/:id',
      icon: <Icon as={MdPeople} width="20px" height="20px" color="inherit" />,
      component: <EditUser />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.categories'),
      layout: '/admin',
      path: '/categories',
      icon: (
        <Icon
          as={BiSolidCategoryAlt}
          width="20px"
          height="20px"
          color="inherit"
        />
      ),
      component: <AllCategories />,
      showInSidebar: true,
    },
    {
      name: t('sidebar.categories'),
      layout: '/admin',
      path: '/add-category',
      icon: (
        <Icon
          as={BiSolidCategoryAlt}
          width="20px"
          height="20px"
          color="inherit"
        />
      ),
      component: <AddCategory />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.categories'),
      layout: '/admin',
      path: '/edit-category/:id',
      icon: (
        <Icon
          as={BiSolidCategoryAlt}
          width="20px"
          height="20px"
          color="inherit"
        />
      ),
      component: <EditCategory />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.products'),
      layout: '/admin',
      path: '/products',
      icon: <Icon as={MdInventory} width="20px" height="20px" color="inherit" />,
      component: <Products />,
      showInSidebar: true,
    },
    {
      name: t('sidebar.products'),
      layout: '/admin',
      path: '/products/:id',
      icon: <Icon as={MdInventory} width="20px" height="20px" color="inherit" />,
      component: <ShowProduct />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.products'),
      layout: '/admin',
      path: '/edit-product/:id',
      icon: <Icon as={MdInventory} width="20px" height="20px" color="inherit" />,
      component: <EditProduct />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.products'),
      layout: '/admin',
      path: '/add-product',
      component: <AddProduct />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.variants'),
      layout: '/admin',
      path: '/variants',
      icon: <Icon as={MdList} width="20px" height="20px" color="inherit" />,
      component: <Variants />,
      showInSidebar: true,
    },
    {
      name: t('sidebar.variants'),
      layout: '/admin',
      path: '/add-variant',
      component: <AddVariant />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.variants'),
      layout: '/admin',
      path: '/edit-variant/:id',
      component: <EditVariant />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.variants'),
      layout: '/admin',
      path: '/variant-attributes',
      component: <Attributes />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.variants'),
      layout: '/admin',
      path: '/add-attribute',
      component: <AddAttribute />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.productTypes'),
      layout: '/admin',
      path: '/product-types',
      icon: <Icon as={MdCategory} width="20px" height="20px" color="inherit" />,
      component: <AllTypes />,
      showInSidebar: true,
    },
    {
      name: t('sidebar.productTypes'),
      layout: '/admin',
      path: '/add-product-types',
      icon: <Icon as={MdCategory} width="20px" height="20px" color="inherit" />,
      component: <AddType />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.productTypes'),
      layout: '/admin',
      path: '/add-product-types',
      icon: <Icon as={MdCategory} width="20px" height="20px" color="inherit" />,
      component: <AddType />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.productTypes'),
      layout: '/admin',
      path: '/edit-product-type/:id',
      icon: <Icon as={MdCategory} width="20px" height="20px" color="inherit" />,
      component: <EditType />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.brands'),
      layout: '/admin',
      path: '/brands',
      icon: (
        <Icon as={TbBrandAdonisJs} width="20px" height="20px" color="inherit" />
      ),
      component: <AllBrands />,
      showInSidebar: true,
    },
    {
      name: t('sidebar.brands'),
      layout: '/admin',
      path: '/add-brand',
      icon: (
        <Icon as={TbBrandAdonisJs} width="20px" height="20px" color="inherit" />
      ),
      component: <AddBrand />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.brands'),
      layout: '/admin',
      path: '/edit-brand/:id',
      icon: (
        <Icon as={TbBrandAdonisJs} width="20px" height="20px" color="inherit" />
      ),
      component: <EditBrand />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.prescription'),
      layout: '/admin',
      path: '/prescription',
      icon: <Icon as={MdAssignment} width="20px" height="20px" color="inherit" />,
      component: <Presecibtions />,
      showInSidebar: true,
    },
    {
      name: t('sidebar.prescription'),
      layout: '/admin',
      path: '/add-prescription',
      icon: <Icon as={MdAssignment} width="20px" height="20px" color="inherit" />,
      component: <AddPresecibtions />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.orders'),
      layout: '/admin',
      path: '/orders',
      icon: (
        <Icon
          as={MdOutlineShoppingCart}
          width="20px"
          height="20px"
          color="inherit"
        />
      ),
      component: <Orders />,
      showInSidebar: true,
    },
    {
      name: t('sidebar.orders'),
      layout: '/admin',
      path: '/add-order',
      component: <AddOrder />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.pharmacyRequests'),
      layout: '/admin',
      path: '/pharmacy-requests',
      icon: (
        <Icon
          as={BsEnvelopeArrowUpFill}
          width="20px"
          height="20px"
          color="inherit"
        />
      ),
      component: <PharmacyRequests />,
      showInSidebar: true,
    },
    {
      name: t('sidebar.notifications'),
      layout: '/admin',
      path: '/notifications',
      icon: (
        <Icon
          as={IoNotificationsOutline}
          width="20px"
          height="20px"
          color="inherit"
        />
      ),
      component: <AddNotification />,
      showInSidebar: true,
    },
    {
      name: t('sidebar.promoCodes'),
      layout: '/admin',
      path: '/promo-codes',
      icon: <Icon as={CiDiscount1} width="20px" height="20px" color="inherit" />,
      component: <PromoCodes />,
      showInSidebar: true,
    },
    {
      name: t('sidebar.promoCodes'),
      layout: '/admin',
      path: '/add-promo-code',
      component: <AddPromoCode />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.promoCodes'),
      layout: '/admin',
      path: '/edit-promo-code/:id',
      component: <EditPromoCode />,
      showInSidebar: false,
    },
    {
      name: t('sidebar.appointments'),
      layout: '/admin',
      path: '/appointments',
      icon: (
        <Icon as={FaRegCalendarDays} width="20px" height="20px" color="inherit" />
      ),
      component: <Appointments />,
      showInSidebar: true,
    },
    {
      name: t('sidebar.reports'),
      layout: '/admin',
      path: '/reports',
      icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
      component: <Reports />,
      showInSidebar: true,
    },
    {
      name: t('sidebar.cms'),
      layout: '/admin',
      icon: <Icon as={MdSettings} width="20px" height="20px" color="#8f9bba" />,
      component: null,
      showInSidebar: true,
      subRoutes: [
        {
          name: t('sidebar.tags'),
          path: '/tags',
          icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
          component: <Tags />,
          showInSidebar: true,
        },
        {
          name: t('sidebar.blogs'),
          path: '/blogs',
          icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
          component: <Blogs />,
          showInSidebar: true,
        },
        {
          name: t('sidebar.deliveryFees'),
          path: '/delivery-fees',
          icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
          component: <DeliveryFees />,
          showInSidebar: true,
        },
        {
          name: t('sidebar.banners'),
          path: '/cms/banners',
          icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
          component: <Banner />,
          showInSidebar: true,
        },
        {
          name: t('sidebar.homeBanners'),
          path: '/cms/home-banners',
          icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
          component: <HomeBanners />,
          showInSidebar: true,
        },

        {
          name: t('sidebar.ads'),
          path: '/cms/ads',
          icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
          component: <Ads />,
          showInSidebar: true,
        },
        {
          name: t('sidebar.aboutUs'),
          path: '/cms/about-us',
          icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
          component: <AddAbout />,
          showInSidebar: true,
        },
        {
          name: t('sidebar.privacyPolicy'),
          path: '/cms/privacy-and-policy',
          icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
          component: <AddPrivcy />,
          showInSidebar: true,
        },
        {
          name: t('sidebar.return'),
          path: '/cms/returned',
          icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
          component: <Returns />,
          showInSidebar: true,
        },
      ],
    },
    {
      name: t('sidebar.backupAndRestore'),
      layout: '/admin',
      path: '/backup-and-restore',
      icon: <Icon as={LuDatabaseBackup} width="20px" height="20px" color="inherit" />,
      component: <BackupAndRestore />,
      showInSidebar: true,
    },
    {
      name: 'Add tag',
      layout: '/admin',
      path: '/add-tag',
      icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
      component: <AddTag />,
      showInSidebar: false,
    },
    {
      name: 'Add tag',
      layout: '/admin',
      path: '/edit-tag/:id',
      icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
      component: <EditTag />,
      showInSidebar: false,
    },
    {
      name: 'Add blog',
      layout: '/admin',
      path: '/add-blogs',
      icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
      component: <AddBlog />,
      showInSidebar: false,
    },
    {
      name: 'Edit blog',
      layout: '/admin',
      path: '/edit-blogs/:id',
      icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
      component: <EditBlog />,
      showInSidebar: false,
    },
    {
      name: 'Add ads',
      layout: '/admin', 
      path: '/cms/add-ads',
      icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
      component: <AddAd />,
      showInSidebar: false,
    },
    {
      name: 'Edit ads',
      layout: '/admin', 
      path: '/cms/edit-ads/:id',
      icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
      component: <EditAd />,
      showInSidebar: false,
    },
    {
      name: 'Add Banner',
      layout: '/admin', 
      path: '/cms/add-banner',
      icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
      component: <AddBanner />,
      showInSidebar: false,
    },
    {
      name: 'Add Banner',
      layout: '/admin', 
      path: '/cms/edit-banner/:id',
      icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
      component: <EditBanner />,
      showInSidebar: false,
    },
    {
      name: 'Add About',
      layout: '/admin', 
      path: '/cms/add-about',
      icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
      component: <AddAbout />,
      showInSidebar: false,
    },
    {
      name: 'Add Privacy & Policy',
      layout: '/admin', 
      path: '/cms/add-privcy',
      component: <AddPrivcy />,
      showInSidebar: false,
    },
    {
      name: 'Add Return',
      layout: '/admin', 
      path: '/cms/add-return',
      component: <AddReturn />,
      showInSidebar: false,
    },
    {
      name: 'Add Return',
      layout: '/admin', 
      path: '/cms/edit-return/:id',
      component: <EditReturn />,
      showInSidebar: false,
    },
    {
      name: 'Add Return',
      layout: '/admin', 
      path: '/cms/show-return/:id',
      component: <ShowReturn />,
      showInSidebar: false,
    },

    
    {
      name: t('sidebar.familyAccounts'),
      layout: '/admin',
      path: '/family-Accounts/:id',
      component: <FamilyAccounts />,
      showInSidebar: false,
    },

    {
      name: 'Home Banner',
      layout: '/admin',
      path: '/home-banner/edit/:id',
      component: <EditHomeBanner />,
      showInSidebar: false,
    },
    {
      name: 'Home Banner',
      layout: '/admin',
      path: 'home-banner/add',
      component: <AddHomeBanner />,
      showInSidebar: false,
    },
  ];
};

export default getRoutes;

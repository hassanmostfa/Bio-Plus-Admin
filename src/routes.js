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


// Admin Imports
import MainDashboard from 'views/admin/default';
import NFTMarketplace from 'views/admin/marketplace';
import Profile from 'views/admin/profile';
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


const routes = [
  {
    name: 'Super Admin',
    layout: '/admin',
    path: '/dashboard',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component:<ProtectedRoute><MainDashboard /></ProtectedRoute> ,
    showInSidebar: true,
  },
  /* Start Admin Routes */
  {
    name: 'Admin Management',
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
        name: 'Admins',
        path: '/admins',
        icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
        component: <Admins />,
        showInSidebar: true,
      },
      {
        name: 'Rules',
        path: '/rules',
        icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
        component: <Roles />,
        showInSidebar: true,
      },
    ],
  },
  {
    name: 'Admin Management',
    layout: '/admin',
    path: '/add-New-Rule',
    icon: (
      <Icon as={FaRegCalendarDays} width="20px" height="20px" color="inherit" />
    ),
    component: <AddRole />,
    showInSidebar: false,
  },
  {
    name: 'Admin Management',
    layout: '/admin',
    path: '/edit/rule/:id',
    icon: (
      <Icon as={FaRegCalendarDays} width="20px" height="20px" color="inherit" />
    ),
    component: <EditRole />,
    showInSidebar: false,
  },
  {
    name: 'Admin Management',
    layout: '/admin',
    path: '/add-admin',
    component: <AddAdmin />,
    showInSidebar: false,
  },
  {
    name: 'Admin Management',
    layout: '/admin',
    path: '/edit-admin/:id',
    component: <EditAdmin />,
    showInSidebar: false,
  },
  {
    name: 'Admin Management',
    layout: '/admin',
    path: '/admin/details/:id',
    component: <ShowAdmin />,
    showInSidebar: false,
  },
  /* End Admin Routes */
  {
    name: 'Pharmacy Management',
    layout: '/admin',
    path: '/pharmacy',
    icon: (
      <Icon as={MdLocalPharmacy} width="20px" height="20px" color="inherit" />
    ),
    component: <Pharmacy />,
    showInSidebar: true,
  },
  {
    name: 'Pharmacy Management',
    layout: '/admin',
    path: '/add-pharmacy',
    component: <AddPharmacy />,
    showInSidebar: false,
  },
  {
    name: 'Pharmacy Management',
    layout: '/admin',
    path: '/edit-pharmacy/:id',
    component: <EditPharmacy />,
    showInSidebar: false,
  },
  {
    name: 'Pharmacy Management',
    layout: '/admin',
    path: '/pharmacy-branches',
    component: <Branches />,
    showInSidebar: false,
  },
  {
    name: 'Pharmacy Management',
    layout: '/admin',
    path: '/add-branch',
    component: <AddBranch />,
    showInSidebar: false,
  },
  /* Start Doctors Routes */
  {
    name: 'Doctor Management',
    layout: '/admin',
    path: '/doctors',
    icon: (
      <Icon as={MdMedicalServices} width="20px" height="20px" color="inherit" />
    ),
    component: <Doctors />,
    showInSidebar: true,
  },
  {
    name: 'Doctor Management',
    layout: '/admin',
    path: '/add/doctor',
    component: <AddDoctor />,
    showInSidebar: false,
  },
  /* End Doctors Routes */

  /* Start Clinics Routes */
  {
    name: 'Clinic Management',
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
    name: 'Clinic Management',
    layout: '/admin',
    path: '/add-clinic',
    component: <AddClinic />,
    showInSidebar: false,
  },
  {
    name: 'Clinic Management',
    layout: '/admin',
    path: '/edit-clinic/:id',
    component: <EditClinic />,
    showInSidebar: false,
  },
  {
    name: 'Clinic Management',
    layout: '/admin',
    path: '/show-clinic/:id',
    component: <ShowClinic />,
    showInSidebar: false,
  },
  /* Start Clinics Routes */

  {
    name: 'User Management',
    layout: '/admin',
    path: '/users',
    icon: <Icon as={MdPeople} width="20px" height="20px" color="inherit" />,
    component: <Users />,
    showInSidebar: true,
  },
  {
    name: 'Categories',
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
    name: 'Categories',
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
    name: 'Categories',
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
    name: 'Products',
    layout: '/admin',
    path: '/products',
    icon: <Icon as={MdInventory} width="20px" height="20px" color="inherit" />,
    component: <Products />,
    showInSidebar: true,
  },
  {
    name: 'Products',
    layout: '/admin',
    path: '/add-product',
    component: <AddProduct />,
    showInSidebar: false,
  },
  {
    name: 'Variants',
    layout: '/admin',
    path: '/variants',
    icon: <Icon as={MdList} width="20px" height="20px" color="inherit" />,
    component: <Variants />,
    showInSidebar: true,
  },
  {
    name: 'Variants',
    layout: '/admin',
    path: '/add-variant',
    component: <AddVariant />,
    showInSidebar: false,
  },
  {
    name: 'Variants',
    layout: '/admin',
    path: '/edit-variant/:id',
    component: <EditVariant />,
    showInSidebar: false,
  },
  {
    name: 'Variants',
    layout: '/admin',
    path: '/variant-attributes',
    component: <Attributes />,
    showInSidebar: false,
  },
  {
    name: 'Variants',
    layout: '/admin',
    path: '/add-attribute',
    component: <AddAttribute />,
    showInSidebar: false,
  },
  {
    name: 'Product Types',
    layout: '/admin',
    path: '/product-types',
    icon: <Icon as={MdCategory} width="20px" height="20px" color="inherit" />,
    component: <AllTypes />,
    showInSidebar: true,
  },
  {
    name: 'Product Types',
    layout: '/admin',
    path: '/add-product-types',
    icon: <Icon as={MdCategory} width="20px" height="20px" color="inherit" />,
    component: <AddType />,
    showInSidebar: false,
  },
  {
    name: 'Product Types',
    layout: '/admin',
    path: '/add-product-types',
    icon: <Icon as={MdCategory} width="20px" height="20px" color="inherit" />,
    component: <AddType />,
    showInSidebar: false,
  },
  {
    name: 'Product Types',
    layout: '/admin',
    path: '/edit-product-type/:id',
    icon: <Icon as={MdCategory} width="20px" height="20px" color="inherit" />,
    component: <EditType />,
    showInSidebar: false,
  },
  {
    name: 'Brands',
    layout: '/admin',
    path: '/brands',
    icon: (
      <Icon as={TbBrandAdonisJs} width="20px" height="20px" color="inherit" />
    ),
    component: <AllBrands />,
    showInSidebar: true,
  },
  {
    name: 'Brands',
    layout: '/admin',
    path: '/add-brand',
    icon: (
      <Icon as={TbBrandAdonisJs} width="20px" height="20px" color="inherit" />
    ),
    component: <AddBrand />,
    showInSidebar: false,
  },
  {
    name: 'Brands',
    layout: '/admin',
    path: '/edit-brand/:id',
    icon: (
      <Icon as={TbBrandAdonisJs} width="20px" height="20px" color="inherit" />
    ),
    component: <EditBrand />,
    showInSidebar: false,
  },
  {
    name: 'Prescription',
    layout: '/admin',
    path: '/prescription',
    icon: <Icon as={MdAssignment} width="20px" height="20px" color="inherit" />,
    component: <Presecibtions />,
    showInSidebar: true,
  },
  {
    name: 'Prescription',
    layout: '/admin',
    path: '/add-prescription',
    icon: <Icon as={MdAssignment} width="20px" height="20px" color="inherit" />,
    component: <AddPresecibtions />,
    showInSidebar: false,
  },
  {
    name: 'Orders',
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
    name: 'Pharmacy Requests',
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
    name: 'Notifications',
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
    component: <AllNotification />,
    showInSidebar: true,
  },
  {
    name: 'Notifications',
    layout: '/admin',
    path: '/add-notifications',
    icon: (
      <Icon
        as={IoNotificationsOutline}
        width="20px"
        height="20px"
        color="inherit"
      />
    ),
    component: <AddNotification />,
    showInSidebar: false,
  },
  {
    name: 'Promo Codes',
    layout: '/admin',
    path: '/promo-codes',
    icon: <Icon as={CiDiscount1} width="20px" height="20px" color="inherit" />,
    component: <PromoCodes />,
    showInSidebar: true,
  },
  {
    name: 'Promo Codes',
    layout: '/admin',
    path: '/add-promo-code',
    component: <AddPromoCode />,
    showInSidebar: false,
  },
  {
    name: 'Appointments',
    layout: '/admin',
    path: '/appointments',
    icon: (
      <Icon as={FaRegCalendarDays} width="20px" height="20px" color="inherit" />
    ),
    component: <Appointments />,
    showInSidebar: true,
  },
  {
    name: 'Reports',
    layout: '/admin',
    path: '/reports',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    component: <NFTMarketplace />,
    showInSidebar: true,
  },
  {
    name: 'CMS',
    layout: '/admin',
    icon: <Icon as={MdSettings} width="20px" height="20px" color="#8f9bba" />,
    component: null,
    showInSidebar: true,
    subRoutes: [
      {
        name: 'Tags',
        path: '/tags',
        icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
        component: <Tags />,
        showInSidebar: true,
      },
      {
        name: 'Blogs',
        path: '/blogs',
        icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
        component: <Blogs />,
        showInSidebar: true,
      },
      
      {
        name: 'Banners',
        path: '/cms/banners',
        icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
        component: <Banner />,
        showInSidebar: true,
      },
      {
        name: 'Ads',
        path: '/cms/ads',
        icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
        component: <Ads />,
        showInSidebar: true,
      },
      {
        name: 'About Us',
        path: '/cms/about-us',
        icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
        component: <About />,
        showInSidebar: true,
      },
      {
        name: 'Privacy & Policy',
        path: '/cms/privacy-and-policy',
        icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
        component: <PrivcyAndPolicy />,
        showInSidebar: true,
      },
      {
        name: 'Return',
        path: '/cms/returned',
        icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
        component: <Returns />,
        showInSidebar: true,
      },
    ],
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
    name: 'Add blog',
    layout: '/admin',
    path: '/add-blogs',
    icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
    component: <AddBlog />,
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
    name: 'Add Banner',
    layout: '/admin', 
    path: '/cms/add-banner',
    icon: <Icon as={TiMinus} width="20px" height="20px" color="inherit" />,
    component: <AddBanner />,
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
    name: 'Family Accounts',
    layout: '/admin',
    path: '/family-Accounts',
    component: <FamilyAccounts />,
    showInSidebar: false,
  },
];

export default routes;

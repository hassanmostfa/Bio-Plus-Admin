import React, { useState } from "react";
import { Box, Flex, Text, Collapse, Icon, useColorModeValue } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { NavLink, useLocation } from "react-router-dom";

const DropdownMenu = ({ route }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Chakra color mode
  let activeColor = useColorModeValue("red.500", "white");
  let inactiveColor = useColorModeValue("secondaryGray.600", "secondaryGray.600");
  let textColor = useColorModeValue("#a9b6e3", "#a9b6e3");

  // Toggle dropdown
  const toggleDropdown = () => setIsOpen(!isOpen);

  // Check if a route is active
  const isRouteActive = (path) => {
    if (!path) return false;
    
    const currentPath = location.pathname;
    
    // Direct match
    if (currentPath.includes(path)) {
      return true;
    }
    
    // Handle parent-child relationships for add/edit pages
    const routeMappings = {
      '/pharmacy': ['/add-pharmacy', '/edit-pharmacy', '/show/pharmacy', '/pharmacy-branches', '/add-branch'],
      '/doctors': ['/add/doctor', '/edit/doctor', '/doctor/'],
      '/users': ['/add-user', '/users/edit'],
      '/categories': ['/add-category', '/edit-category'],
      '/products': ['/add-product', '/edit-product', '/products/'],
      '/variants': ['/add-variant', '/edit-variant', '/variant-attributes', '/add-attribute'],
      '/product-types': ['/add-product-types', '/edit-product-type'],
      '/brands': ['/add-brand', '/edit-brand'],
      '/prescription': ['/add-prescription'],
      '/orders': ['/add-order'],
      '/notifications': ['/add-notification'],
      '/promo-codes': ['/add-promo-code', '/edit-promo-code'],
      '/specializations': ['/add-specialization', '/edit-specialization'],
      '/tags': ['/add-tag', '/edit-tag'],
      '/blogs': ['/add-blogs', '/edit-blogs'],
      '/cms/banners': ['/cms/add-banner', '/cms/edit-banner'],
      '/cms/home-banners': ['/home-banner/edit', '/home-banner/add'],
      '/cms/ads': ['/cms/add-ads', '/cms/edit-ads'],
      '/cms/about-us': ['/cms/add-about'],
      '/cms/privacy-and-policy': ['/cms/add-privcy'],
      '/cms/returned': ['/cms/add-return', '/cms/edit-return', '/cms/show-return'],
      '/admins': ['/add-admin', '/edit-admin', '/admin/details'],
      '/roles': ['/add-New-Role', '/edit/role']
    };
    
    // Check if current path matches any child routes of the parent route
    const childRoutes = routeMappings[path];
    if (childRoutes) {
      return childRoutes.some(childRoute => currentPath.includes(childRoute));
    }
    
    return false;
  };

  // Check if any sub-route is active
  const isAnySubRouteActive = (subRoutes) => {
    return subRoutes.some((subRoute) => isRouteActive(subRoute.path));
  };

  // Determine if the dropdown title should be white
  const isDropdownTitleActive = route.subRoutes && isAnySubRouteActive(route.subRoutes);

  return (
    <Box>
      <Flex
        align="center"
        p="10px"
        _hover={{ color: "#fff", cursor: "pointer" }}
        onClick={toggleDropdown}
      >
        {/* Render the icon for the dropdown title */}
        {route.icon && (
          <Box me="12px">
            {React.cloneElement(route.icon, {
              color: isDropdownTitleActive ? "white" : textColor, // Set icon color dynamically
            })}
          </Box>
        )}
        <Text
          color={isDropdownTitleActive ? "white" : textColor} // Set text color dynamically
          fontWeight={isDropdownTitleActive ? "bold" : "normal"}
          _hover={{ color: "#fff", cursor: "pointer" }}
        >
          {route.name}
        </Text>
        <Icon as={isOpen ? ChevronDownIcon : ChevronRightIcon} color={textColor} ml="auto" />
      </Flex>
      <Collapse in={isOpen}>
        {route.subRoutes && route.subRoutes.map((subRoute, index) => (
          <Box pl="20px" key={index}>
            <NavLink to={subRoute.layout + subRoute.path}>
              <Flex align="center">
                {/* Render the icon for the sub-route */}
                {subRoute.icon && (
                  <Box me="12px">
                    {React.cloneElement(subRoute.icon, {
                      color: isRouteActive(subRoute.path) ? "white" : textColor, // Set icon color dynamically
                    })}
                  </Box>
                )}
                <Text
                  p="10px"
                  color={isRouteActive(subRoute.path) ? activeColor : inactiveColor}
                  fontWeight={isRouteActive(subRoute.path) ? "bold" : "normal"}
                  _hover={{ color: "#fff", cursor: "pointer" }}
                >
                  {subRoute.name}
                </Text>
              </Flex>
            </NavLink>
          </Box>
        ))}
      </Collapse>
    </Box>
  );
};

export default DropdownMenu;
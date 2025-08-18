import React, { useState, useEffect, useRef } from "react";
import {
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  useOutsideClick,
  Spinner,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import getRoutes from '../../../routes';

export function SearchBar(props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef();

  // Pass the computed styles into the `__css` prop
  const { variant, background, children, placeholder, borderRadius, ...rest } = props;
  
  // Chakra Color Mode
  const searchIconColor = useColorModeValue("gray.700", "white");
  const inputBg = useColorModeValue("secondaryGray.300", "navy.900");
  const inputText = useColorModeValue("gray.700", "gray.100");
  const dropdownBg = useColorModeValue("white", "navy.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.100");

  // Get all routes
  const allRoutes = getRoutes(t);

  // Flatten routes to include main routes and sub-routes
  const flattenRoutes = (routes) => {
    const flattened = [];
    
    routes.forEach(route => {
      // Add main route if it has a path and should be shown in sidebar
      if (route.path && route.showInSidebar) {
        flattened.push({
          name: route.name,
          path: route.path,
          layout: route.layout,
          icon: route.icon,
          type: 'main',
          fullPath: `${route.layout}${route.path}`
        });
      }
      
      // Add sub-routes if they exist
      if (route.subRoutes) {
        route.subRoutes.forEach(subRoute => {
          if (subRoute.showInSidebar) {
            flattened.push({
              name: subRoute.name,
              path: subRoute.path,
              layout: route.layout || '/admin', // Use parent layout or default to /admin
              icon: subRoute.icon,
              type: 'sub',
              parentName: route.name,
              fullPath: `${route.layout || '/admin'}/undefined${subRoute.path}`
            });
          }
        });
      }
    });
    
    return flattened;
  };

  const flattenedRoutes = flattenRoutes(allRoutes);

  // Close dropdown when clicking outside
  useOutsideClick({
    ref: searchRef,
    handler: () => setIsOpen(false),
  });

  // Process search results
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    
    // Search through routes
    const results = flattenedRoutes.filter(route => 
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (route.parentName && route.parentName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    setSearchResults(results.slice(0, 10)); // Limit to 10 results
    setIsSearching(false);
    setIsOpen(results.length > 0);
    setSelectedIndex(-1); // Reset selection when results change
  }, [searchQuery, flattenedRoutes]);

  const handleResultClick = (result) => {
    navigate(result.fullPath);
    setSearchQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleResultClick(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const getTypeColor = (type) => {
    return type === 'main' ? 'blue.500' : 'green.500';
  };

  return (
    <Box position="relative" ref={searchRef} {...rest}>
      <InputGroup w={{ base: "100%", md: "200px" }}>
        <InputLeftElement
          children={
            <IconButton
              bg='inherit'
              borderRadius='inherit'
              _hover='none'
              _active={{
                bg: "inherit",
                transform: "none",
                borderColor: "transparent",
              }}
              _focus={{
                boxShadow: "none",
              }}
              icon={
                isSearching ? (
                  <Spinner size="sm" color={searchIconColor} />
                ) : (
                  <SearchIcon color={searchIconColor} w='15px' h='15px' />
                )
              }
            />
          }
        />
        <Input
          variant='search'
          fontSize='sm'
          bg={background ? background : inputBg}
          color={inputText}
          fontWeight='500'
          _placeholder={{ color: "gray.400", fontSize: "14px" }}
          borderRadius={borderRadius ? borderRadius : "30px"}
          placeholder={placeholder ? placeholder : "Search pages..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (searchQuery && searchResults.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
        />
      </InputGroup>

      {/* Search Results Dropdown */}
      {isOpen && (
        <Box
          position="absolute"
          top="100%"
          left="0"
          right="0"
          mt="2"
          bg={dropdownBg}
          borderRadius="lg"
          boxShadow="lg"
          border="1px solid"
          borderColor={borderColor}
          zIndex={1000}
          maxH="400px"
          overflowY="auto"
        >
          <VStack spacing={0} align="stretch">
            {isSearching ? (
              <Box p="4" textAlign="center">
                <Spinner size="sm" color={searchIconColor} />
                <Text fontSize="sm" color="gray.500" mt="2">
                  Searching...
                </Text>
              </Box>
            ) : searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <Box
                  key={`${result.type}-${result.path}`}
                  p="3"
                  cursor="pointer"
                  _hover={{ bg: hoverBg }}
                  onClick={() => handleResultClick(result)}
                  borderBottom={index < searchResults.length - 1 ? "1px solid" : "none"}
                  borderColor={borderColor}
                  bg={selectedIndex === index ? hoverBg : "transparent"}
                >
                  <HStack spacing={3}>
                    <Avatar
                      size="sm"
                      bg={getTypeColor(result.type)}
                      icon={result.icon}
                    />
                    <Box flex="1">
                      <Text fontSize="sm" fontWeight="medium" color={inputText}>
                        {result.name}
                      </Text>
                      {result.parentName && (
                        <Text fontSize="xs" color="gray.500">
                          {result.parentName}
                        </Text>
                      )}
                    </Box>
                    <Text fontSize="xs" color="gray.400" textTransform="capitalize">
                      {result.type}
                    </Text>
                  </HStack>
                </Box>
              ))
            ) : searchQuery.length >= 2 ? (
              <Box p="4" textAlign="center">
                <Text fontSize="sm" color="gray.500">
                  No pages found for "{searchQuery}"
                </Text>
              </Box>
            ) : null}
          </VStack>
        </Box>
      )}
    </Box>
  );
}

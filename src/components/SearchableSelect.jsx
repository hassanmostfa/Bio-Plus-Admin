import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  List,
  ListItem,
  Text,
  Spinner,
  Icon,
  useColorModeValue,
  Flex,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { FaSearch, FaChevronDown } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'contexts/LanguageContext';

const SearchableSelect = ({
  placeholder,
  value,
  onChange,
  options = [],
  isLoading = false,
  onSearch,
  displayKey = 'name',
  valueKey = 'id',
  isRequired = false,
  label,
  searchPlaceholder,
  noOptionsText = 'No options found',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const dropdownRef = useRef(null);
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  const textColor = useColorModeValue('gray.900', 'white');

  // Update display value when value or options change
  useEffect(() => {
    if (value && options.length > 0) {
      const selectedOption = options.find(option => option[valueKey] === value);
      if (selectedOption) {
        // Handle nested display key (like translations.find().name)
        let displayText = selectedOption[displayKey];
        if (displayKey.includes('.')) {
          // Handle nested keys like 'translations.find(t => t.languageId === "en").name'
          if (displayKey === 'translations.name') {
            const translation = selectedOption.translations?.find(t => t.languageId === 'en');
            displayText = translation?.name || selectedOption.name;
          }
        }
        setDisplayValue(displayText || selectedOption.name || '');
      }
    } else {
      setDisplayValue('');
    }
  }, [value, options, displayKey, valueKey]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (onSearch) {
      onSearch(term);
    }
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    onChange(option[valueKey]);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get display text for option
  const getOptionDisplayText = (option) => {
    if (displayKey.includes('.')) {
      if (displayKey === 'translations.name') {
        const translation = option.translations?.find(t => t.languageId === 'en');
        return translation?.name || option.name || '';
      }
    }
    return option[displayKey] || option.name || '';
  };

  return (
    <FormControl isRequired={isRequired}>
      {label && (
        <FormLabel textAlign={currentLanguage === 'ar' ? 'right' : 'left'}>
          {label}
        </FormLabel>
      )}
      <Box position="relative" ref={dropdownRef}>
        <InputGroup>
          <Input
            placeholder={placeholder}
            value={isOpen ? searchTerm : displayValue}
            onChange={handleSearchChange}
            onFocus={() => setIsOpen(true)}
            cursor="pointer"
            readOnly={!isOpen}
            bg={bgColor}
            borderColor={borderColor}
            color={textColor}
            dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
            textAlign={currentLanguage === 'ar' ? 'right' : 'left'}
            {...props}
          />
          <InputLeftElement pointerEvents="none">
            <Icon 
              as={isOpen ? FaSearch : FaChevronDown} 
              color="gray.400" 
              w={4} 
              h={4}
            />
          </InputLeftElement>
        </InputGroup>

        {isOpen && (
          <Box
            position="absolute"
            top="100%"
            left={0}
            right={0}
            zIndex={1000}
            bg={bgColor}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="md"
            boxShadow="lg"
            maxH="200px"
            overflowY="auto"
            mt={1}
          >
            {isLoading ? (
              <Flex justify="center" align="center" p={4}>
                <Spinner size="sm" mr={2} />
                <Text fontSize="sm" color="gray.500">
                  {t('common.loading')}
                </Text>
              </Flex>
            ) : options.length > 0 ? (
              <List>
                {options.map((option) => (
                  <ListItem
                    key={option[valueKey]}
                    p={3}
                    cursor="pointer"
                    _hover={{ bg: hoverBg }}
                    onClick={() => handleOptionSelect(option)}
                    borderBottom="1px solid"
                    borderColor={borderColor}
                    _last={{ borderBottom: 'none' }}
                  >
                    <Text 
                      fontSize="sm" 
                      color={textColor}
                      textAlign={currentLanguage === 'ar' ? 'right' : 'left'}
                    >
                      {getOptionDisplayText(option)}
                    </Text>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box p={4}>
                <Text 
                  fontSize="sm" 
                  color="gray.500" 
                  textAlign="center"
                >
                  {searchTerm ? t('common.noSearchResults') : noOptionsText}
                </Text>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </FormControl>
  );
};

export default SearchableSelect;

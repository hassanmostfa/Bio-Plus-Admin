// Chakra Imports
import {
	Box,
	Flex,
	Link,
	Text,
	useColorModeValue,
  } from '@chakra-ui/react';
  import PropTypes from 'prop-types';
  import React, { useState, useEffect } from 'react';
  import AdminNavbarLinks from 'components/navbar/NavbarLinksAdmin';
  import { removeIdFromRoute } from './RemoveIdFromRoute'; // Import the utility function
  
  export default function AdminNavbar(props) {
	const [scrolled, setScrolled] = useState(false);
  
	useEffect(() => {
	  window.addEventListener('scroll', changeNavbar);
  
	  return () => {
		window.removeEventListener('scroll', changeNavbar);
	  };
	});
  
	const { secondary, message, brandText, routes } = props;
  
	// Remove the ID from the brandText if it exists
	const processedBrandText = removeIdFromRoute(brandText);
  
	// Here are all the props that may change depending on navbar's type or state.(secondary, variant, scrolled)
	let mainText = useColorModeValue('navy.700', 'white');
	let secondaryText = useColorModeValue('gray.700', 'white');
	let navbarPosition = 'fixed';
	let navbarFilter = 'none';
	let navbarBackdrop = 'blur(20px)';
	let navbarShadow = 'none';
	let navbarBg = useColorModeValue('rgba(244, 247, 254, 0.2)', 'rgba(11, 20, 55, 0.5)');
	let navbarBorder = 'transparent';
	let secondaryMargin = '0px';
	let paddingX = '15px';
	let gap = '0px';
  
	const changeNavbar = () => {
	  if (window.scrollY > 1) {
		setScrolled(true);
	  } else {
		setScrolled(false);
	  }
	};
  
	return (
	  <Box
		position={navbarPosition}
		boxShadow={navbarShadow}
		bg={navbarBg}
		borderColor={navbarBorder}
		filter={navbarFilter}
		backdropFilter={navbarBackdrop}
		backgroundPosition="center"
		backgroundSize="cover"
		borderRadius="16px"
		borderWidth="1.5px"
		borderStyle="solid"
		transitionDelay="0s, 0s, 0s, 0s"
		transitionDuration=" 0.25s, 0.25s, 0.25s, 0s"
		transitionProperty="box-shadow, background-color, filter, border"
		transitionTimingFunction="linear, linear, linear, linear"
		alignItems={{ xl: 'center' }}
		display={secondary ? 'block' : 'flex'}
		minH="75px"
		justifyContent={{ xl: 'center' }}
		lineHeight="25.6px"
		mx="auto"
		mt={secondaryMargin}
		pb="8px"
		right={{ base: '12px', md: '30px', lg: '30px', xl: '30px' }}
		px={{
		  sm: paddingX,
		  md: '10px',
		}}
		ps={{
		  xl: '12px',
		}}
		pt="8px"
		top={{ base: '12px', md: '16px', lg: '20px', xl: '20px' }}
		w={{
		  base: 'calc(100vw - 6%)',
		  md: 'calc(100vw - 8%)',
		  lg: 'calc(100vw - 6%)',
		  xl: 'calc(100vw - 350px)',
		  '2xl': 'calc(100vw - 365px)',
		}}
	  >
		<Flex
		  w="100%"
		  flexDirection={{
			sm: 'column',
			md: 'row',
		  }}
		  alignItems={{ xl: 'center' }}
		  mb={gap}
		>
		  <Box mb={{ sm: '8px', md: '0px' }}>
			{/* Display the processed brandText (without ID) */}
			<Link
			  color={mainText}
			  href="#"
			  bg="inherit"
			  borderRadius="inherit"
			  fontWeight="bold"
			  fontSize="34px"
			  _hover={{ color: { mainText } }}
			  _active={{
				bg: 'inherit',
				transform: 'none',
				borderColor: 'transparent',
			  }}
			  _focus={{
				boxShadow: 'none',
			  }}
			>
			  {processedBrandText} {/* Display the processed brandText */}
			  {console.log(processedBrandText)}
			</Link>
		  </Box>
		  <Box ms="auto" w={{ sm: '100%', md: 'unset' }}>
			<AdminNavbarLinks
			  onOpen={props.onOpen}
			  logoText={props.logoText}
			  secondary={props.secondary}
			  fixed={props.fixed}
			  scrolled={scrolled}
			  routes={routes}
			/>
		  </Box>
		</Flex>
		{secondary ? <Text color="white">{message}</Text> : null}
	  </Box>
	);
  }
  
  AdminNavbar.propTypes = {
	brandText: PropTypes.string,
	variant: PropTypes.string,
	secondary: PropTypes.bool,
	fixed: PropTypes.bool,
	onOpen: PropTypes.func,
	routes: PropTypes.array,
  };
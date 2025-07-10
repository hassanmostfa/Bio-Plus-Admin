import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  Image,
} from "@chakra-ui/react";
import DefaultAuth from "layouts/auth/Default";
import illustration from "assets/img/auth/auth.png";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import { useLoginUserMutation } from "api/userSlice";
import Swal from "sweetalert2";
import { useLanguage } from "../../../contexts/LanguageContext";
import Logo from "../../../assets/img/bio-logo.png";
function SignIn() {
  const { currentLanguage, toggleLanguage } = useLanguage();
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const brandStars = useColorModeValue("brand.500", "brand.400");

  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loginUser, { isError, error: apiError }] = useLoginUserMutation();
  const [show, setShow] = useState(false);

  const translations = {
    en: {
      welcome: "Welcome Back!",
      enterDetails: "Please enter your login details",
      email: "Email",
      password: "Password",
      rememberMe: "Remember Me",
      signIn: "Log in",
    },
    ar: {
      welcome: "مرحبًا بعودتك!",
      enterDetails: "أدخل بريدك الإلكتروني وكلمة المرور لتسجيل الدخول!",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      rememberMe: "تذكرني لاحقا",
      signIn: "تسجيل الدخول",
    },
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(formData).unwrap();
      if (response) {
        localStorage.setItem("token", response.data.token);
        navigate("/");
      }
    } catch (err) {
      setError(apiError?.data?.message || "Invalid credentials");
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error,
        confirmButtonText: "OK",
        onClose: () => {
          if (!isError) navigate("/");
        },
      });
    }
  };

  const handleClick = () => setShow(!show);

  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex
        maxW={{ base: "100%", md: "max-content" }}
        w="100%"
        mx={{ base: "auto", lg: "0px" }}
        me="auto"
        h="100%"
        alignItems="start"
        justifyContent="center"
        mb={{ base: "30px", md: "30px" }}
        px={{ base: "25px", md: "0px" }}
        flexDirection="column"
        dir={currentLanguage === "ar" ? "rtl" : "ltr"} // Set direction based on language
      >
        <Box me="auto">
          <Flex mb="40px" justifyContent="center">
            <Image src={Logo} w="150px" />
          </Flex>
          <Flex gap={40}>
          <Heading color={textColor} fontSize="36px" mb="10px">
            {translations[currentLanguage].welcome}
          </Heading>

          <Button
          onClick={toggleLanguage}
          variant='darkBrand'
          color='white'
          fontSize='lg'
          fontWeight='500'
          borderRadius='70px'
          mb="20px">
          {currentLanguage === "en" ? "العربية" : "English"}
        </Button>

          </Flex>
          <Text
            mb="50px"
            ms="4px"
            color={textColorSecondary}
            fontWeight="400"
            fontSize="md"
          >
            {translations[currentLanguage].enterDetails}
          </Text>
        </Box>
        <form onSubmit={handleSubmit}>
          <Flex
            zIndex="2"
            direction="column"
            w={{ base: "100%", md: "420px" }}
            maxW="100%"
            background="transparent"
            borderRadius="15px"
            mx={{ base: "auto", lg: "unset" }}
            me="auto"
            mb={{ base: "20px", md: "auto" }}
          >
            <FormControl>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                mb="8px"
                mt={"30px"}
              >
                {translations[currentLanguage].email}
                <Text color={brandStars}>*</Text>
              </FormLabel>
              <Input
                isRequired={true}
                variant="auth"
                fontSize="sm"
                ms={{ base: "0px", md: "0px" }}
                type="email"
                placeholder="mail@simmmple.com"
                mb="24px"
                fontWeight="500"
                size="lg"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />


              <FormLabel
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                color={textColor}
                display="flex"
              >
                {translations[currentLanguage].password}
                <Text color={brandStars}>*</Text>
              </FormLabel>
              <InputGroup size="md" mb="20px">
                <Input
                  isRequired={true}
                  fontSize="sm"
                  placeholder="Min. 8 characters"
                  mb="24px"
                  size="lg"
                  type={show ? "text" : "password"}
                  variant="auth"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <InputRightElement display="flex" alignItems="center" mt="4px">
                  <Icon
                    color={textColorSecondary}
                    _hover={{ cursor: "pointer" }}
                    as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    onClick={handleClick}
                  />
                </InputRightElement>
              </InputGroup>
              <Flex justifyContent="space-between" align="center" mb="24px">
                <FormControl display="flex" alignItems="center">
                  <Checkbox
                    id="remember-login"
                    colorScheme="brandScheme"
                    me="10px"
                  />
                  <FormLabel
                    htmlFor="remember-login"
                    mb="0"
                    fontWeight="normal"
                    color={textColor}
                    fontSize="sm"
                  >
                    {translations[currentLanguage].rememberMe}
                  </FormLabel>
                </FormControl>
              </Flex>
              <Button
                fontSize="sm"
                variant="brand"
                fontWeight="500"
                w="100%"
                h="50"
                mb="30px"
                type="submit"
              >
                {translations[currentLanguage].signIn}
              </Button>
            </FormControl>
          </Flex>
        </form>
      </Flex>
    </DefaultAuth>
  );
}

export default SignIn;
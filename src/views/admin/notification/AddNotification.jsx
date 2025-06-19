import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Input,
  Textarea,
  Text,
  useColorModeValue,
  Icon,
  useToast,
} from "@chakra-ui/react";
import "./notification.css";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { usePostNotificationMutation } from "api/notificationsSlice";

const AddNotification = () => {
  const [englishTitle, setEnglishTitle] = useState("");
  const [arabicTitle, setArabicTitle] = useState("");
  const [englishDescription, setEnglishDescription] = useState("");
  const [arabicDescription, setArabicDescription] = useState("");
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const cardBg = useColorModeValue('white', 'navy.700');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const navigate = useNavigate();
  const toast = useToast();
  
  const [postNotification] = usePostNotificationMutation();

  const handleCancel = () => {
    setEnglishTitle("");
    setArabicTitle("");
    setEnglishDescription("");
    setArabicDescription("");
    setImage(null);
  };

  const handleSend = async () => {
    // Validate required fields
    if (!englishTitle || !arabicTitle || !englishDescription || !arabicDescription) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const notificationData = {
        title: englishTitle,
        body: englishDescription,
        isActive: true,
        translations: [
          {
            languageId: "ar",
            title: arabicTitle,
            body: arabicDescription,
          },
        ],
      };

      // If you have image handling
      if (image) {
        notificationData.image = image;
      }

      const response = await postNotification(notificationData).unwrap();
      
      toast({
        title: "Success",
        description: "Notification sent successfully",
        status: "success",
        position: "top-right",
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form after successful submission
      handleCancel();
      
      // Optionally navigate away or refresh notifications list
      // navigate('/notifications');
      
    } catch (error) {
      console.error("Failed to send notification:", error);
      toast({
        title: "Error",
        description: error.data?.message || "Failed to send notification",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="container add-admin-container w-100">
      <Box bg={cardBg} className="add-admin-card shadow p-4 w-100" borderRadius="lg">
        <div className="mb-3 d-flex justify-content-between align-items-center">
            <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            mb="20px !important"
            lineHeight="100%"
            >
            Send Notification
            </Text>
            <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
            >
            Back
            </Button>
        </div>
        <form>
          {/* English Title and Arabic Title Fields */}
          <div className="row col-md-12">
            <div className="mb-3 col-md-6">
              <Text color={textColor} fontSize="sm" fontWeight="700">
                English Title
                <span className="text-danger mx-1">*</span>
              </Text> 
              <Input
                type="text"
                id="englishTitle"
                placeholder="Enter English Title"
                value={englishTitle}
                onChange={(e) => setEnglishTitle(e.target.value)}
                required
                mt={"8px"}
                color={textColor}
                bg={inputBg}
              />
            </div>
            <div className="mb-3 col-md-6 pr-0" style={{ paddingRight: "0 !important" }}>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Arabic Title
                <span className="text-danger mx-1">*</span>
              </Text> 
              <Input
                type="text"
                id="arabicTitle"
                placeholder="ادخل عنوان"
                value={arabicTitle}
                onChange={(e) => setArabicTitle(e.target.value)}
                dir="rtl"
                required
                mt={"8px"}
                color={textColor}
                bg={inputBg}
              />
            </div>
          </div>

          {/* English Description and Arabic Description Fields */}
          <div className="row col-md-12">
            <div className="mb-3 col-md-12">
              <Text color={textColor} fontSize="sm" fontWeight="700">
                English Description
                <span className="text-danger mx-1">*</span>
              </Text> 
              <Textarea
                id="englishDescription"
                placeholder="Enter English Description"
                value={englishDescription}
                onChange={(e) => setEnglishDescription(e.target.value)}
                required
                rows={4}
                mt={"8px"}
                color={textColor}
                bg={inputBg}
              />
            </div>
            <div className="mb-3 col-md-12 pr-0">
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Arabic Description
                <span className="text-danger mx-1">*</span>
              </Text> 
              <Textarea
                id="arabicDescription"
                placeholder="ادخل الوصف"
                value={arabicDescription}
                onChange={(e) => setArabicDescription(e.target.value)}
                dir="rtl"
                required
                rows={4}
                mt={"8px"}
                color={textColor}
                bg={inputBg}
              />
            </div>
          </div>

          {/* Image Upload (if needed) */}
          {/* <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Notification Image
            </Text>
            <Input
              type="file"
              id="image"
              onChange={(e) => setImage(e.target.files[0])}
              mt={"8px"}
            />
          </div> */}

          {/* Action Buttons */}
          <Flex justify="center" mt={4}>
            <Button 
              variant="outline" 
              colorScheme="red" 
              onClick={handleCancel} 
              mr={2}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant='darkBrand' 
              color='white' 
              fontSize='sm' 
              fontWeight='500' 
              borderRadius='70px' 
              px='24px' 
              py='5px' 
              onClick={handleSend}
              isLoading={isLoading}
              loadingText="Sending..."
            >
              Send
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
};

export default AddNotification;
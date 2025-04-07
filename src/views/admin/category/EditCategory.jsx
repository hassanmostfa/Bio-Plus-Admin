import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { FaUpload } from "react-icons/fa6";
import { IoMdArrowBack, IoIosArrowDown } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { useGetCategoriesQuery, useUpdateCategoryMutation } from "api/categorySlice";
import Swal from "sweetalert2";

const EditCategory = () => {
  const { id } = useParams(); // Get the category ID from the URL
  const { data: categoriesResponse } = useGetCategoriesQuery(); // Fetch all categories
  const [updateCategory, { isLoading }] = useUpdateCategoryMutation(); // Mutation hook for updating a category
  const navigate = useNavigate();

  // State for form fields
  const [enName, setEnName] = useState("");
  const [arName, setArName] = useState("");
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCategoryType, setSelectedCategoryType] = useState("Select Category Type");

  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

     const textColor = useColorModeValue('secondaryGray.900', 'white');
      const cardBg = useColorModeValue('white', 'navy.700');
      const inputBg = useColorModeValue('gray.100', 'gray.700');

  // Find the category to edit based on the ID
  const categoryToEdit = categoriesResponse?.data?.data.find(
    (category) => category.id === id
  );

  // Populate the form with the existing data when the component mounts
  useEffect(() => {
    if (categoryToEdit) {
      setEnName(categoryToEdit.translations.find((t) => t.languageId === "en")?.name || "");
      setArName(categoryToEdit.translations.find((t) => t.languageId === "ar")?.name || "");
      setSelectedCategoryType(categoryToEdit.categoryType || "Select Category Type");
      // Set the image if it exists (you may need to fetch the image URL from the API)
    }
  }, [categoryToEdit]);

  // Handle image upload
  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      setImage(files[0]);
    }
  };

  // Handle drag-and-drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const files = e.target.files;
    handleImageUpload(files);
  };

  // Handle cancel action
  const handleCancel = () => {
    navigate("/admin/categories"); // Navigate back to the categories list
  };

  // Handle category type selection
  const handleSelectCategoryType = (type) => {
    setSelectedCategoryType(type);
  };

  // Handle form submission
  const handleSend = async () => {
    if (!enName || !arName || !selectedCategoryType) {
      Swal.fire("Error!", "Please fill all required fields.", "error");
      return;
    }

    const payload = {
    
      image: image ? await convertImageToBase64(image) : categoryToEdit.image, // Use existing image if no new image is uploaded
      translations: [
        { languageId: "en", name: enName },
        { languageId: "ar", name: arName },
      ],
      // categoryType: selectedCategoryType,
    };

    try {
      const response = await updateCategory({ id, category: payload }).unwrap(); // Send data to the API
      Swal.fire("Success!", "Category updated successfully.", "success");
      navigate("/admin/categories"); // Redirect to the categories page
    } catch (error) {
      console.error("Failed to update category:", error);
      Swal.fire("Error!", "Failed to update category.", "error");
    }
  };

  // Convert image file to base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="container add-admin-container w-100">
      <Box bg={cardBg} className="add-admin-card shadow p-4 w-100">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            mb="20px !important"
            lineHeight="100%"
          >
            Edit Category
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
          {/* English Name Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Category En-Name
              <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="text"
              id="en_name"
              placeholder="Enter Category En-Name"
              value={enName}
              onChange={(e) => setEnName(e.target.value)}
              required
              mt={"8px"}
              bg={inputBg}
            />
          </div>

          {/* Arabic Name Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Category Ar-Name
              <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="text"
              id="ar_name"
              placeholder="Enter Category Ar-Name"
              value={arName}
              onChange={(e) => setArName(e.target.value)}
              required
              mt={"8px"}
              bg={inputBg}
            />
          </div>

          {/* Category Type Dropdown */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Category Type
              <span className="text-danger mx-1">*</span>
            </Text>
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<IoIosArrowDown />}
                width="100%"
                bg={inputBg}
                border="1px solid #ddd"
                borderRadius="md"
                _hover={{ bg: "gray.200" }}
                textAlign="left"
                fontSize={"sm"}
              >
                {selectedCategoryType}
              </MenuButton>
              <MenuList width="100%">
                <MenuItem
                  _hover={{ bg: "#38487c", color: "white" }}
                  onClick={() => handleSelectCategoryType("Type A")}
                >
                  Type A
                </MenuItem>
                <MenuItem
                  _hover={{ bg: "#38487c", color: "white" }}
                  onClick={() => handleSelectCategoryType("Type B")}
                >
                  Type B
                </MenuItem>
                <MenuItem
                  _hover={{ bg: "#38487c", color: "white" }}
                  onClick={() => handleSelectCategoryType("Type C")}
                >
                  Type C
                </MenuItem>
              </MenuList>
            </Menu>
          </div>

          {/* Drag-and-Drop Upload Section */}
          <Box
            border="1px dashed"
            borderColor="gray.300"
            borderRadius="md"
            p={4}
            textAlign="center"
            backgroundColor="gray.100"
            cursor="pointer"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            mb={4}
            bg={inputBg}
          >
            <Icon as={FaUpload} w={8} h={8} color="#422afb" mb={2} />
            <Text color="gray.500" mb={2}>
              Drag & Drop Image Here
            </Text>
            <Text color="gray.500" mb={2}>
              or
            </Text>
            <Button
              variant="outline"
              color="#422afb"
              border="none"
              onClick={() => document.getElementById("fileInput").click()}
            >
              Upload Image
              <input
                type="file"
                id="fileInput"
                hidden
                accept="image/*"
                onChange={handleFileInputChange}
              />
            </Button>
            {image ? (
              <Box
                mt={4}
                display={"flex"}
                justifyContent="center"
                alignItems="center"
              >
                <img
                  src={URL.createObjectURL(image)}
                  alt={image.name}
                  width={80}
                  height={80}
                  borderRadius="md"
                />
              </Box>
            ) : categoryToEdit?.image ? (
              <Box
                mt={4}
                display={"flex"}
                justifyContent="center"
                alignItems="center"
              >
                <img
                  src={categoryToEdit.image}
                  alt="Category Image"
                  width={80}
                  height={80}
                  borderRadius="md"
                />
              </Box>
            ) : null}
          </Box>

          {/* Action Buttons */}
          <Flex justify="center" mt={4}>
            <Button variant="outline" colorScheme="red" onClick={handleCancel} mr={2}>
              Cancel
            </Button>
            <Button
              variant="darkBrand"
              color="white"
              fontSize="sm"
              fontWeight="500"
              borderRadius="70px"
              px="24px"
              py="5px"
              onClick={handleSend}
              isLoading={isLoading}
            >
              Save Changes
            </Button>
          </Flex>
        </form>
      </Box>
    </div>
  );
};

export default EditCategory;
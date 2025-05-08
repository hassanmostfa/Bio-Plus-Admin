import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { useGetTypeQuery, useUpdateTypeMutation } from "api/typeSlice";
import Swal from "sweetalert2";

const EditType = () => {
  const { id } = useParams(); // Get the product type ID from the URL
  const { data: typeResponse, isLoading: isFetching, isError: fetchError , refetch } = useGetTypeQuery(id); // Fetch the product type data
  const [updateType, { isLoading: isUpdating }] = useUpdateTypeMutation(); // Mutation hook for updating a product type
  const navigate = useNavigate();

  // State for form fields
  const [enName, setEnName] = useState("");
  const [arName, setArName] = useState("");

  const textColor = useColorModeValue("secondaryGray.900", "white");

  // Populate the form with the existing data when the component mounts
  useEffect(() => {
    if (typeResponse?.data) {
      setEnName(typeResponse.data.name); // Set the English name
      setArName(typeResponse.data.translations.find((t) => t.languageId === "ar")?.name || ""); // Set the Arabic name
    }
  }, [typeResponse]);


     // Trigger refetch when component mounts (navigates to)
     React.useEffect(() => {
      // Only trigger refetch if the data is not being loaded
      if (!isFetching) {
        refetch(); // Manually trigger refetch when component is mounted
      }
    }, [refetch, isFetching]); // Dependency array to ensure it only runs on mount

  // Handle form submission
  const handleSend = async () => {
    if (!enName || !arName) {
      Swal.fire("Error!", "Please fill all required fields.", "error");
      return;
    }

    const payload = {
     
      name: enName, // Updated English name
      isActive: true, // Default to true
      translations: [
        { languageId: "ar", name: arName }, // Updated Arabic translation
      ],
    };

    try {
      const response = await updateType({id, type: payload}).unwrap(); // Send data to the API
      Swal.fire("Success!", "Product type updated successfully.", "success");
      navigate("/admin/product-types"); // Redirect to the product types page
    } catch (error) {
      console.error("Failed to update product type:", error);
      Swal.fire("Error!", "Failed to update product type.", "error");
    }
  };

  if (isFetching) return <Text>Loading...</Text>;
  if (fetchError) return <Text>Error loading product type data.</Text>;

  return (
    <div className="container add-admin-container w-100">
      <div className="add-admin-card shadow p-4 bg-white w-100">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            mb="20px !important"
            lineHeight="100%"
          >
            Edit Product Type
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
              Product En-Type
              <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="text"
              id="en_name"
              placeholder="Enter Product En-Type"
              value={enName}
              onChange={(e) => setEnName(e.target.value)}
              required
              mt={"8px"}
            />
          </div>

          {/* Arabic Name Field */}
          <div className="mb-3">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Product Ar-Type
              <span className="text-danger mx-1">*</span>
            </Text>
            <Input
              type="text"
              id="ar_name"
              placeholder="Enter Product Ar-Type"
              value={arName}
              onChange={(e) => setArName(e.target.value)}
              required
              mt={"8px"}
            />
          </div>

          {/* Action Buttons */}
          <Flex justify="start" mt={4}>
            <Button
              variant="darkBrand"
              color="white"
              fontSize="sm"
              fontWeight="500"
              borderRadius="70px"
              px="24px"
              py="5px"
              onClick={handleSend}
              isLoading={isUpdating}
            >
              Save Changes
            </Button>
          </Flex>
        </form>
      </div>
    </div>
  );
};

export default EditType;
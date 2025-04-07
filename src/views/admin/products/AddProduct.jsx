import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
  Icon,
  Select,
  Textarea,
  Switch,
  SimpleGrid,
  Radio,
  RadioGroup,
  Stack,
  Card,
  CardHeader,
  CardBody,
  IconButton,
} from "@chakra-ui/react";
import { FaUpload, FaTrash } from "react-icons/fa6";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useGetVarientsQuery } from 'api/varientSlice';
import { useGetCategoriesQuery } from 'api/categorySlice';
import { useGetBrandsQuery } from 'api/brandSlice';

const AddProduct = () => {
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [cost, setCost] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [hasVariants, setHasVariants] = useState(false);
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [offerType, setOfferType] = useState("");
  const [percentage, setPercentage] = useState("");
  const [selectedAttributes, setSelectedAttributes] = useState([]); // Array to store selected attributes with their data
  const [page, setPage] = useState(1); // Current page
  const [limit, setLimit] = useState(1000); // Items per page

  // Fetch categories from the API
  const { data: categoriesResponse } = useGetCategoriesQuery({ page, limit });
  const categories = categoriesResponse?.data?.data || [];

  // Fetch variants from the API
  const { data: variantsResponse } = useGetVarientsQuery({ page: 1, limit: 1000 });
  const variants = variantsResponse?.data || []; // Extract the `data` array from the response

  // Fetch brands from the API
  const { data: brandsResponse } = useGetBrandsQuery({ page: 1, limit: 1000 });
  const brands = brandsResponse?.data || [];

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const navigate = useNavigate();

  // Handle image upload
  const handleImageUpload = (files) => {
    if (files && files.length > 0) {
      setImages([...images, ...files]);
    }
  };

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

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    handleImageUpload(files);
  };

  // Handle variant selection
  const handleVariantSelect = (e) => {
    const selectedVariantId = e.target.value;
    const selectedVariant = variants.find(variant => variant.id === selectedVariantId);

    if (selectedVariant) {
      // Add the selected variant's attributes to the list with initial data
      const newAttributes = selectedVariant.attributes.map(attr => ({
        ...attr,
        cost: "",
        price: "",
        quantity: "",
        image: null,
      }));
      setSelectedAttributes([...selectedAttributes, ...newAttributes]);
    }
  };

  // Handle input changes for cost, price, quantity, and image
  const handleAttributeChange = (attributeId, field, value) => {
    const updatedAttributes = selectedAttributes.map(attr =>
      attr.id === attributeId ? { ...attr, [field]: value } : attr
    );
    setSelectedAttributes(updatedAttributes);
  };

  // Handle deleting an attribute card
  const handleDeleteAttribute = (attributeId) => {
    setSelectedAttributes(selectedAttributes.filter(attr => attr.id !== attributeId));
  };

  // Handle form submission
  const handleSend = () => {
    const productData = {
      nameAr,
      nameEn,
      descriptionAr,
      descriptionEn,
      category,
      brand,
      cost,
      price,
      quantity,
      hasVariants,
      attributes: hasVariants ? selectedAttributes : [], // Include selected attributes
      images,
      offerType,
      percentage: offerType === "Monthly offers" ? percentage : "",
    };
    console.log("Product Data:", productData);
    // You can send this data to an API or perform other actions
  };

  // Handle radio button change
  const handleRadioChange = (value) => {
    setOfferType(value);
    if (value !== "Monthly offers") {
      setPercentage("");
    }
  };

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
            Add New Product
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
          {/* Product Name (Arabic and English) */}
          <SimpleGrid columns={2} spacing={4} mb={4}>
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Product Name (Arabic) <span className="text-danger">*</span>
              </Text>
              <Input
                type="text"
                placeholder="أدخل اسم المنتج"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                required
                mt={2}
              />
            </Box>
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Product Name (English) <span className="text-danger">*</span>
              </Text>
              <Input
                type="text"
                placeholder="Enter Product Name"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                required
                mt={2}
              />
            </Box>
          </SimpleGrid>

          {/* Description (Arabic and English) */}
          <SimpleGrid columns={2} spacing={4} mb={4}>
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Description (Arabic) <span className="text-danger">*</span>
              </Text>
              <Textarea
                placeholder="أدخل وصف المنتج"
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                required
                mt={2}
              />
            </Box>
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Description (English) <span className="text-danger">*</span>
              </Text>
              <Textarea
                placeholder="Enter Product Description"
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                required
                mt={2}
              />
            </Box>
          </SimpleGrid>

          {/* Category and Brand */}
          <SimpleGrid columns={2} spacing={4} mb={4}>
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Category <span className="text-danger">*</span>
              </Text>
              <Select
                placeholder="Select Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                mt={2}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.translations.find((t) => t.languageId === "en").name}
                  </option>
                ))}
              </Select>
            </Box>
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Brand <span className="text-danger">*</span>
              </Text>
              <Select
                placeholder="Select Brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
                mt={2}
              >
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </Select>
            </Box>
          </SimpleGrid>

          {/* Cost, Price, and Quantity */}
          <SimpleGrid columns={3} spacing={4} mb={4}>
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Cost <span className="text-danger">*</span>
              </Text>
              <Input
                type="number"
                placeholder="Enter Cost"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
                mt={2}
              />
            </Box>
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Price <span className="text-danger">*</span>
              </Text>
              <Input
                type="number"
                placeholder="Enter Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                mt={2}
              />
            </Box>
            <Box>
              <Text color={textColor} fontSize="sm" fontWeight="700">
                Quantity <span className="text-danger">*</span>
              </Text>
              <Input
                type="number"
                placeholder="Enter Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                mt={2}
              />
            </Box>
          </SimpleGrid>

          {/* Radio Buttons for Offer Type */}
          <Box mb={4}>
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Offer Type
            </Text>
            <RadioGroup value={offerType} onChange={handleRadioChange}>
              <Stack direction="row">
                <Radio value="Monthly offers">Monthly offers</Radio>
                <Radio value="New arrivals">New arrivals</Radio>
              </Stack>
            </RadioGroup>
            {offerType === "Monthly offers" && (
              <Box mt={2}>
                <Text color={textColor} fontSize="sm" fontWeight="700">
                  Percentage <span className="text-danger">*</span>
                </Text>
                <Input
                  type="number"
                  placeholder="Enter Percentage"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  required
                  mt={2}
                />
              </Box>
            )}
          </Box>

          {/* Variants Section */}
          <Box mb={4}>
            <Flex align="center" mb={2}>
              <Text color={textColor} fontSize="sm" fontWeight="700" mr={2}>
                Has Variants
              </Text>
              <Switch
                isChecked={hasVariants}
                onChange={() => setHasVariants(!hasVariants)}
              />
            </Flex>
            {hasVariants && (
              <Box>
                <Select
                  placeholder="Select Variant"
                  onChange={handleVariantSelect}
                  mb={4}
                >
                  {variants.map(variant => (
                    <option key={variant.id} value={variant.id}>
                      {variant.name}
                    </option>
                  ))}
                </Select>

                {/* Display selected attributes as cards */}
                <SimpleGrid columns={2} spacing={4}>
                  {selectedAttributes.map(attribute => (
                    <Card key={attribute.id}>
                      <CardHeader>
                        <Flex justify="space-between" align="center">
                          <Text fontSize="lg" fontWeight="bold">
                            {attribute.value}
                          </Text>
                          <IconButton
                            icon={<FaTrash />}
                            aria-label="Delete Attribute"
                            colorScheme="red"
                            size="sm"
                            onClick={() => handleDeleteAttribute(attribute.id)}
                          />
                        </Flex>
                      </CardHeader>
                      <CardBody>
                        <Flex gap={2}>
                          {/* Cost Input */}
                          <Box mb={2}>
                            <Text color={textColor} fontSize="sm" fontWeight="700">
                              Cost <span className="text-danger">*</span>
                            </Text>
                            <Input
                              type="number"
                              placeholder="Enter Cost"
                              value={attribute.cost}
                              onChange={(e) =>
                                handleAttributeChange(attribute.id, "cost", e.target.value)
                              }
                              required
                              mt={2}
                            />
                          </Box>

                          {/* Price Input */}
                          <Box mb={2}>
                            <Text color={textColor} fontSize="sm" fontWeight="700">
                              Price <span className="text-danger">*</span>
                            </Text>
                            <Input
                              type="number"
                              placeholder="Enter Price"
                              value={attribute.price}
                              onChange={(e) =>
                                handleAttributeChange(attribute.id, "price", e.target.value)
                              }
                              required
                              mt={2}
                            />
                          </Box>

                          {/* Quantity Input */}
                          <Box mb={2}>
                            <Text color={textColor} fontSize="sm" fontWeight="700">
                              Quantity <span className="text-danger">*</span>
                            </Text>
                            <Input
                              type="number"
                              placeholder="Enter Quantity"
                              value={attribute.quantity}
                              onChange={(e) =>
                                handleAttributeChange(attribute.id, "quantity", e.target.value)
                              }
                              required
                              mt={2}
                            />
                          </Box>
                        </Flex>

                        {/* Image Upload */}
                        <Box mb={2}>
                          <Text color={textColor} fontSize="sm" fontWeight="700">
                            Image <span className="text-danger">*</span>
                          </Text>
                          <Input
                            className="form-control"
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleAttributeChange(attribute.id, "image", e.target.files[0])
                            }
                            mt={2}
                          />
                        </Box>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </Box>
            )}
          </Box>

          {/* Product Images */}
          <Box mb={4}>
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Product Images <span className="text-danger">*</span>
            </Text>
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
            >
              <Icon as={FaUpload} w={8} h={8} color="#422afb" mb={2} />
              <Text color="gray.500" mb={2}>
                Drag & Drop Images Here
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
                Upload Images
                <input
                  type="file"
                  id="fileInput"
                  hidden
                  accept="image/*"
                  onChange={handleFileInputChange}
                  multiple
                />
              </Button>

              {images?.length > 0 && (
                <Box mt={4} display="flex" flexWrap="wrap" gap={2}>
                  {images.map((image, index) => (
                    <Box key={index} borderRadius="md" overflow="hidden">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Product View ${index + 1}`}
                        width={80}
                        height={80}
                        style={{ borderRadius: "8px" }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          {/* Action Buttons */}
          <Flex justify="center" mt={4}>
            <Button variant="outline" colorScheme="red" mr={2}>
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
            >
              Save
            </Button>
          </Flex>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
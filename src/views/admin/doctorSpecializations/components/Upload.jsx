import React from "react";
import { Box, Text, useColorModeValue } from "@chakra-ui/react";

const Upload = ({ onFileUpload, ...rest }) => {
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileUpload(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <Box
      border="2px dashed"
      borderColor={borderColor}
      borderRadius="12px"
      p="20px"
      textAlign="center"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      {...rest}
    >
      <Text color={textColor} fontSize="14px" fontWeight="500">
        Drag & Drop Image Here
      </Text>
      <Text color="gray.400" fontSize="12px" mt="8px">
        or click to upload
      </Text>
    </Box>
  );
};

export default Upload;
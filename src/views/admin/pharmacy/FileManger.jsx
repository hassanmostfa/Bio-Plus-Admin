import {
  Box,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  IconButton,
  Button,
} from '@chakra-ui/react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDownload } from 'react-icons/fa';
import Card from 'components/card/Card';

const FileManger = () => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Default data with File Name and File URL
  const fileData = [
    {
      fileName: 'Document 1',
      fileUrl: 'https://example.com/file1.pdf',
    },
    {
      fileName: 'Document 2',
      fileUrl: 'https://example.com/file2.pdf',
    },
    {
      fileName: 'Document 3',
      fileUrl: 'https://example.com/file3.pdf',
    },
    {
      fileName: 'Document 4',
      fileUrl: 'https://example.com/file4.pdf',
    },
  ];

  // Function to handle file download
  const handleDownload = (url) => {
    window.open(url, '_blank'); // Opens the file in a new tab
  };

  const navigate = useNavigate();

  return (
    <div className="container">
      <Card
        flexDirection="column"
        w="100%"
        px="0px"
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
      >
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            lineHeight="100%"
          >
            File Manager
          </Text>

           <Button
                      variant="darkBrand"
                      color="white"
                      fontSize="sm"
                      fontWeight="500"
                      borderRadius="70px"
                      px="24px"
                      py="5px"
                      onClick={() => navigate('/admin/pharmacy/add-file')}
                      width={'200px'}
                    >
                      Add File
                    </Button>
        </Flex>
        <Box>
          <Table variant="simple" color="gray.500" mb="24px" mt="12px">
            <Thead>
              <Tr>
                <Th borderColor={borderColor}>
                  <Text color="gray.400" fontSize="12px">File Name</Text>
                </Th>
                <Th borderColor={borderColor}>
                  <Text color="gray.400" fontSize="12px">File URL</Text>
                </Th>
                <Th borderColor={borderColor}>
                  <Text color="gray.400" fontSize="12px">Actions</Text>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {fileData.map((file, index) => (
                <Tr key={index}>
                  <Td borderColor="transparent" fontSize="14px">{file.fileName}</Td>
                  <Td borderColor="transparent" fontSize="14px">
                    <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                      {file.fileUrl}
                    </a>
                  </Td>
                  <Td borderColor="transparent" fontSize="14px">
                    <IconButton
                      aria-label="Download"
                      icon={<FaDownload />}
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => handleDownload(file.fileUrl)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>
    </div>
  );
};

export default FileManger;

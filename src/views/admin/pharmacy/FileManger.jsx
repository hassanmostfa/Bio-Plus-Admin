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
import { useNavigate, useParams } from 'react-router-dom';
import { FaDownload } from 'react-icons/fa';
import Card from 'components/card/Card';
import { useGetPharmacyFilesQuery } from 'api/pharmacyFiles';
import { FaFilePen, FaPen, FaTrash } from 'react-icons/fa6';
import { useDeletePharmacyFileMutation } from 'api/pharmacyFiles';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../contexts/LanguageContext';

const FileManger = () => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const {pharmacyId} = useParams();
  console.log(pharmacyId);
  const [deleteFile] = useDeletePharmacyFileMutation();
  const {data:files,refetch,isLoading} = useGetPharmacyFilesQuery({id:pharmacyId,page:1,limit:10});
  React.useEffect(() => {
    refetch();
  }
  , []);
    console.log(files);
  // Default data with File Name and File URL
   const [fileData, setFileData] = React.useState([]);

   React.useEffect(() => {
     const updatedFileData = files?.data?.map((file) => ({
       id: file.id,
       fileName: file.name,
       fileUrl: file.fileKey,
     })) || [];
     setFileData(updatedFileData);
   }, [files]);
 

  // Function to handle file download
  const handleDownload = (url) => {
    window.open(url, '_blank'); // Opens the file in a new tab
  };

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const handleDelete = (fileId) => {
    Swal.fire({
      title: t('files.confirmDelete'),
      text: t('files.deleteWarning'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('files.delete'),
    }).then((result) => {
      if (result.isConfirmed) {
          deleteFile({id:pharmacyId, fileId:fileId})
          .unwrap()
          .then(() => {
            Swal.fire(t('files.deleteSuccess'), '', 'success');
            refetch();
          })
          .catch((error) => {
            Swal.fire(t('files.deleteError'), '', 'error');
            console.error(error);
          });
      }
    });
  };

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
            {t('files.title')}
          </Text>
          <Button
            variant='darkBrand'
            color='white'
            fontSize='sm'
            fontWeight='500'
            borderRadius='70px'
            px='24px'
            py='5px'
            onClick={() => navigate(`/admin/pharmacy/${pharmacyId}/add/file`)}
            width={'200px'}
          >
            {t('files.addFile')}
          </Button>
        </Flex>
        <Box>
          <Table variant="simple" color="gray.500" mb="24px" mt="12px">
            <Thead>
              <Tr>
                <Th borderColor={borderColor}>
                  <Text color="gray.400" fontSize="12px">{t('files.fileName')}</Text>
                </Th>
                <Th borderColor={borderColor}>
                  <Text color="gray.400" fontSize="12px">{t('files.fileUrl')}</Text>
                </Th>
                <Th borderColor={borderColor}>
                  <Text color="gray.400" fontSize="12px">{t('files.actions')}</Text>
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
                  <Td borderColor="transparent" fontSize="14px" display="flex" flexWrap={'nowrap'} alignItems="center" gap={2}>
                    <IconButton
                      aria-label="Download"
                      icon={<FaDownload />}
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => handleDownload(file.fileUrl)}
                    />
                    <IconButton
                      aria-label="Update"
                      icon={<FaFilePen />}
                      colorScheme="yellow"
                      variant="outline"
                      onClick={() => navigate(`/admin/pharmacy/${pharmacyId}/edit-file/${file.id}`)}
                     
                    />
                    <IconButton
                      aria-label="Delete"
                      icon={<FaTrash />}
                      colorScheme="red"
                      variant="outline"
                      onClick={() => handleDelete(file.id)}
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

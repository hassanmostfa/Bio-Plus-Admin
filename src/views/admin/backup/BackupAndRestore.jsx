import {
  Box,
  Button,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Checkbox,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { SearchIcon, DownloadIcon } from '@chakra-ui/icons';
import { FaCloudUploadAlt as UploadIcon } from "react-icons/fa";

import * as React from 'react';
import Card from 'components/card/Card';
import Swal from 'sweetalert2';
import { useGetBackupsQuery } from 'api/backupSlice';
import { useDownloadBackupMutation } from 'api/backupSlice';
import { useCreateBackupMutation } from 'api/backupSlice';
import { useRestoreBackupMutation } from 'api/backupSlice';
import { useCreateCustomBackupMutation } from 'api/backupSlice';
import { useTranslation } from "react-i18next";
import { useLanguage } from "contexts/LanguageContext";

const STATIC_MODULES = [
  "USER_MANAGEMENT",
  "PHARMACY",
  "PRODUCT",
  "ORDER",
  "DOCTOR", 
  "APPOINTMENT",
  "MEDICINE",
  "CMS",
  "ADMINISTRATION"
];

const BackupAndRestore = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [activeTab, setActiveTab] = React.useState(0);
  const [selectedModules, setSelectedModules] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const toast = useToast();
  
  const { data, isLoading, error } = useGetBackupsQuery();
  const [downloadBackup, { isLoading: isDownloading }] = useDownloadBackupMutation();
  const [createBackup, { isLoading: isCreating }] = useCreateBackupMutation();
  const [createCustomBackup, { isLoading: isCreatingCustom }] = useCreateCustomBackupMutation();
  const [restoreBackup, { isLoading: isRestoring }] = useRestoreBackupMutation();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Filter modules based on search input
  const filteredModules = React.useMemo(() => {
    if (!globalFilter) return STATIC_MODULES;
    return STATIC_MODULES.filter(module => 
      module.toLowerCase().includes(globalFilter.toLowerCase())
    );
  }, [globalFilter]);

  // Handle module selection for customized backup
  const toggleModuleSelection = (moduleName) => {
    setSelectedModules(prev => 
      prev.includes(moduleName) 
        ? prev.filter(name => name !== moduleName) 
        : [...prev, moduleName]
    );
  };

  // Handle backup action
  const handleBackup = async (isFullBackup = false) => {
    const modulesToBackup = isFullBackup 
      ? STATIC_MODULES 
      : selectedModules;
    
    if (!isFullBackup && modulesToBackup.length === 0) {
      toast({
        title: t('backup.noModulesSelected'),
        description: t('backup.selectAtLeastOneModule'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      let backupResult;
      
      if (isFullBackup) {
        // Full backup
        backupResult = await createBackup().unwrap();
      } else {
        // Custom backup
        backupResult = await createCustomBackup({ groups: modulesToBackup }).unwrap();
      }
      
      if (!backupResult?.data?.id) {
        throw new Error('Backup creation failed - no ID returned');
      }

      toast({
        title: t('backup.backupCreated'),
        description: t('backup.startingDownload'),
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      // Download backup using the ID
      const downloadResult = await downloadBackup(backupResult.data.id).unwrap();
      
      // Create a blob from the SQL text response
      const blob = new Blob([downloadResult], { type: 'application/sql' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backupResult.data.filename || `backup-${new Date().toISOString()}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: t('backup.backupCompleted'),
        description: t('backup.backupFileDownloaded'),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: t('backup.backupFailed'),
        description: error.message || t('backup.errorDuringBackup'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle restore action
  const handleRestore = async (isFullRestore = false) => {
    const modulesToRestore = isFullRestore 
      ? STATIC_MODULES 
      : selectedModules;
    
    if (!isFullRestore && modulesToRestore.length === 0) {
      toast({
        title: t('backup.noModulesSelected'),
        description: t('backup.selectAtLeastOneModuleRestore'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Create a file input for restore
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.sql';
    
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const result = await Swal.fire({
          title: t('backup.confirmRestore'),
          text: t('backup.restoreConfirmationText', { 
            type: isFullRestore ? t('backup.all') : t('backup.selected'),
            fileName: file.name 
          }),
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: t('backup.proceed'),
          cancelButtonText: t('common.cancel'),
        });

        if (result.isConfirmed) {
          // Create FormData and append the file
          const formData = new FormData();
          formData.append('backupFile', file);

          toast({
            title: t('backup.restoreInitiated'),
            description: t('backup.restoringDataForModules', { count: modulesToRestore.length }),
            status: 'info',
            duration: 3000,
            isClosable: true,
          });

          // Call the restore API
          await restoreBackup(formData).unwrap();

          toast({
            title: t('backup.restoreCompleted'),
            description: t('backup.dataSuccessfullyRestored'),
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        toast({
          title: t('backup.restoreFailed'),
          description: error.message || t('backup.errorDuringRestore'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    
    fileInput.click();
  };

  return (
    <Box className="container">
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
            {t('backup.title')}
          </Text>
        </Flex>

        <Tabs variant="soft-rounded" my="20px" colorScheme="brand" onChange={(index) => setActiveTab(index)}>
          <TabList px="25px">
            <Tab>{t('backup.fullBackup')}</Tab>
            <Tab>{t('backup.customizedBackup')}</Tab>
          </TabList>

          <Flex px="25px" my="20px" justifyContent="space-between" align="center">
            <InputGroup maxW="400px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                borderRadius={"20px"}
                placeholder={t('backup.searchModules')}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </InputGroup>

            {activeTab === 0 ? (
              <Flex gap="10px">
                <Button 
                  leftIcon={<DownloadIcon />} 
                  colorScheme="blue"
                  onClick={() => handleBackup(true)}
                >
                  {t('backup.backupAll')}
                </Button>
                <Button 
                  leftIcon={<UploadIcon />} 
                  colorScheme="green"
                  onClick={() => handleRestore(true)}
                >
                  {t('backup.restoreAll')}
                </Button>
              </Flex>
            ) : (
              <Flex gap="10px">
                <Button 
                  leftIcon={<DownloadIcon />} 
                  colorScheme="blue"
                  onClick={() => handleBackup(false)}
                >
                  {t('backup.backupSelected')}
                </Button>
                <Button 
                  leftIcon={<UploadIcon />} 
                  colorScheme="green"
                  onClick={() => handleRestore(false)}
                >
                  {t('backup.restoreSelected')}
                </Button>
              </Flex>
            )}
          </Flex>

          <TabPanels>
            {/* Full Backup Tab */}
            <TabPanel>
              <Table variant="simple" color="gray.500" mb="24px" mt="12px">
                <Thead>
                  <Tr>
                    <Th borderColor={borderColor}>
                      <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
                        {t('backup.moduleName')}
                      </Text>
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredModules.map((module) => (
                    <Tr key={module}>
                      <Td borderColor="transparent">
                        <Text color={textColor} fontSize="sm" fontWeight="bold">
                          {module}
                        </Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TabPanel>

            {/* Customized Backup Tab */}
            <TabPanel>
              <Table variant="simple" color="gray.500" mb="24px" mt="12px">
                <Thead>
                  <Tr>
                    <Th borderColor={borderColor} width="50px">
                      <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
                        {t('backup.select')}
                      </Text>
                    </Th>
                    <Th borderColor={borderColor}>
                      <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
                        {t('backup.moduleName')}
                      </Text>
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredModules.map((module) => (
                    <Tr key={module}>
                      <Td borderColor="transparent">
                        <Checkbox
                          isChecked={selectedModules.includes(module)}
                          onChange={() => toggleModuleSelection(module)}
                          colorScheme="brand"
                        />
                      </Td>
                      <Td borderColor="transparent">
                        <Text color={textColor} fontSize="sm" fontWeight="bold">
                          {module}
                        </Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </Box>
  );
};

export default BackupAndRestore;
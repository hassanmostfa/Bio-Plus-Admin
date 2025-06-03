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
import { useGetModulesQuery } from 'api/roleSlice';
import { useGetBackupsQuery } from 'api/backupSlice';
import { useDownloadBackupMutation } from 'api/backupSlice';
import { useCreateBackupMutation } from 'api/backupSlice';
import { useRestoreBackupMutation } from 'api/backupSlice';

const BackupAndRestore = () => {
  const [activeTab, setActiveTab] = React.useState(0);
  const [selectedModules, setSelectedModules] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const toast = useToast();
  const { data: modulesData, isLoading: isModulesLoading, isError: isModulesError } = useGetModulesQuery();
  
  const { data, isLoading, error } = useGetBackupsQuery();
  const [downloadBackup, { isLoading: isDownloading }] = useDownloadBackupMutation();
  const [createBackup, { isLoading: isCreating }] = useCreateBackupMutation();
  const [restoreBackup, { isLoading: isRestoring }] = useRestoreBackupMutation();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Get modules data with proper error handling
  const modules = React.useMemo(() => {
    if (isModulesError) {
      toast({
        title: 'Error loading modules',
        description: 'Failed to load modules. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return [];
    }
    return modulesData?.data || [];
  }, [modulesData, isModulesError, toast]);

  // Filter modules based on search input
  const filteredModules = React.useMemo(() => {
    if (!globalFilter) return modules;
    return modules.filter(module => 
      module.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
      module.description.toLowerCase().includes(globalFilter.toLowerCase())
    );
  }, [modules, globalFilter]);

  // Handle module selection for customized backup
  const toggleModuleSelection = (moduleId) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId) 
        : [...prev, moduleId]
    );
  };

  // Handle backup action
  const handleBackup = async (isFullBackup = false) => {
    const modulesToBackup = isFullBackup 
      ? modules.map(m => m.name) 
      : modules.filter(m => selectedModules.includes(m.id)).map(m => m.name);
    
    if (!isFullBackup && modulesToBackup.length === 0) {
      toast({
        title: 'No modules selected',
        description: 'Please select at least one module to backup',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Step 1: Create backup
      const backupResult = await createBackup().unwrap();
      
      if (!backupResult?.data?.id) {
        throw new Error('Backup creation failed - no ID returned');
      }

      toast({
        title: 'Backup created',
        description: 'Starting download...',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      // Step 2: Download backup using the ID
      const downloadResult = await downloadBackup(backupResult.data.id).unwrap();
      
      // Create a blob from the SQL text response
      const blob = new Blob([downloadResult], { type: 'application/sql' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString()}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Backup completed',
        description: 'Your backup file has been downloaded',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Backup failed',
        description: error.message || 'An error occurred during backup',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle restore action
  const handleRestore = async (isFullRestore = false) => {
    const modulesToRestore = isFullRestore 
      ? modules.map(m => m.name) 
      : modules.filter(m => selectedModules.includes(m.id)).map(m => m.name);
    
    if (!isFullRestore && modulesToRestore.length === 0) {
      toast({
        title: 'No modules selected',
        description: 'Please select at least one module to restore',
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
          title: 'Confirm Restore',
          text: `You are about to restore ${isFullRestore ? 'all' : 'selected'} modules from ${file.name}. This will overwrite existing data.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Proceed',
          cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
          // Create FormData and append the file
          const formData = new FormData();
          formData.append('backupFile', file);
          // if (!isFullRestore) {
          //   formData.append('modules', JSON.stringify(modulesToRestore));
          // }

          toast({
            title: 'Restore initiated',
            description: `Restoring data for ${modulesToRestore.length} modules`,
            status: 'info',
            duration: 3000,
            isClosable: true,
          });

          // Call the restore API
          await restoreBackup(formData).unwrap();

          toast({
            title: 'Restore completed',
            description: `Data has been successfully restored`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        toast({
          title: 'Restore failed',
          description: error.message || 'An error occurred during restore',
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
            Backup & Restore
          </Text>
        </Flex>

        <Tabs variant="soft-rounded" my="20px" colorScheme="brand" onChange={(index) => setActiveTab(index)}>
          <TabList px="25px">
            <Tab>Full Backup</Tab>
            <Tab>Customized Backup</Tab>
          </TabList>

          <Flex px="25px" my="20px" justifyContent="space-between" align="center">
            <InputGroup maxW="400px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                borderRadius={"20px"}
                placeholder="Search modules..."
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
                  Backup All
                </Button>
                <Button 
                  leftIcon={<UploadIcon />} 
                  colorScheme="green"
                  onClick={() => handleRestore(true)}
                >
                  Restore All
                </Button>
              </Flex>
            ) : (
              <Flex gap="10px">
                <Button 
                  leftIcon={<DownloadIcon />} 
                  colorScheme="blue"
                  onClick={() => handleBackup(false)}
                >
                  Backup Selected
                </Button>
                <Button 
                  leftIcon={<UploadIcon />} 
                  colorScheme="green"
                  onClick={() => handleRestore(false)}
                >
                  Restore Selected
                </Button>
              </Flex>
            )}
          </Flex>

          <TabPanels>
            {/* Full Backup Tab */}
            <TabPanel>
              {isModulesLoading ? (
                <Flex justify="center" align="center" py="20px">
                  <Text>Loading modules...</Text>
                </Flex>
              ) : modules.length === 0 ? (
                <Flex justify="center" align="center" py="20px">
                  <Text>No modules available</Text>
                </Flex>
              ) : (
                <Table variant="simple" color="gray.500" mb="24px" mt="12px">
                  <Thead>
                    <Tr>
                      <Th borderColor={borderColor}>
                        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
                          Module Name
                        </Text>
                      </Th>
                      {/* <Th borderColor={borderColor}>
                        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
                          Description
                        </Text>
                      </Th> */}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredModules.map((module) => (
                      <Tr key={module.id}>
                        <Td borderColor="transparent">
                          <Text color={textColor} fontSize="sm" fontWeight="bold">
                            {module.name}
                          </Text>
                        </Td>
                        {/* <Td borderColor="transparent">
                          <Text color={textColor} fontSize="sm">
                            {module.description}
                          </Text>
                        </Td> */}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </TabPanel>

            {/* Customized Backup Tab */}
            <TabPanel>
              {isModulesLoading ? (
                <Flex justify="center" align="center" py="20px">
                  <Text>Loading modules...</Text>
                </Flex>
              ) : modules.length === 0 ? (
                <Flex justify="center" align="center" py="20px">
                  <Text>No modules available</Text>
                </Flex>
              ) : (
                <Table variant="simple" color="gray.500" mb="24px" mt="12px">
                  <Thead>
                    <Tr>
                      <Th borderColor={borderColor} width="50px">
                        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
                          Select
                        </Text>
                      </Th>
                      <Th borderColor={borderColor}>
                        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
                          Module Name
                        </Text>
                      </Th>
                      <Th borderColor={borderColor}>
                        <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
                          Description
                        </Text>
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredModules.map((module) => (
                      <Tr key={module.id}>
                        <Td borderColor="transparent">
                          <Checkbox
                            isChecked={selectedModules.includes(module.id)}
                            onChange={() => toggleModuleSelection(module.id)}
                            colorScheme="brand"
                          />
                        </Td>
                        <Td borderColor="transparent">
                          <Text color={textColor} fontSize="sm" fontWeight="bold">
                            {module.name}
                          </Text>
                        </Td>
                        <Td borderColor="transparent">
                          <Text color={textColor} fontSize="sm">
                            {module.description}
                          </Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </Box>
  );
};

export default BackupAndRestore;
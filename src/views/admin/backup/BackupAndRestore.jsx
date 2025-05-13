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

const BackupAndRestore = () => {
  const [activeTab, setActiveTab] = React.useState(0);
  const [selectedModules, setSelectedModules] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const toast = useToast();

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Mock data for modules
  const modules = React.useMemo(() => [
    { id: 1, name: 'Inventory', description: 'Product inventory data' },
    { id: 2, name: 'Pharmacy', description: 'Pharmacy management data' },
    { id: 3, name: 'Clinics', description: 'Clinics management data' },
    { id: 4, name: 'Users', description: 'User accounts and permissions' },
    { id: 5, name: 'Settings', description: 'System configuration' },
  ], []);

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
  const handleBackup = (isFullBackup = false) => {
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

    Swal.fire({
      title: 'Confirm Backup',
      text: `You are about to backup ${isFullBackup ? 'all' : 'selected'} modules: ${modulesToBackup.join(', ')}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Proceed',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // Here you would call your backup API
        toast({
          title: 'Backup initiated',
          description: `Backup process started for ${modulesToBackup.length} modules`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        
        // Simulate backup process
        setTimeout(() => {
          toast({
            title: 'Backup completed',
            description: `Backup file is ready for download`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          // In a real app, you would trigger a file download here
        }, 2000);
      }
    });
  };

  // Handle restore action
  const handleRestore = (isFullRestore = false) => {
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
    fileInput.accept = '.json,.backup';
    
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      Swal.fire({
        title: 'Confirm Restore',
        text: `You are about to restore ${isFullRestore ? 'all' : 'selected'} modules from ${file.name}. This will overwrite existing data.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Proceed',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          // Here you would call your restore API with the file
          toast({
            title: 'Restore initiated',
            description: `Restoring data for ${modulesToRestore.length} modules`,
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
          
          // Simulate restore process
          setTimeout(() => {
            toast({
              title: 'Restore completed',
              description: `Data has been successfully restored`,
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
          }, 2000);
        }
      });
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
              <Table variant="simple" color="gray.500" mb="24px" mt="12px">
                <Thead>
                  <Tr>
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
            </TabPanel>

            {/* Customized Backup Tab */}
            <TabPanel>
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
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </Box>
  );
};

export default BackupAndRestore;
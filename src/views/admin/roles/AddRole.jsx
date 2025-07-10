import {
  Flex,
  Box,
  Card,
  Text,
  Input,
  Checkbox,
  Stack,
  useColorModeValue,
  Button,
  SimpleGrid,
} from '@chakra-ui/react';
import * as React from 'react';
import './roles.css';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
 // Adjust the import path
import { useGetModulesQuery } from 'api/roleSlice';
import { useAddRoleMutation } from 'api/roleSlice';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';

const AddRole = () => {
  const { t } = useTranslation();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const navigate = useNavigate();

  // Fetch modules data from the API
  const { data: apiData, isLoading, isError } = useGetModulesQuery();

  // Mutation hook for adding a new role
  const [addRole, { isLoading: isAdding }] = useAddRoleMutation();

  // State for categories and subcategories
  const [categories, setCategories] = React.useState([]);
  // State for parent checkboxes
  const [parentCheckboxes, setParentCheckboxes] = React.useState({});

  // Transform API data into the required structure
  React.useEffect(() => {
    if (apiData && apiData.success) {
      const transformedData = apiData.data.map((module) => ({
        id: module.id,
        name: module.displayName,
        subcategories: module.children.map((child) => ({
          id: child.id,
          name: child.displayName,
          permissions: {
            canView: false,
            canAdd: false,
            canEdit: false,
            canDelete: false,
          },
        })),
      }));
      setCategories(transformedData);
      
      // Initialize parent checkbox states
      const initialParentState = {};
      transformedData.forEach(category => {
        initialParentState[category.id] = {
          canView: false,
          canAdd: false,
          canEdit: false,
          canDelete: false
        };
      });
      setParentCheckboxes(initialParentState);
    }
  }, [apiData]);

  // Handle parent checkbox change
  const handleParentCheckboxChange = (categoryId, permission) => {
    const newValue = !parentCheckboxes[categoryId][permission];
    
    // Update parent checkbox state
    setParentCheckboxes(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [permission]: newValue
      }
    }));

    // Update all child checkboxes in this category
    setCategories(prev => prev.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          subcategories: category.subcategories.map(subcategory => ({
            ...subcategory,
            permissions: {
              ...subcategory.permissions,
              [permission]: newValue
            }
          }))
        };
      }
      return category;
    }));
  };

  // Handle permission change for child checkboxes
  const handlePermissionChange = (categoryId, subcategoryId, permission) => {
    const updatedCategories = categories.map((category) => {
      if (category.id === categoryId) {
        const updatedSubcategories = category.subcategories.map((subcategory) => {
          if (subcategory.id === subcategoryId) {
            return {
              ...subcategory,
              permissions: {
                ...subcategory.permissions,
                [permission]: !subcategory.permissions[permission],
              },
            };
          }
          return subcategory;
        });

        // Check if all subcategories have this permission checked
        const allChecked = updatedSubcategories.every(
          sub => sub.permissions[permission]
        );

        // Update parent checkbox state
        setParentCheckboxes(prev => ({
          ...prev,
          [categoryId]: {
            ...prev[categoryId],
            [permission]: allChecked
          }
        }));

        return {
          ...category,
          subcategories: updatedSubcategories,
        };
      }
      return category;
    });
    setCategories(updatedCategories);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Transform categories into the required API format
    const permissions = categories.flatMap((category) =>
      category.subcategories.map((subcategory) => ({
        moduleId: subcategory.id,
        canView: subcategory.permissions.canView,
        canAdd: subcategory.permissions.canAdd,
        canEdit: subcategory.permissions.canEdit,
        canDelete: subcategory.permissions.canDelete,
      })),
    );

    // Prepare the payload
    const payload = {
      name: e.target.roleName.value,
      platform: 'ADMIN', // Replace with the appropriate platform if dynamic
      permissions,
    };

    console.log('Payload:', payload); // Debugging
    try {
      // Send the data to the API
      const response = await addRole(payload).unwrap();
     
      Swal.fire({
        icon: 'success',
        title: t('messages.success'),
        text: t('roleAddedSuccessfully'),
        confirmButtonText: t('ok'),
        onClose: () => {
          navigate('/admin/undefined/roles'); // Redirect to the roles page after successful submission
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/admin/undefined/roles'); // Redirect to the roles page after successful submission
        }
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('messages.error'),
        text: error.data.message,
        confirmButtonText: t('ok'),
      });
    }
  };

  if (isLoading) {
    return <div>{t('loading')}</div>;
  }

  if (isError) {
    return <div>{t('errorFetchingModules')}</div>;
  }

  return (
    <div className="container">
      <Card
        flexDirection="column"
        w="100%"
        px="20px"
        py="20px"
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
      >
        <Flex justifyContent="space-between" align="center" w="100%" mb="20px">
          <Text
            color={textColor}
            fontSize="22px"
            fontWeight="700"
            lineHeight="100%"
          >
            {t('addNewRole')}
          </Text>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            colorScheme="teal"
            size="sm"
            leftIcon={<IoMdArrowBack />}
          >
            {t('back')}
          </Button>
        </Flex>
        <form onSubmit={handleSubmit}>
          {/* Role Name Input */}
          <Box mb="20px">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              {t('roleName')}
            </Text>
            <Input
              name="roleName"
              placeholder={t('enterRoleName')}
              size="sm"
              width={'50%'}
              required
              mt="8px"
            />
          </Box>

          {/* Categories and Subcategories */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} spacing="20px">
            {categories.map((category) => (
              <Card key={category.id} p="16px">
                <Box
                  display={'flex'}
                  gap={'10px'}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                >
                  <Text
                    fontSize="lg"
                    paddingBottom={'5px'}
                    fontWeight="700"
                    mb="16px"
                    backdropBlur={'10px'}
                  >
                    {category.name}
                  </Text>
                  <Checkbox
                    isChecked={parentCheckboxes[category.id]?.canView}
                    onChange={() => handleParentCheckboxChange(category.id, 'canView')}
                  >
                    {t('view')}
                  </Checkbox>
                  <Checkbox
                    isChecked={parentCheckboxes[category.id]?.canAdd}
                    onChange={() => handleParentCheckboxChange(category.id, 'canAdd')}
                  >
                    {t('add')}
                  </Checkbox>
                  <Checkbox
                    isChecked={parentCheckboxes[category.id]?.canEdit}
                    onChange={() => handleParentCheckboxChange(category.id, 'canEdit')}
                  >
                    {t('edit')}
                  </Checkbox>
                  
                  <Checkbox
                    isChecked={parentCheckboxes[category.id]?.canDelete}
                    onChange={() => handleParentCheckboxChange(category.id, 'canDelete')}
                  >
                    {t('delete')}
                  </Checkbox>
                </Box>
                <hr />
                {category.subcategories.map((subcategory) => (
                  <Box
                    key={subcategory.id}
                    mb="12px"
                    display={'flex'}
                    alignItems={'center'}
                    justifyContent={'space-between'}
                  >
                    <Text fontSize="md" fontWeight="600" mb="8px">
                      {subcategory.name}
                    </Text>

                    <Stack direction="row" spacing={4}>
                      <Checkbox
                        isChecked={subcategory.permissions.canView}
                        onChange={() =>
                          handlePermissionChange(
                            category.id,
                            subcategory.id,
                            'canView',
                          )
                        }
                      >
                        {t('view')}
                      </Checkbox>
                      <Checkbox
                        isChecked={subcategory.permissions.canAdd}
                        onChange={() =>
                          handlePermissionChange(
                            category.id,
                            subcategory.id,
                            'canAdd',
                          )
                        }
                      >
                        {t('add')}
                      </Checkbox>
                      <Checkbox
                        isChecked={subcategory.permissions.canEdit}
                        onChange={() =>
                          handlePermissionChange(
                            category.id,
                            subcategory.id,
                            'canEdit',
                          )
                        }
                      >
                        {t('edit')}
                      </Checkbox>
                      <Checkbox
                        isChecked={subcategory.permissions.canDelete}
                        onChange={() =>
                          handlePermissionChange(
                            category.id,
                            subcategory.id,
                            'canDelete',
                          )
                        }
                      >
                        {t('delete')}
                      </Checkbox>
                    </Stack>
                  </Box>
                ))}
              </Card>
            ))}
          </SimpleGrid>

          {/* Submit Button */}
          <Button
            variant="darkBrand"
            color="white"
            fontSize="sm"
            fontWeight="500"
            borderRadius="70px"
            px="24px"
            py="5px"
            type="submit"
            mt="20px"
            isLoading={isAdding}
          >
            {t('submit')}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AddRole;
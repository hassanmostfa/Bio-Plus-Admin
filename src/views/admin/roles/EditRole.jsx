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
import { useNavigate, useParams } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import Swal from 'sweetalert2';
import { useGetModulesQuery } from 'api/roleSlice';
import { useGetRolePermissiosQuery } from 'api/roleSlice';
import { useUpdateRoleMutation } from 'api/roleSlice';

const EditRole = () => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch modules data from the API
  const { data: apiData, isLoading, isError } = useGetModulesQuery();

  // Fetch role permissions data from the API
  const { data: rolePermissions, refetch: refetchPermissions, isLoading: isPermissionsLoading, isError: isPermissionsError } = useGetRolePermissiosQuery(id);

  // Mutation hook for updating a role
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

  // State for categories and subcategories
  const [categories, setCategories] = React.useState([]);
  
  // Transform API data into the required structure
  React.useEffect(() => {
    if (apiData && apiData.success && rolePermissions && rolePermissions.success) {
      const transformedData = apiData.data.map((module) => ({
        id: module.id,
        name: module.displayName,
        subcategories: module.children.map((child) => {
          const permission = rolePermissions.data.permissions.find((perm) => perm.moduleId === child.id);
          return {
            id: child.id,
            name: child.displayName,
            permissions: {
              canView: permission ? permission.canView : false,
              canAdd: permission ? permission.canAdd : false,
              canEdit: permission ? permission.canEdit : false,
              canDelete: permission ? permission.canDelete : false,
            },
          };
        }),
      }));
      setCategories(transformedData);
    }
  }, [apiData, rolePermissions]);

  // Handle permission change
  const handlePermissionChange = (categoryId, subcategoryId, permission) => {
    const updatedCategories = categories.map((category) => {
      if (category.id === categoryId) {
        return {
          ...category,
          subcategories: category.subcategories.map((subcategory) => {
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
          }),
        };
      }
      return category;
    });
    setCategories(updatedCategories);
  };
  React.useEffect(() => {
    refetchPermissions();
  },[]);
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
      // platform: 'ADMIN', // Replace with the appropriate platform if dynamic
      permissions,
    };

    try {
      // Send the data to the API
      const response = await updateRole({ id, role: payload }).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Role updated successfully',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-swal-popup', // Add a custom class for the popup
          title: 'custom-swal-title', // Add a custom class for the title
          content: 'custom-swal-content', // Add a custom class for the content
          confirmButton: 'custom-swal-confirm-button', // Add a custom class for the confirm button
        },        onClose: () => {
          navigate('/admin/undefined/rules'); // Redirect to the roles page after successful submission
        }
      }).then((result) => {
        if (result.isConfirmed) {
          refetchPermissions();
          navigate('/admin/undefined/rules'); // Redirect to the roles page after successful submission
        }
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.data.message,
        confirmButtonText: 'OK',
      });
    }
  };

  if (isLoading || isPermissionsLoading) {
    return <div>Loading...</div>;
  }

  if (isError || isPermissionsError) {
    return <div>Error fetching data.</div>;
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
            Edit Role
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
        </Flex>
        <form onSubmit={handleSubmit}>
          {/* Role Name Input */}
          <Box mb="20px">
            <Text color={textColor} fontSize="sm" fontWeight="700">
              Role Name
            </Text>
            <Input
              name="roleName"
              placeholder="Enter role name"
              size="sm"
              width={'50%'}
              required
              mt="8px"
              defaultValue={rolePermissions?.data?.name}
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
                  <Checkbox>Add</Checkbox>
                  <Checkbox>Edit</Checkbox>
                  <Checkbox>View</Checkbox>
                  <Checkbox>Delete</Checkbox>
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
                        View
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
                        Add
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
                        Edit
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
                        Delete
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
            isLoading={isUpdating}
          >
            Update Role
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default EditRole;
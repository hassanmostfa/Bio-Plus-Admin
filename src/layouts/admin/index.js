import React, { useState, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Box, useDisclosure, Portal } from "@chakra-ui/react";
import Footer from "components/footer/FooterAdmin.js";
import Navbar from "components/navbar/NavbarAdmin.js";
import Sidebar from "components/sidebar/Sidebar.js";
import { SidebarContext } from "contexts/SidebarContext";

// Helper function to capitalize the first letter of each word
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Function to remove the ID segment from the path
const removeIdFromPath = (path) => {
  const segments = path.split("/").filter(Boolean); // Split and remove empty segments
  const lastSegment = segments[segments.length - 1]; // Get the last segment

  // Check if the last segment is an ID (numeric or UUID)
  const isId =
    /^\d+$/.test(lastSegment) || // Check if numeric
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      lastSegment
    ); // Check if UUID

  if (isId) {
    return segments.slice(0, -1).join("/"); // Remove the last segment (ID)
  }

  return path; // Return the original path if no ID is found
};

// Function to find the route name and parent route
const getBreadcrumbPath = (pathname, routes) => {
  const segments = pathname.split("/").filter(Boolean);
  const adminIndex = segments.indexOf("admin");

  if (adminIndex === -1) return "";

  const pathSegments = segments.slice(adminIndex + 1); // Get everything after "/admin/"
  const cleanedSegments = pathSegments.filter(segment => segment.toLowerCase() !== "undefined"); // Remove "undefined"

  // Remove any ID segments (UUID or numeric) from the path
  const idRegex = /^\d+$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  const pathSegmentsNoIds = cleanedSegments.filter(segment => !idRegex.test(segment));

  let breadcrumb = [];
  let currentPath = "/admin";

  pathSegmentsNoIds.forEach(segment => {
    currentPath += `/${segment}`;

    // Find the matching route name
    const matchedRoute = routes.find(route => `${route.layout}${route.path}` === currentPath);

    if (matchedRoute) {
      breadcrumb.push(capitalizeFirstLetter(matchedRoute.name));
    } else {
      breadcrumb.push(capitalizeFirstLetter(segment)); // Fallback to segment name
    }
  });

  return breadcrumb.join(" > ");
};

const AdminLayout = (props) => {
  const { routes, ...rest } = props;
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const [activeRoute, setActiveRoute] = useState("Dashboard");
  const location = useLocation();
  const { onOpen } = useDisclosure();

  // Update active route whenever location changes
  useEffect(() => {
    const breadcrumbPath = getBreadcrumbPath(location.pathname, routes);
    setActiveRoute(breadcrumbPath);
  }, [location, routes]);

  // Render routes for the app, including subroutes
  const getRoutes = (routes) => {
    return routes.flatMap((route, key) => {
      if (route.subRoutes) {
        return [
          route.component && (
            <Route key={`parent-${key}`} path={`${route.path}`} element={route.component} />
          ),
          ...route.subRoutes.map((subRoute, subKey) => (
            <Route key={`${key}-${subKey}`} path={`${route.path}${subRoute.path}`} element={subRoute.component} />
          )),
        ];
      } else if (route.layout === "/admin") {
        return <Route key={key} path={`${route.path}`} element={route.component} />;
      }
      return null;
    });
  };

  // Determine whether to show the main layout
  const getRoute = () => {
    return location.pathname !== "/admin/full-screen-maps";
  };

  return (
    <Box>
      <SidebarContext.Provider
        value={{
          toggleSidebar,
          setToggleSidebar,
        }}
      >
        <Sidebar routes={routes} display="none" {...rest} />
        <Box
          float="right"
          minHeight="100vh"
          height="100%"
          overflow="auto"
          position="relative"
          maxHeight="100%"
          w={{ base: "100%", xl: "calc( 100% - 290px )" }}
          maxWidth={{ base: "100%", xl: "calc( 100% - 290px )" }}
          transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
          transitionDuration=".2s, .2s, .35s"
          transitionProperty="top, bottom, width"
          transitionTimingFunction="linear, linear, ease"
        >
          <Portal>
            <Box>
              <Navbar
                onOpen={onOpen}
                logoText={"Horizon UI Dashboard PRO"}
                brandText={activeRoute} // Dynamically updated breadcrumb
                secondary={false}
                message={""}
                fixed={false}
                routes={routes}
                {...rest}
              />
            </Box>
          </Portal>
          {getRoute() ? (
            <Box mx="auto" p={{ base: "20px", md: "30px" }} pe="20px" minH="100vh" pt="50px">
              <Routes>
                {getRoutes(routes)} {/* Dynamic route rendering */}
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </Box>
          ) : null}
          <Box>
            <Footer />
          </Box>
        </Box>
      </SidebarContext.Provider>
    </Box>
  );
};

export default AdminLayout;
import { ChakraProvider, Box, Flex, VStack, Icon, Text, useColorModeValue, IconButton, Container, Image, Button, Spacer } from '@chakra-ui/react';
import theme from './theme';
import { FiHome, FiTruck, FiUsers, FiFileText, FiCalendar, FiPackage, FiSettings, FiTool, FiLogOut } from 'react-icons/fi';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Veicoli from './pages/Veicoli';
import Clienti from './pages/Clienti';
import Preventivi from './pages/Preventivi';
import Calendario from './pages/Calendario';
import Ricambi from './pages/Ricambi';
import Impostazioni from './pages/Impostazioni';
import Interventi from './pages/Interventi';
import { useState, useEffect } from 'react';

// Componente per il layout principale con Sidebar
const MainLayout = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      try {
        setUser(JSON.parse(loggedInUser));
      } catch (e) {
        console.error("Errore nel parsing dell'utente da localStorage", e);
        navigate('/');
      }
    } else {
      navigate('/');
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/');
  };

  const sidebarWidth = 250;
  const minContentWidth = windowWidth - sidebarWidth - 40;

  if (!user) {
    return null;
  }

  return (
    <Flex minH="100vh" width="100%" overflow="hidden">
      {/* Sidebar con larghezza fissa */}
      <Box
        w={`${sidebarWidth}px`}
        minW={`${sidebarWidth}px`}
        bg={useColorModeValue('white', 'gray.800')}
        borderRight="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        p={4}
        position="fixed"
        h="100vh"
        overflowY="auto"
        transition="all 0.2s"
      >
         <VStack spacing={4} align="stretch" height="100%">
           {/* Aggiunta immagine logo */}
           <Image src="/logo.png" alt="Logo Officina" boxSize="100px" objectFit="contain" mb={4} mx="auto" />

           <NavItem icon={FiHome} path="/dashboard" label="Dashboard" />
           <NavItem icon={FiTruck} path="/veicoli" label="Veicoli" />
           <NavItem icon={FiUsers} path="/clienti" label="Clienti" />
           <NavItem icon={FiTool} path="/interventi" label="Interventi" />
           <NavItem icon={FiFileText} path="/preventivi" label="Preventivi" />
           <NavItem icon={FiCalendar} path="/calendario" label="Calendario" />
           <NavItem icon={FiPackage} path="/ricambi" label="Ricambi" />
           <NavItem icon={FiSettings} path="/impostazioni" label="Impostazioni" />

           {/* Spacer per spingere gli elementi successivi in fondo */}
           <Spacer />

           {/* Informazioni utente e Logout */}
           <Box mt={4} pt={4} borderTop="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
             <Text fontSize="sm" textAlign="center" mb={2}>Loggato come: <strong>{user.username}</strong></Text>
             <Button
               leftIcon={<FiLogOut />}
               colorScheme="red"
               variant="ghost"
               onClick={handleLogout}
               width="100%"
               justifyContent="flex-start"
             >
               Esci
             </Button>
           </Box>
         </VStack>
       </Box>

      {/* Contenuto principale con margine sinistro per compensare la sidebar fissa */}
      <Box
        ml={`${sidebarWidth}px`}
        flex={1}
        bg={useColorModeValue('gray.50', 'gray.900')}
        minW={`${minContentWidth}px`}
        w="100%"
        transition="all 0.2s"
        pl={2}
      >
        <Container maxW="container.xl" py={4} px={3}>
          {/* Outlet renderà le route figlie definite in App */}
          <Outlet />
        </Container>
      </Box>
    </Flex>
  );
};

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Routes>
          {/* Route per il Login (senza MainLayout) */}
          <Route path="/" element={<Login />} />

          {/* Route protette che usano MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/veicoli" element={<Veicoli />} />
            <Route path="/clienti" element={<Clienti />} />
            <Route path="/interventi" element={<Interventi />} />
            <Route path="/preventivi" element={<Preventivi />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/ricambi" element={<Ricambi />} />
            <Route path="/impostazioni" element={<Impostazioni />} />
          </Route>
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

// Il componente NavItem rimane invariato
const NavItem = ({ icon, path, label }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === path;
  const bg = useColorModeValue('gray.100', 'gray.700');
  const color = useColorModeValue('blue.600', 'blue.200');

  return (
    <Flex
      align="center"
      p={3}
      cursor="pointer"
      borderRadius="lg"
      role="group"
      bg={isActive ? bg : 'transparent'}
      color={isActive ? color : 'inherit'}
      _hover={{
        bg: bg,
        color: color,
      }}
      onClick={() => navigate(path)}
      justifyContent="flex-start"
      width="100%"
    >
      <Icon as={icon} mr={4} />
      <Text flex="1" textAlign="left">{label}</Text>
    </Flex>
  );
};

export default App;

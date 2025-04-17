import { Box, Heading, Button, FormControl, FormLabel, Input, VStack, Tabs, TabList, TabPanels, Tab, TabPanel, Table, Thead, Tbody, Tr, Th, Td, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, IconButton, Tooltip } from '@chakra-ui/react'
import { FiTrash2 } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Impostazioni() {
  const [datiAzienda, setDatiAzienda] = useState({})
  const [users, setUsers] = useState([])
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'tecnico' })
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  useEffect(() => {
    loadUsers()
    caricaImpostazioni()
  }, [])

  const loadUsers = () => {
    axios.get('/credentials.xml', {
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/xml'
      }
    })
    .then(response => {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(response.data, 'text/xml')
      const userElements = xmlDoc.getElementsByTagName('user')
      
      const userList = []
      for (let i = 0; i < userElements.length; i++) {
        const user = userElements[i]
        userList.push({
          username: user.getElementsByTagName('username')[0].textContent,
          password: user.getElementsByTagName('password')[0].textContent,
          role: user.getElementsByTagName('role')[0].textContent
        })
      }
      
      setUsers(userList)
    })
    .catch(error => {
      console.error('Errore nel caricamento delle credenziali:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile caricare le credenziali.',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    })
  }

  const saveUsers = () => {
    // Crea il documento XML
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<credentials>\n  <users>\n'
    
    users.forEach(user => {
      xmlContent += `    <user>\n`
      xmlContent += `      <username>${user.username}</username>\n`
      xmlContent += `      <password>${user.password}</password>\n`
      xmlContent += `      <role>${user.role}</role>\n`
      xmlContent += `    </user>\n`
    })
    
    xmlContent += '  </users>\n</credentials>'
    
    // Usa Blob e URL.createObjectURL per creare un link scaricabile
    const blob = new Blob([xmlContent], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'credentials.xml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Credenziali esportate',
      description: 'Sostituisci il file credentials.xml nella cartella public con quello scaricato',
      status: 'success',
      duration: 5000,
      isClosable: true
    })
  }

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password) {
      toast({
        title: 'Errore',
        description: 'Username e password sono obbligatori',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
      return
    }
    
    // Verifica se l'username esiste già
    if (users.some(user => user.username === newUser.username)) {
      toast({
        title: 'Errore',
        description: 'Username già esistente',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
      return
    }
    
    setUsers([...users, newUser])
    setNewUser({ username: '', password: '', role: 'tecnico' })
    onClose()
  }

  const handleDeleteUser = (username) => {
    setUsers(users.filter(user => user.username !== username))
  }

  // Funzione per caricare le impostazioni dal file XML
  const caricaImpostazioni = () => {
    axios.get('/impostazioni.xml', {
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/xml'
      }
    })
    .then(response => {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(response.data, 'text/xml')
      
      // Estrai i dati dell'azienda
      const aziendaElement = xmlDoc.getElementsByTagName('azienda')[0]
      if (aziendaElement) {
        const dati = {
          nome: aziendaElement.getElementsByTagName('nome')[0]?.textContent || '',
          indirizzo: aziendaElement.getElementsByTagName('indirizzo')[0]?.textContent || '',
          piva: aziendaElement.getElementsByTagName('piva')[0]?.textContent || '',
          telefono: aziendaElement.getElementsByTagName('telefono')[0]?.textContent || '',
          email: aziendaElement.getElementsByTagName('email')[0]?.textContent || ''
        }
        setDatiAzienda(dati)
      }
    })
    .catch(error => {
      console.error('Errore nel caricamento delle impostazioni:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile caricare le impostazioni. Riprova più tardi.',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    })
  }

  // Funzione per salvare le impostazioni nel file XML
  const salvaImpostazioni = () => {
    // Creiamo il documento XML
    const xmlDoc = document.implementation.createDocument(null, "impostazioni", null);
    const root = xmlDoc.documentElement;
    
    // Aggiungiamo i dati dell'azienda
    const aziendaElement = xmlDoc.createElement("azienda");
    
    // Aggiungiamo tutti i campi dell'azienda
    const campi = ['nome', 'indirizzo', 'piva', 'telefono', 'email', 'logo'];
    campi.forEach(campo => {
      const element = xmlDoc.createElement(campo);
      element.textContent = datiAzienda[campo] || '';
      aziendaElement.appendChild(element);
    });
    
    root.appendChild(aziendaElement);
    
    // Aggiungiamo le impostazioni di sistema (valori predefiniti)
    const sistemaElement = xmlDoc.createElement("sistema");
    const sistemaValori = {
      tema: 'light',
      lingua: 'it',
      valuta: 'EUR',
      formato_data: 'dd/MM/yyyy'
    };
    
    Object.entries(sistemaValori).forEach(([chiave, valore]) => {
      const element = xmlDoc.createElement(chiave);
      element.textContent = valore;
      sistemaElement.appendChild(element);
    });
    
    root.appendChild(sistemaElement);
    
    // Convertiamo il documento XML in stringa
    const serializer = new XMLSerializer();
    const xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n' + 
                      serializer.serializeToString(xmlDoc);
    
    // Salviamo effettivamente il file XML tramite una chiamata API
    axios.post('/api/salva-xml', {
      filename: 'impostazioni.xml',
      content: xmlString
    })
    .then(response => {
      toast({
        title: 'Operazione completata',
        description: 'Le impostazioni sono state salvate nel file XML.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    })
    .catch(error => {
      console.error('Errore nel salvataggio delle impostazioni:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare le impostazioni. Riprova più tardi.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    });
  }

  const handleSave = () => {
    salvaImpostazioni()
  }

  return (
    <Box p={4}>
      <Heading size="lg" mb={6}>Impostazioni</Heading>
      
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Dati Azienda</Tab>
          <Tab>Gestione Utenti</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <VStack spacing={4} maxW="600px" align="start">
              <FormControl>
                <FormLabel>Nome Azienda</FormLabel>
                <Input value={datiAzienda.nome || ''} onChange={(e) => setDatiAzienda({...datiAzienda, nome: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Indirizzo</FormLabel>
                <Input value={datiAzienda.indirizzo || ''} onChange={(e) => setDatiAzienda({...datiAzienda, indirizzo: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Partita IVA</FormLabel>
                <Input value={datiAzienda.piva || ''} onChange={(e) => setDatiAzienda({...datiAzienda, piva: e.target.value})} />
              </FormControl>
              <Button colorScheme="blue" onClick={handleSave}>Salva Impostazioni</Button>
            </VStack>
          </TabPanel>
          
          <TabPanel>
            <Box>
              <Button colorScheme="blue" mb={4} onClick={onOpen}>+ Nuovo Utente</Button>
              <Button colorScheme="green" mb={4} ml={4} onClick={saveUsers}>Esporta Credenziali</Button>
              
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Username</Th>
                    <Th>Ruolo</Th>
                    <Th>Azioni</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map((user, index) => (
                    <Tr key={index}>
                      <Td>{user.username}</Td>
                      <Td>{user.role}</Td>
                      <Td>
                        <Tooltip label="Elimina utente" placement="top">
                  <IconButton
                    icon={<FiTrash2 />}
                    size="sm"
                    colorScheme="red"
                    aria-label="Elimina utente"
                    onClick={() => handleDeleteUser(user.username)}
                  />
                </Tooltip>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Nuovo Utente</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Username</FormLabel>
                      <Input 
                        value={newUser.username} 
                        onChange={(e) => setNewUser({...newUser, username: e.target.value})} 
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Password</FormLabel>
                      <Input 
                        type="password" 
                        value={newUser.password} 
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Ruolo</FormLabel>
                      <Input 
                        value={newUser.role} 
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})} 
                      />
                    </FormControl>
                  </VStack>
                </ModalBody>
                <ModalFooter>
                  <Button colorScheme="blue" mr={3} onClick={handleAddUser}>Salva</Button>
                  <Button onClick={onClose}>Annulla</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}
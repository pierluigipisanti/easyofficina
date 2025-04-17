import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, FormControl, FormLabel, Input, VStack, useToast, IconButton, Tooltip } from '@chakra-ui/react'
import { FiEdit, FiTrash2 } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Clienti() {
  // Stato per la modifica di un cliente esistente
  const [clienteDaModificare, setClienteDaModificare] = useState(null)
  const [modalitaModifica, setModalitaModifica] = useState(false)
  
  // Funzione per gestire la modifica di un cliente
  const handleModifica = (cliente) => {
    setClienteDaModificare(cliente)
    setNuovoCliente({
      nome: cliente.nome,
      cognome: cliente.cognome,
      email: cliente.email,
      telefono: cliente.telefono,
      indirizzo: cliente.indirizzo
    })
    setModalitaModifica(true)
    onOpen()
  }
  
  // Funzione per gestire l'eliminazione di un cliente
  const handleElimina = (id) => {
    const nuovaLista = clienti.filter(cliente => cliente.id !== id)
    setClienti(nuovaLista)
    salvaClienti(nuovaLista)
    toast({
      title: 'Cliente eliminato',
      description: 'Il cliente è stato rimosso con successo.',
      status: 'info',
      duration: 3000,
      isClosable: true
    })
  }
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [clienti, setClienti] = useState([])
  const toast = useToast()

  useEffect(() => {
    // Carica i clienti dal file XML
    caricaClienti()
  }, [])
  const [nuovoCliente, setNuovoCliente] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    indirizzo: ''
  })

  // Funzione per caricare i clienti dal file XML
  const caricaClienti = () => {
    axios.get('/clienti.xml', {
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/xml'
      }
    })
    .then(response => {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(response.data, 'text/xml')
      const clientiElements = xmlDoc.getElementsByTagName('cliente')
      
      const clientiList = []
      for (let i = 0; i < clientiElements.length; i++) {
        const cliente = clientiElements[i]
        clientiList.push({
          id: cliente.getElementsByTagName('id')[0].textContent,
          nome: cliente.getElementsByTagName('nome')[0].textContent,
          cognome: cliente.getElementsByTagName('cognome')[0].textContent,
          email: cliente.getElementsByTagName('email')[0].textContent,
          telefono: cliente.getElementsByTagName('telefono')[0].textContent,
          indirizzo: cliente.getElementsByTagName('indirizzo')[0].textContent
        })
      }
      
      setClienti(clientiList)
    })
    .catch(error => {
      console.error('Errore nel caricamento dei clienti:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i clienti. Riprova più tardi.',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    })
  }

  // Funzione per salvare i clienti nel file XML
  const salvaClienti = (nuovaLista) => {
    // Creiamo il documento XML
    const xmlDoc = document.implementation.createDocument(null, "clienti", null);
    const root = xmlDoc.documentElement;
    
    // Aggiungiamo ogni cliente al documento XML
    nuovaLista.forEach(cliente => {
      const clienteElement = xmlDoc.createElement("cliente");
      
      // Aggiungiamo tutti i campi del cliente
      const campi = ['id', 'nome', 'cognome', 'email', 'telefono', 'indirizzo'];
      campi.forEach(campo => {
        const element = xmlDoc.createElement(campo);
        element.textContent = cliente[campo] || '';
        clienteElement.appendChild(element);
      });
      
      root.appendChild(clienteElement);
    });
    
    // Convertiamo il documento XML in stringa
    const serializer = new XMLSerializer();
    const xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n' + 
                      serializer.serializeToString(xmlDoc);
    
    // Salviamo effettivamente il file XML tramite una chiamata API
    axios.post('/api/salva-xml', {
      filename: 'clienti.xml',
      content: xmlString
    })
    .then(response => {
      toast({
        title: 'Operazione completata',
        description: 'I dati dei clienti sono stati salvati nel file XML.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    })
    .catch(error => {
      console.error('Errore nel salvataggio dei clienti:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare i dati dei clienti. Riprova più tardi.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    });

  }

  const handleSubmit = () => {
    const nuovoId = Date.now().toString()
    const nuovaLista = [...clienti, { ...nuovoCliente, id: nuovoId }]
    setClienti(nuovaLista)
    salvaClienti(nuovaLista)
    setNuovoCliente({ nome: '', cognome: '', email: '', telefono: '', indirizzo: '' })
    onClose()
  }

  return (
    <Box p={4}>
      <Heading size="lg" mb={6}>Gestione Clienti</Heading>
      
      <Button colorScheme="blue" onClick={onOpen} mb={4}>
        + Nuovo Cliente
      </Button>

      <Table variant="simple" size="sm" style={{ tableLayout: 'fixed', width: '100%' }}>
        <Thead>
          <Tr>
            <Th width="30%">Nome</Th>
            <Th width="20%">Telefono</Th>
            <Th width="30%">Email</Th>
            <Th width="20%">Azioni</Th>
          </Tr>
        </Thead>
        <Tbody>
          {clienti.map(cliente => (
            <Tr key={cliente.id}>
              <Td>{cliente.nome} {cliente.cognome}</Td>
              <Td>{cliente.telefono}</Td>
              <Td>{cliente.email}</Td>
              <Td>
                <Tooltip label="Modifica cliente" placement="top">
                  <IconButton
                    icon={<FiEdit />}
                    size="sm"
                    mr={2}
                    aria-label="Modifica cliente"
                    onClick={() => handleModifica(cliente)}
                  />
                </Tooltip>
                <Tooltip label="Elimina cliente" placement="top">
                  <IconButton
                    icon={<FiTrash2 />}
                    size="sm"
                    colorScheme="red"
                    aria-label="Elimina cliente"
                    onClick={() => handleElimina(cliente.id)}
                  />
                </Tooltip>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={() => {
        onClose()
        setModalitaModifica(false)
        setClienteDaModificare(null)
        setNuovoCliente({ nome: '', cognome: '', email: '', telefono: '', indirizzo: '' })
      }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{modalitaModifica ? 'Modifica Cliente' : 'Nuovo Cliente'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Nome</FormLabel>
                <Input value={nuovoCliente.nome} onChange={(e) => setNuovoCliente({...nuovoCliente, nome: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Cognome</FormLabel>
                <Input value={nuovoCliente.cognome} onChange={(e) => setNuovoCliente({...nuovoCliente, cognome: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input type="email" value={nuovoCliente.email} onChange={(e) => setNuovoCliente({...nuovoCliente, email: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Telefono</FormLabel>
                <Input value={nuovoCliente.telefono} onChange={(e) => setNuovoCliente({...nuovoCliente, telefono: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Indirizzo</FormLabel>
                <Input value={nuovoCliente.indirizzo} onChange={(e) => setNuovoCliente({...nuovoCliente, indirizzo: e.target.value})} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={() => {
              if (modalitaModifica && clienteDaModificare) {
                // Aggiorna il cliente esistente
                const nuovaLista = clienti.map(c => 
                  c.id === clienteDaModificare.id ? 
                  { ...nuovoCliente, id: clienteDaModificare.id } : c
                )
                setClienti(nuovaLista)
                salvaClienti(nuovaLista)
                setModalitaModifica(false)
                setClienteDaModificare(null)
              } else {
                // Crea un nuovo cliente
                handleSubmit()
              }
              onClose()
            }}>
              Salva
            </Button>
            <Button onClick={() => {
              onClose()
              setModalitaModifica(false)
              setClienteDaModificare(null)
              setNuovoCliente({ nome: '', cognome: '', email: '', telefono: '', indirizzo: '' })
            }}>
              Annulla
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
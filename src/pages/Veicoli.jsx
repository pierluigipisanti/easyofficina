import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, FormControl, FormLabel, Input, VStack, Select, useToast, IconButton, Tooltip } from '@chakra-ui/react'
import { FiEdit, FiTrash2 } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Veicoli() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [veicoli, setVeicoli] = useState([])
  const toast = useToast()
  
  useEffect(() => {
    // Carica i veicoli dal file XML
    caricaVeicoli()
  }, [])
  const [nuovoVeicolo, setNuovoVeicolo] = useState({
    targa: '',
    marca: '',
    modello: '',
    anno: '',
    km: '',
    cliente: ''
  })

  // Funzione per caricare i veicoli dal file XML
  const caricaVeicoli = () => {
    axios.get('/veicoli.xml', {
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/xml'
      }
    })
    .then(response => {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(response.data, 'text/xml')
      const veicoliElements = xmlDoc.getElementsByTagName('veicolo')
      
      const veicoliList = []
      for (let i = 0; i < veicoliElements.length; i++) {
        const veicolo = veicoliElements[i]
        veicoliList.push({
          id: veicolo.getElementsByTagName('id')[0].textContent,
          targa: veicolo.getElementsByTagName('targa')[0].textContent,
          marca: veicolo.getElementsByTagName('marca')[0].textContent,
          modello: veicolo.getElementsByTagName('modello')[0].textContent,
          anno: veicolo.getElementsByTagName('anno')[0].textContent,
          km: veicolo.getElementsByTagName('km')[0].textContent,
          cliente: veicolo.getElementsByTagName('cliente')[0].textContent
        })
      }
      
      setVeicoli(veicoliList)
    })
    .catch(error => {
      console.error('Errore nel caricamento dei veicoli:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i veicoli. Riprova più tardi.',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    })
  }

  // Funzione per salvare i veicoli nel file XML
  const salvaVeicoli = (nuovaLista) => {
    // Creiamo il documento XML
    const xmlDoc = document.implementation.createDocument(null, "veicoli", null);
    const root = xmlDoc.documentElement;
    
    // Aggiungiamo ogni veicolo al documento XML
    nuovaLista.forEach(veicolo => {
      const veicoloElement = xmlDoc.createElement("veicolo");
      
      // Aggiungiamo tutti i campi del veicolo
      const campi = ['id', 'targa', 'marca', 'modello', 'anno', 'km', 'cliente'];
      campi.forEach(campo => {
        const element = xmlDoc.createElement(campo);
        element.textContent = veicolo[campo] || '';
        veicoloElement.appendChild(element);
      });
      
      root.appendChild(veicoloElement);
    });
    
    // Convertiamo il documento XML in stringa
    const serializer = new XMLSerializer();
    const xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n' + 
                      serializer.serializeToString(xmlDoc);
    
    // Salviamo effettivamente il file XML tramite una chiamata API
    axios.post('/api/salva-xml', {
      filename: 'veicoli.xml',
      content: xmlString
    })
    .then(response => {
      toast({
        title: 'Operazione completata',
        description: 'I dati dei veicoli sono stati salvati nel file XML.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    })
    .catch(error => {
      console.error('Errore nel salvataggio dei veicoli:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare i dati dei veicoli. Riprova più tardi.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    });

  }

  const handleSubmit = () => {
    const nuovoId = Date.now().toString()
    const nuovaLista = [...veicoli, { ...nuovoVeicolo, id: nuovoId }]
    setVeicoli(nuovaLista)
    salvaVeicoli(nuovaLista)
    setNuovoVeicolo({ targa: '', marca: '', modello: '', anno: '', km: '', cliente: '' })
    onClose()
  }

  return (
    <Box p={4}>
      <Heading size="lg" mb={6}>Gestione Veicoli</Heading>
      
      <Button colorScheme="blue" onClick={onOpen} mb={4}>
        + Nuovo Veicolo
      </Button>

      <Table variant="simple" size="sm" style={{ tableLayout: 'fixed', width: '100%' }}>
        <Thead>
          <Tr>
            <Th width="15%">Targa</Th>
            <Th width="15%">Marca</Th>
            <Th width="15%">Modello</Th>
            <Th width="12%">Anno</Th>
            <Th width="12%">Km</Th>
            <Th width="15%">Azioni</Th>
          </Tr>
        </Thead>
        <Tbody>
          {veicoli.map(veicolo => (
            <Tr key={veicolo.id}>
              <Td>{veicolo.targa}</Td>
              <Td>{veicolo.marca}</Td>
              <Td>{veicolo.modello}</Td>
              <Td>{veicolo.anno}</Td>
              <Td>{veicolo.km}</Td>
              <Td>
                <Tooltip label="Modifica veicolo" placement="top">
                  <IconButton
                    icon={<FiEdit />}
                    size="sm"
                    mr={2}
                    aria-label="Modifica veicolo"
                  />
                </Tooltip>
                <Tooltip label="Elimina veicolo" placement="top">
                  <IconButton
                    icon={<FiTrash2 />}
                    size="sm"
                    colorScheme="red"
                    aria-label="Elimina veicolo"
                  />
                </Tooltip>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nuovo Veicolo</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Targa</FormLabel>
                <Input value={nuovoVeicolo.targa} onChange={(e) => setNuovoVeicolo({...nuovoVeicolo, targa: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Marca</FormLabel>
                <Input value={nuovoVeicolo.marca} onChange={(e) => setNuovoVeicolo({...nuovoVeicolo, marca: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Modello</FormLabel>
                <Input value={nuovoVeicolo.modello} onChange={(e) => setNuovoVeicolo({...nuovoVeicolo, modello: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Anno</FormLabel>
                <Input type="number" value={nuovoVeicolo.anno} onChange={(e) => setNuovoVeicolo({...nuovoVeicolo, anno: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Chilometraggio</FormLabel>
                <Input type="number" value={nuovoVeicolo.km} onChange={(e) => setNuovoVeicolo({...nuovoVeicolo, km: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Cliente Associato</FormLabel>
                <Select placeholder="Seleziona cliente" value={nuovoVeicolo.cliente} onChange={(e) => setNuovoVeicolo({...nuovoVeicolo, cliente: e.target.value})}>
                  {veicoli.map(veicolo => (
                    <option key={veicolo.id} value={veicolo.cliente}>
                      {veicolo.cliente}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmit}>Salva</Button>
            <Button onClick={onClose}>Annulla</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
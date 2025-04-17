import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, FormControl, FormLabel, Input, VStack, Select, useToast, IconButton, Tooltip } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { FiEdit, FiTrash2 } from 'react-icons/fi'
import axios from 'axios'

export default function Ricambi() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [ricambi, setRicambi] = useState([])
  const toast = useToast()
  
  useEffect(() => {
    // Carica i ricambi dal file XML
    caricaRicambi()
  }, [])

  const [nuovoRicambio, setNuovoRicambio] = useState({
    codice: '',
    descrizione: '',
    marca: '',
    prezzo: '',
    quantita: '',
    categoria: ''
  })

  // Funzione per caricare i ricambi dal file XML
  const caricaRicambi = () => {
    axios.get('/ricambi.xml', {
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/xml'
      }
    })
    .then(response => {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(response.data, 'text/xml')
      const ricambiElements = xmlDoc.getElementsByTagName('ricambio')
      
      const ricambiList = []
      for (let i = 0; i < ricambiElements.length; i++) {
        const ricambio = ricambiElements[i]
        ricambiList.push({
          id: ricambio.getElementsByTagName('id')[0].textContent,
          codice: ricambio.getElementsByTagName('codice')[0].textContent,
          descrizione: ricambio.getElementsByTagName('descrizione')[0].textContent,
          marca: ricambio.getElementsByTagName('marca')[0].textContent,
          prezzo: ricambio.getElementsByTagName('prezzo')[0].textContent,
          quantita: ricambio.getElementsByTagName('quantita')[0].textContent,
          categoria: ricambio.getElementsByTagName('categoria')[0].textContent
        })
      }
      
      setRicambi(ricambiList)
    })
    .catch(error => {
      console.error('Errore nel caricamento dei ricambi:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i ricambi. Riprova più tardi.',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    })
  }

  // Funzione per salvare i ricambi nel file XML
  const salvaRicambi = (nuovaLista) => {
    // Creiamo il documento XML
    const xmlDoc = document.implementation.createDocument(null, "ricambi", null);
    const root = xmlDoc.documentElement;
    
    // Aggiungiamo ogni ricambio al documento XML
    nuovaLista.forEach(ricambio => {
      const ricambioElement = xmlDoc.createElement("ricambio");
      
      // Aggiungiamo tutti i campi del ricambio
      const campi = ['id', 'codice', 'descrizione', 'marca', 'prezzo', 'quantita', 'categoria'];
      campi.forEach(campo => {
        const element = xmlDoc.createElement(campo);
        element.textContent = ricambio[campo] || '';
        ricambioElement.appendChild(element);
      });
      
      root.appendChild(ricambioElement);
    });
    
    // Convertiamo il documento XML in stringa
    const serializer = new XMLSerializer();
    const xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n' + 
                    serializer.serializeToString(xmlDoc);
    
    // Salviamo effettivamente il file XML tramite una chiamata API
    axios.post('/api/salva-xml', {
      filename: 'ricambi.xml',
      content: xmlString
    })
    .then(response => {
      toast({
        title: 'Operazione completata',
        description: 'I dati dei ricambi sono stati salvati nel file XML.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    })
    .catch(error => {
      console.error('Errore nel salvataggio dei ricambi:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare i dati dei ricambi. Riprova più tardi.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    });
  }

  const handleSubmit = () => {
    const nuovoId = Date.now().toString()
    const nuovaLista = [...ricambi, { ...nuovoRicambio, id: nuovoId }]
    setRicambi(nuovaLista)
    salvaRicambi(nuovaLista)
    setNuovoRicambio({ codice: '', descrizione: '', marca: '', prezzo: '', quantita: '', categoria: '' })
    onClose()
  }

  return (
    <Box p={4}>
      <Heading size="lg" mb={6}>Gestione Ricambi</Heading>
      
      <Button colorScheme="blue" onClick={onOpen} mb={4}>
        + Nuovo Ricambio
      </Button>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Codice</Th>
            <Th>Descrizione</Th>
            <Th>Marca</Th>
            <Th>Prezzo</Th>
            <Th>Quantità</Th>
            <Th>Azioni</Th>
          </Tr>
        </Thead>
        <Tbody>
          {ricambi.map(ricambio => (
            <Tr key={ricambio.id}>
              <Td>{ricambio.codice}</Td>
              <Td>{ricambio.descrizione}</Td>
              <Td>{ricambio.marca}</Td>
              <Td>€{ricambio.prezzo}</Td>
              <Td>{ricambio.quantita}</Td>
              <Td>
                <Tooltip label="Modifica ricambio" placement="top">
                  <IconButton
                    icon={<FiEdit />}
                    size="sm"
                    mr={2}
                    aria-label="Modifica ricambio"
                  />
                </Tooltip>
                <Tooltip label="Elimina ricambio" placement="top">
                  <IconButton
                    icon={<FiTrash2 />}
                    size="sm"
                    colorScheme="red"
                    aria-label="Elimina ricambio"
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
          <ModalHeader>Nuovo Ricambio</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Codice</FormLabel>
                <Input value={nuovoRicambio.codice} onChange={(e) => setNuovoRicambio({...nuovoRicambio, codice: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Descrizione</FormLabel>
                <Input value={nuovoRicambio.descrizione} onChange={(e) => setNuovoRicambio({...nuovoRicambio, descrizione: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Marca</FormLabel>
                <Input value={nuovoRicambio.marca} onChange={(e) => setNuovoRicambio({...nuovoRicambio, marca: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Prezzo</FormLabel>
                <Input type="number" value={nuovoRicambio.prezzo} onChange={(e) => setNuovoRicambio({...nuovoRicambio, prezzo: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Quantità</FormLabel>
                <Input type="number" value={nuovoRicambio.quantita} onChange={(e) => setNuovoRicambio({...nuovoRicambio, quantita: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Categoria</FormLabel>
                <Select placeholder="Seleziona categoria" value={nuovoRicambio.categoria} onChange={(e) => setNuovoRicambio({...nuovoRicambio, categoria: e.target.value})}>
                  <option value="Freni">Freni</option>
                  <option value="Lubrificanti">Lubrificanti</option>
                  <option value="Filtri">Filtri</option>
                  <option value="Elettronica">Elettronica</option>
                  <option value="Carrozzeria">Carrozzeria</option>
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
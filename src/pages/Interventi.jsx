import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, FormControl, FormLabel, Input, VStack, Select, Tag, useToast, IconButton, Tooltip } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { FiEdit, FiTrash2 } from 'react-icons/fi'
import axios from 'axios'

export default function Interventi() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [interventi, setInterventi] = useState([])
  const toast = useToast()
  
  // Funzione per formattare la data nel formato italiano (dd/mm/yyyy)
  const formattaData = (dataString) => {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  useEffect(() => {
    // Carica gli interventi dal file XML
    caricaInterventi()
  }, [])
  
  const [nuovoIntervento, setNuovoIntervento] = useState({
    data: new Date().toISOString().split('T')[0],
    cliente: '',
    veicolo: '',
    problema: '',
    tecnico: '',
    stato: 'aperto'
  })

  const stati = [
    { value: 'aperto', label: 'Aperto', color: 'blue' },
    { value: 'lavorazione', label: 'In Lavorazione', color: 'orange' },
    { value: 'completato', label: 'Completato', color: 'green' }
  ]

  // Funzione per caricare gli interventi dal file XML
  const caricaInterventi = () => {
    axios.get('/interventi.xml', {
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/xml'
      }
    })
    .then(response => {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(response.data, 'text/xml')
      const interventiElements = xmlDoc.getElementsByTagName('intervento')
      
      const interventiList = []
      for (let i = 0; i < interventiElements.length; i++) {
        const intervento = interventiElements[i]
        interventiList.push({
          id: intervento.getElementsByTagName('id')[0].textContent,
          data: intervento.getElementsByTagName('data')[0].textContent,
          cliente: intervento.getElementsByTagName('cliente')[0].textContent,
          veicolo: intervento.getElementsByTagName('veicolo')[0].textContent,
          problema: intervento.getElementsByTagName('problema')[0].textContent,
          tecnico: intervento.getElementsByTagName('tecnico')[0].textContent,
          stato: intervento.getElementsByTagName('stato')[0].textContent
        })
      }
      
      setInterventi(interventiList)
    })
    .catch(error => {
      console.error('Errore nel caricamento degli interventi:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile caricare gli interventi. Riprova più tardi.',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    })
  }

  // Funzione per salvare gli interventi nel file XML
  const salvaInterventi = (nuovaLista) => {
    // Creiamo il documento XML
    const xmlDoc = document.implementation.createDocument(null, "interventi", null);
    const root = xmlDoc.documentElement;
    
    // Aggiungiamo ogni intervento al documento XML
    nuovaLista.forEach(intervento => {
      const interventoElement = xmlDoc.createElement("intervento");
      
      // Aggiungiamo tutti i campi dell'intervento
      const campi = ['id', 'data', 'cliente', 'veicolo', 'problema', 'tecnico', 'stato'];
      campi.forEach(campo => {
        const element = xmlDoc.createElement(campo);
        element.textContent = intervento[campo] || '';
        interventoElement.appendChild(element);
      });
      
      root.appendChild(interventoElement);
    });
    
    // Convertiamo il documento XML in stringa
    const serializer = new XMLSerializer();
    const xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n' + 
                      serializer.serializeToString(xmlDoc);
    
    // Salviamo effettivamente il file XML tramite una chiamata API
    axios.post('/api/salva-xml', {
      filename: 'interventi.xml',
      content: xmlString
    })
    .then(response => {
      toast({
        title: 'Operazione completata',
        description: 'I dati degli interventi sono stati salvati nel file XML.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    })
    .catch(error => {
      console.error('Errore nel salvataggio degli interventi:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare i dati degli interventi. Riprova più tardi.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    });
  }

  const handleSubmit = () => {
    const nuovoId = Date.now().toString()
    const nuovaLista = [...interventi, { ...nuovoIntervento, id: nuovoId }]
    setInterventi(nuovaLista)
    salvaInterventi(nuovaLista)
    setNuovoIntervento({
      data: new Date().toISOString().split('T')[0],
      cliente: '',
      veicolo: '',
      problema: '',
      tecnico: '',
      stato: 'aperto'
    })
    onClose()
  }

  return (
    <Box p={4}>
      <Heading size="lg" mb={6}>Gestione Interventi</Heading>
      
      <Button colorScheme="blue" onClick={onOpen} mb={4}>
        + Nuovo Intervento
      </Button>

      <Table variant="simple" size="sm" style={{ tableLayout: 'fixed', width: '100%' }}>
        <Thead>
          <Tr>
            <Th width="10%">ID</Th>
            <Th width="20%">Veicolo</Th>
            <Th width="15%">Data</Th>
            <Th width="15%">Stato</Th>
            <Th width="20%">Tecnico</Th>
            <Th width="15%">Azioni</Th>
          </Tr>
        </Thead>
        <Tbody>
          {interventi.map(intervento => (
            <Tr key={intervento.id}>
              <Td>{intervento.id}</Td>
              <Td>{intervento.veicolo}</Td>
              <Td>{formattaData(intervento.data)}</Td>
              <Td>
                <Tag colorScheme={stati.find(s => s.value === intervento.stato)?.color}>
                  {stati.find(s => s.value === intervento.stato)?.label}
                </Tag>
              </Td>
              <Td>{intervento.tecnico}</Td>
              <Td>
                <Tooltip label="Modifica intervento" placement="top">
                  <IconButton
                    icon={<FiEdit />}
                    size="sm"
                    mr={2}
                    aria-label="Modifica intervento"
                  />
                </Tooltip>
                <Tooltip label="Elimina intervento" placement="top">
                  <IconButton
                    icon={<FiTrash2 />}
                    size="sm"
                    colorScheme="red"
                    aria-label="Elimina intervento"
                  />
                </Tooltip>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nuovo Intervento</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Data Ricezione</FormLabel>
                <Input type="date" value={nuovoIntervento.data} onChange={(e) => setNuovoIntervento({...nuovoIntervento, data: e.target.value})} />
              </FormControl>
              
              <FormControl>
                <FormLabel>Cliente</FormLabel>
                <Select placeholder="Seleziona cliente">
                  <option value="1">Cliente 1</option>
                  <option value="2">Cliente 2</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Veicolo</FormLabel>
                <Select placeholder="Seleziona veicolo">
                  <option value="1">Veicolo 1</option>
                  <option value="2">Veicolo 2</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Descrizione Problema</FormLabel>
                <Input value={nuovoIntervento.problema} onChange={(e) => setNuovoIntervento({...nuovoIntervento, problema: e.target.value})} />
              </FormControl>

              <FormControl>
                <FormLabel>Tecnico Assegnato</FormLabel>
                <Select placeholder="Seleziona tecnico" value={nuovoIntervento.tecnico} onChange={(e) => setNuovoIntervento({...nuovoIntervento, tecnico: e.target.value})}>
                  <option value="mario">Mario Rossi</option>
                  <option value="luigi">Luigi Bianchi</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Stato</FormLabel>
                <Select value={nuovoIntervento.stato} onChange={(e) => setNuovoIntervento({...nuovoIntervento, stato: e.target.value})}>
                  {stati.map(stato => (
                    <option key={stato.value} value={stato.value}>{stato.label}</option>
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
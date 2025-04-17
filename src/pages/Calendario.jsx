import { Box, Button, Heading, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, FormControl, FormLabel, Input, VStack, Select, useToast, Flex } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { it } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import axios from 'axios'

// Configurazione del localizzatore per il calendario
const locales = {
  'it': it,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

// Messaggi in italiano per il calendario
const messages = {
  allDay: 'Tutto il giorno',
  previous: 'Precedente',
  next: 'Successivo',
  today: 'Oggi',
  month: 'Mese',
  week: 'Settimana',
  day: 'Giorno',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Ora',
  event: 'Evento',
  noEventsInRange: 'Nessun appuntamento in questo periodo',
}

export default function Calendario() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [appuntamenti, setAppuntamenti] = useState([])
  const [nuovoAppuntamento, setNuovoAppuntamento] = useState({
    titolo: '',
    inizio: new Date().toISOString().split('.')[0],
    fine: new Date(new Date().getTime() + 60*60*1000).toISOString().split('.')[0],
    cliente: '',
    veicolo: '',
    descrizione: '',
    tecnico: '',
    stato: 'aperto'
  })
  const toast = useToast()
  
  useEffect(() => {
    // Carica gli appuntamenti dal file XML
    caricaAppuntamenti()
  }, [])

  // Funzione per caricare gli appuntamenti dal file XML
  const caricaAppuntamenti = () => {
    axios.get('/calendario.xml', {
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/xml'
      }
    })
    .then(response => {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(response.data, 'text/xml')
      const appuntamentiElements = xmlDoc.getElementsByTagName('appuntamento')
      
      const appuntamentiList = []
      for (let i = 0; i < appuntamentiElements.length; i++) {
        const appuntamento = appuntamentiElements[i]
        appuntamentiList.push({
          id: appuntamento.getElementsByTagName('id')[0].textContent,
          title: appuntamento.getElementsByTagName('titolo')[0].textContent,
          start: new Date(appuntamento.getElementsByTagName('inizio')[0].textContent),
          end: new Date(appuntamento.getElementsByTagName('fine')[0].textContent),
          cliente: appuntamento.getElementsByTagName('cliente')[0].textContent,
          veicolo: appuntamento.getElementsByTagName('veicolo')[0].textContent,
          descrizione: appuntamento.getElementsByTagName('descrizione')[0].textContent,
          tecnico: appuntamento.getElementsByTagName('tecnico')[0].textContent,
          stato: appuntamento.getElementsByTagName('stato')[0].textContent
        })
      }
      
      setAppuntamenti(appuntamentiList)
    })
    .catch(error => {
      console.error('Errore nel caricamento degli appuntamenti:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile caricare gli appuntamenti. Riprova più tardi.',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    })
  }

  // Funzione per salvare gli appuntamenti nel file XML
  const salvaAppuntamenti = (nuovaLista) => {
    // Creiamo il documento XML
    const xmlDoc = document.implementation.createDocument(null, "calendario", null);
    const root = xmlDoc.documentElement;
    
    // Aggiungiamo ogni appuntamento al documento XML
    nuovaLista.forEach(appuntamento => {
      const appuntamentoElement = xmlDoc.createElement("appuntamento");
      
      // Aggiungiamo tutti i campi dell'appuntamento
      const campi = [
        { nome: 'id', valore: appuntamento.id },
        { nome: 'titolo', valore: appuntamento.title },
        { nome: 'inizio', valore: appuntamento.start.toISOString() },
        { nome: 'fine', valore: appuntamento.end.toISOString() },
        { nome: 'cliente', valore: appuntamento.cliente },
        { nome: 'veicolo', valore: appuntamento.veicolo },
        { nome: 'descrizione', valore: appuntamento.descrizione },
        { nome: 'tecnico', valore: appuntamento.tecnico },
        { nome: 'stato', valore: appuntamento.stato }
      ];
      
      campi.forEach(campo => {
        const element = xmlDoc.createElement(campo.nome);
        element.textContent = campo.valore || '';
        appuntamentoElement.appendChild(element);
      });
      
      root.appendChild(appuntamentoElement);
    });
    
    // Convertiamo il documento XML in stringa
    const serializer = new XMLSerializer();
    const xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n' + 
                      serializer.serializeToString(xmlDoc);
    
    // Salviamo effettivamente il file XML tramite una chiamata API
    axios.post('/api/salva-xml', {
      filename: 'calendario.xml',
      content: xmlString
    })
    .then(response => {
      toast({
        title: 'Operazione completata',
        description: 'Gli appuntamenti sono stati salvati nel calendario.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    })
    .catch(error => {
      console.error('Errore nel salvataggio degli appuntamenti:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare gli appuntamenti. Riprova più tardi.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    });
  }

  const handleSubmit = () => {
    const nuovoId = Date.now().toString()
    const nuovoEvento = {
      id: nuovoId,
      title: nuovoAppuntamento.titolo,
      start: new Date(nuovoAppuntamento.inizio),
      end: new Date(nuovoAppuntamento.fine),
      cliente: nuovoAppuntamento.cliente,
      veicolo: nuovoAppuntamento.veicolo,
      descrizione: nuovoAppuntamento.descrizione,
      tecnico: nuovoAppuntamento.tecnico,
      stato: nuovoAppuntamento.stato
    }
    
    const nuovaLista = [...appuntamenti, nuovoEvento]
    setAppuntamenti(nuovaLista)
    salvaAppuntamenti(nuovaLista)
    
    setNuovoAppuntamento({
      titolo: '',
      inizio: new Date().toISOString().split('.')[0],
      fine: new Date(new Date().getTime() + 60*60*1000).toISOString().split('.')[0],
      cliente: '',
      veicolo: '',
      descrizione: '',
      tecnico: '',
      stato: 'aperto'
    })
    
    onClose()
  }

  // Gestione del click su un evento del calendario
  const handleEventClick = (event) => {
    console.log('Evento cliccato:', event)
    // Qui si potrebbe aprire un modale per visualizzare i dettagli o modificare l'evento
  }

  return (
    <Box p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Calendario Appuntamenti</Heading>
        <Button colorScheme="blue" onClick={onOpen}>
          + Nuovo Appuntamento
        </Button>
      </Flex>
      
      <Box height="75vh" bg="white" p={4} borderRadius="md" boxShadow="sm">
        <Calendar
          localizer={localizer}
          events={appuntamenti}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          messages={messages}
          onSelectEvent={handleEventClick}
          views={['month', 'week', 'day', 'agenda']}
        />
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nuovo Appuntamento</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Titolo</FormLabel>
                <Input 
                  value={nuovoAppuntamento.titolo} 
                  onChange={(e) => setNuovoAppuntamento({...nuovoAppuntamento, titolo: e.target.value})}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Data e ora inizio</FormLabel>
                <Input 
                  type="datetime-local" 
                  value={nuovoAppuntamento.inizio} 
                  onChange={(e) => setNuovoAppuntamento({...nuovoAppuntamento, inizio: e.target.value})}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Data e ora fine</FormLabel>
                <Input 
                  type="datetime-local" 
                  value={nuovoAppuntamento.fine} 
                  onChange={(e) => setNuovoAppuntamento({...nuovoAppuntamento, fine: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Cliente</FormLabel>
                <Input 
                  value={nuovoAppuntamento.cliente} 
                  onChange={(e) => setNuovoAppuntamento({...nuovoAppuntamento, cliente: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Veicolo</FormLabel>
                <Input 
                  value={nuovoAppuntamento.veicolo} 
                  onChange={(e) => setNuovoAppuntamento({...nuovoAppuntamento, veicolo: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Descrizione</FormLabel>
                <Input 
                  value={nuovoAppuntamento.descrizione} 
                  onChange={(e) => setNuovoAppuntamento({...nuovoAppuntamento, descrizione: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Tecnico</FormLabel>
                <Input 
                  value={nuovoAppuntamento.tecnico} 
                  onChange={(e) => setNuovoAppuntamento({...nuovoAppuntamento, tecnico: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Stato</FormLabel>
                <Select 
                  value={nuovoAppuntamento.stato} 
                  onChange={(e) => setNuovoAppuntamento({...nuovoAppuntamento, stato: e.target.value})}
                >
                  <option value="aperto">Aperto</option>
                  <option value="lavorazione">In Lavorazione</option>
                  <option value="completato">Completato</option>
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
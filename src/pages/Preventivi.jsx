import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, FormControl, FormLabel, Input, VStack, Select, useToast, IconButton, Tooltip } from '@chakra-ui/react'
import { FiEdit, FiTrash2 } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import axios from 'axios';

pdfMake.vfs = pdfFonts.vfs;

export default function Preventivi() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [documenti, setDocumenti] = useState([]);
  const toast = useToast();
  
  useEffect(() => {
    // Carica i documenti dal file XML
    caricaDocumenti();
  }, []);
  const [nuovoDocumento, setNuovoDocumento] = useState({
    tipo: 'preventivo',
    cliente: '',
    veicolo: '',
    descrizione: '',
    importo: '',
    data: new Date().toISOString().split('T')[0] // Formato ISO per il valore interno
  })

  // Funzione per caricare i documenti dal file XML
  const caricaDocumenti = () => {
    axios.get('/preventivi.xml', {
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/xml'
      }
    })
    .then(response => {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(response.data, 'text/xml')
      const documentiElements = xmlDoc.getElementsByTagName('documento')
      
      const documentiList = []
      for (let i = 0; i < documentiElements.length; i++) {
        const documento = documentiElements[i]
        documentiList.push({
          id: documento.getElementsByTagName('id')[0].textContent,
          tipo: documento.getElementsByTagName('tipo')[0].textContent,
          cliente: documento.getElementsByTagName('cliente')[0].textContent,
          veicolo: documento.getElementsByTagName('veicolo')[0].textContent,
          descrizione: documento.getElementsByTagName('descrizione')[0].textContent,
          importo: documento.getElementsByTagName('importo')[0].textContent,
          data: documento.getElementsByTagName('data')[0].textContent
        })
      }
      
      setDocumenti(documentiList)
    })
    .catch(error => {
      console.error('Errore nel caricamento dei documenti:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i documenti. Riprova più tardi.',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    })
  }

  // Funzione per salvare i documenti nel file XML
  const salvaDocumenti = (nuovaLista) => {
    // Creiamo il documento XML
    const xmlDoc = document.implementation.createDocument(null, "documenti", null);
    const root = xmlDoc.documentElement;
    
    // Aggiungiamo ogni documento al documento XML
    nuovaLista.forEach(documento => {
      const documentoElement = xmlDoc.createElement("documento");
      
      // Aggiungiamo tutti i campi del documento
      const campi = ['id', 'tipo', 'cliente', 'veicolo', 'descrizione', 'importo', 'data'];
      campi.forEach(campo => {
        const element = xmlDoc.createElement(campo);
        element.textContent = documento[campo] || '';
        documentoElement.appendChild(element);
      });
      
      root.appendChild(documentoElement);
    });
    
    // Convertiamo il documento XML in stringa
    const serializer = new XMLSerializer();
    const xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n' + 
                    serializer.serializeToString(xmlDoc);
    
    // Salviamo effettivamente il file XML tramite una chiamata API
    axios.post('/api/salva-xml', {
      filename: 'preventivi.xml',
      content: xmlString
    })
    .then(response => {
      toast({
        title: 'Operazione completata',
        description: 'I dati dei documenti sono stati salvati nel file XML.',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    })
    .catch(error => {
      console.error('Errore nel salvataggio dei documenti:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare i dati dei documenti. Riprova più tardi.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    });
  }

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

  const generaPDF = () => {
    // Aggiungiamo il documento alla lista e salviamo
    const nuovoId = Date.now().toString();
    const nuovaLista = [...documenti, { ...nuovoDocumento, id: nuovoId }];
    setDocumenti(nuovaLista);
    salvaDocumenti(nuovaLista);
    
    // Otteniamo i dati dell'azienda dal file XML
    axios.get('/impostazioni.xml', {
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/xml'
      }
    })
    .then(response => {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(response.data, 'text/xml')
      const aziendaElement = xmlDoc.getElementsByTagName('azienda')[0]
      
      const azienda = {
        nome: aziendaElement.getElementsByTagName('nome')[0]?.textContent || '',
        indirizzo: aziendaElement.getElementsByTagName('indirizzo')[0]?.textContent || '',
        piva: aziendaElement.getElementsByTagName('piva')[0]?.textContent || '',
        telefono: aziendaElement.getElementsByTagName('telefono')[0]?.textContent || '',
        email: aziendaElement.getElementsByTagName('email')[0]?.textContent || ''
      };
      const docDefinition = {
        content: [
          { text: azienda.nome || 'Nome Azienda', style: 'header' },
          { text: `${azienda.indirizzo || ''} ${azienda.piva ? ' - P.IVA ' + azienda.piva : ''}`, style: 'subheader' },
          { text: `PREVENTIVO N.${documenti.length + 1}`, style: 'docTitle' },
          { text: `Data: ${formattaData(new Date().toISOString())}`, margin: [0, 10] },
          { text: 'Dati Cliente:', style: 'sectionHeader' },
          { text: `Nominativo: ${nuovoDocumento.cliente}` },
          { text: `Veicolo: ${nuovoDocumento.veicolo}` },
          { text: 'Dettagli Intervento:', style: 'sectionHeader' },
          { text: nuovoDocumento.descrizione },
          { text: `Importo: €${nuovoDocumento.importo}`, style: 'importo' }
        ],
        styles: {
          header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
          subheader: { fontSize: 10, margin: [0, 0, 0, 15] },
          docTitle: { fontSize: 16, bold: true, margin: [0, 10, 0, 20] },
          sectionHeader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] },
          importo: { fontSize: 14, bold: true, margin: [0, 20, 0, 0] }
        }
      };

      pdfMake.createPdf(docDefinition).open();
      onClose();
    });
  }

  return (
    <Box p={4}>
      <Heading size="lg" mb={6}>Gestione Preventivi</Heading>
      
      <Button colorScheme="blue" onClick={onOpen} mb={4}>
        + Nuovo Preventivo
      </Button>

      <Table variant="simple" size="sm" style={{ tableLayout: 'fixed', width: '100%' }}>
        <Thead>
          <Tr>
            <Th width="10%">Numero</Th>
            <Th width="25%">Cliente</Th>
            <Th width="15%">Importo</Th>
            <Th width="15%">Data</Th>
            <Th width="20%">Azioni</Th>
          </Tr>
        </Thead>
        <Tbody>
          {documenti.map((doc, index) => (
            <Tr key={index}>
              <Td width="10%">#{index + 1}</Td>
              <Td width="25%" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.cliente}</Td>
              <Td width="15%" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>€{doc.importo}</Td>
              <Td width="15%" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formattaData(doc.data)}</Td>
              <Td width="20%" style={{ overflow: 'visible' }}>
                <Tooltip label="Modifica documento" placement="top">
                  <IconButton
                    icon={<FiEdit />}
                    size="sm"
                    mr={2}
                    aria-label="Modifica documento"
                    onClick={() => {
                      setNuovoDocumento(doc);
                      onOpen();
                    }}
                  />
                </Tooltip>
                <Tooltip label="Elimina documento" placement="top">
                  <IconButton
                    icon={<FiTrash2 />}
                    size="sm"
                    colorScheme="red"
                    aria-label="Elimina documento"
                    onClick={() => {
                      const nuovaLista = documenti.filter(item => item.id !== doc.id);
                      setDocumenti(nuovaLista);
                      salvaDocumenti(nuovaLista);
                      toast({
                        title: 'Documento eliminato',
                        description: 'Il documento è stato eliminato con successo',
                        status: 'success',
                        duration: 3000,
                        isClosable: true
                      });
                    }}
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
          <ModalHeader>Nuovo Preventivo</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>

              <FormControl>
                <FormLabel>Cliente</FormLabel>
                <Select placeholder="Seleziona cliente" value={nuovoDocumento.cliente} onChange={(e) => setNuovoDocumento({...nuovoDocumento, cliente: e.target.value})}>
  {documenti.map((doc, index) => (
    <option key={index} value={doc.cliente}>
      {doc.cliente}
    </option>
  ))}
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
                <FormLabel>Descrizione Lavori</FormLabel>
                <Input value={nuovoDocumento.descrizione} onChange={(e) => setNuovoDocumento({...nuovoDocumento, descrizione: e.target.value})} />
              </FormControl>

              <FormControl>
                <FormLabel>Importo</FormLabel>
                <Input type="number" value={nuovoDocumento.importo} onChange={(e) => setNuovoDocumento({...nuovoDocumento, importo: e.target.value})} />
              </FormControl>
              
              <FormControl>
                <FormLabel>Data</FormLabel>
                <Input type="date" value={nuovoDocumento.data} onChange={(e) => setNuovoDocumento({...nuovoDocumento, data: e.target.value})} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={generaPDF}>Genera PDF</Button>
            <Button onClick={onClose}>Annulla</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
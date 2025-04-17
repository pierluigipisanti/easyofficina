import { Button, FormControl, FormLabel, Input, VStack, Heading, useToast, Image } from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Login() {
  const [credentials, setCredentials] = useState([])
  const [formData, setFormData] = useState({ username: '', password: '' })
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    // Carica le credenziali dal file XML
    axios.get('/credentials.xml', {
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/xml'
      }
    })
    .then(response => {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(response.data, 'text/xml')
      const users = xmlDoc.getElementsByTagName('user')
      
      const userList = []
      for (let i = 0; i < users.length; i++) {
        const user = users[i]
        userList.push({
          username: user.getElementsByTagName('username')[0].textContent,
          password: user.getElementsByTagName('password')[0].textContent,
          role: user.getElementsByTagName('role')[0].textContent
        })
      }
      
      setCredentials(userList)
    })
    .catch(error => {
      console.error('Errore nel caricamento delle credenziali:', error)
      toast({
        title: 'Errore',
        description: 'Impossibile caricare le credenziali. Contattare l\'amministratore.',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    })
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleLogin = () => {
    const user = credentials.find(
      user => user.username === formData.username && user.password === formData.password
    )

    if (user) {
      // Salva le informazioni dell'utente nelle impostazioni XML
      // In un'applicazione reale, qui ci sarebbe una chiamata API per aggiornare il file XML
      // Per questa demo, simuliamo il salvataggio
      
      // Aggiorniamo le impostazioni con l'utente corrente
      const userInfo = {
        username: user.username,
        role: user.role
      };
     
      // Salva l'utente nel localStorage
      try {
        localStorage.setItem('loggedInUser', JSON.stringify(userInfo));
      } catch (e) {
        console.error("Errore nel salvataggio dell'utente in localStorage", e);
        toast({
          title: 'Errore locale',
          description: 'Impossibile salvare le informazioni utente localmente.',
          status: 'warning',
          duration: 3000,
          isClosable: true
        });
      }
  
      console.log('Utente autenticato:', userInfo);
      
      toast({
        title: 'Accesso effettuato',
        description: `Benvenuto, ${user.username}!`, 
        status: 'success',
        duration: 3000,
        isClosable: true
      })
      
      navigate('/dashboard')
    } else {
      toast({
        title: 'Errore di accesso',
        description: 'Username o password non validi',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }

  return (
    <VStack spacing={4} maxW="400px" m="auto" mt={20}> {/* Aggiunto margine superiore */}
      {/* Aggiunta immagine logo */}
      <Image src="/logo.png" alt="Logo Officina" boxSize="150px" objectFit="contain" mb={6} />
      <Heading as="h1" size="xl">Accesso Officina</Heading>
      <FormControl>
        <FormLabel>Username</FormLabel>
        <Input 
          name="username" 
          placeholder="Inserisci username" 
          value={formData.username}
          onChange={handleChange}
        />
      </FormControl>
      
      <FormControl>
        <FormLabel>Password</FormLabel>
        <Input 
          type="password" 
          name="password"
          placeholder="Inserisci password" 
          value={formData.password}
          onChange={handleChange}
        />
      </FormControl>

      <Button colorScheme="blue" w="full" onClick={handleLogin}>Accedi</Button>
      
      <Button as={Link} to="/recupera-password" variant="link">
        Recupera password
      </Button>
    </VStack>
  )
}
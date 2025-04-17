import { Flex, Box, Heading } from '@chakra-ui/react'

export default function Dashboard() {
  return (
    <Box w="100%">
      <Heading size="lg" mb={6}>Dashboard</Heading>
      
      {/* Widgets Grid */}
      <Flex gap={4} flexWrap="wrap">
        <Box bg="white" p={4} borderRadius="md" boxShadow="md" minW="300px" flex={1}>
          <Heading size="md" mb={4}>Prossimi Interventi</Heading>
          {/* Placeholder contenuto */}
        </Box>
        
        <Box bg="white" p={4} borderRadius="md" boxShadow="md" minW="300px" flex={1}>
          <Heading size="md" mb={4}>Interventi in Lavorazione</Heading>
          {/* Placeholder contenuto */}
        </Box>
      </Flex>
    </Box>
  )
}
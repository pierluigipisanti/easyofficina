# Officina Manager

Officina Manager è un'applicazione web progettata per aiutare le officine meccaniche nella gestione quotidiana delle loro attività.

## Funzionalità Principali

L'applicazione offre le seguenti funzionalità:

*   **Gestione Clienti:** Anagrafica completa dei clienti, con possibilità di aggiungere, modificare ed eliminare record.
*   **Gestione Veicoli:** Registrazione dei veicoli associati ai clienti, inclusi dettagli come targa, marca, modello, anno e chilometraggio.
*   **Gestione Interventi:** Tracciamento degli interventi di manutenzione e riparazione effettuati sui veicoli, con dettagli su data, descrizione, ricambi utilizzati e costi.
*   **Gestione Preventivi:** Creazione e gestione di preventivi per i clienti.
*   **Calendario Appuntamenti:** Visualizzazione e gestione degli appuntamenti per interventi e consegne.
*   **Gestione Ricambi:** Catalogo dei ricambi disponibili in magazzino, con codice, descrizione, marca, prezzo e quantità.
*   **Impostazioni:** Configurazione delle preferenze dell'applicazione.

## Architettura Tecnica

*   **Frontend:** L'interfaccia utente è costruita utilizzando [React](https://reactjs.org/) e [Vite](https://vitejs.dev/) per un'esperienza di sviluppo rapida e moderna.
*   **UI Framework:** Viene utilizzata la libreria [Chakra UI](https://chakra-ui.com/) per componenti UI reattivi e accessibili.
*   **Routing:** La navigazione tra le diverse sezioni dell'applicazione è gestita con [React Router DOM](https://reactrouter.com/).
*   **Data Persistence:** I dati dell'applicazione (clienti, veicoli, interventi, ecc.) vengono salvati localmente in file XML situati nella cartella `public`. Questo approccio è stato scelto per semplicità in questa fase del progetto.
*   **Interazioni con i Dati:** Le operazioni di lettura e scrittura sui file XML sono gestite tramite logica implementata nel frontend.

## Installazione e Avvio

1.  **Clonare il repository (se applicabile):**
    ```bash
    # git clone <URL_DEL_REPOSITORY>
    # cd officina-manager
    ```
2.  **Installare le dipendenze:**
    ```bash
    npm install
    ```
3.  **Avviare il server di sviluppo:**
    ```bash
    npm run dev
    ```
    L'applicazione sarà accessibile all'indirizzo indicato da Vite (solitamente `http://localhost:5173`).

## Build per la Produzione

Per creare una build ottimizzata per la produzione:

```bash
npm run build
```

Questo comando genererà i file statici nella cartella `dist`.

## Linting

Per controllare la qualità del codice:

```bash
npm run lint
```

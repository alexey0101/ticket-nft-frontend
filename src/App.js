import React, { useEffect, useState } from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import web3 from './utils/web3';
import { contractAddress, contractABI } from './contracts/contractConfig';
import CreateEvent from './components/CreateEvent';
import EventList from './components/EventList';
import MyTickets from './components/MyTickets';
import Home from './components/Home';
import VerifyQrCode from './components/VerifyQrCode';
import { createTheme, ThemeProvider, CssBaseline, Container, Typography, AppBar, Toolbar, Button, Switch, Alert, Box } from '@mui/material';
import { lightTheme, darkTheme } from './themes';

const App = () => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [networkError, setNetworkError] = useState('');
  const [sepoliaConnected, setSepoliaConnected] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const themeMode = theme === 'light' ? lightTheme : darkTheme;

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const targetNetworkId = '0xaa36a7';

  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
          setNetworkError('Аккаунты не найдены. Пожалуйста, убедитесь, что ваш кошелек подключен.');
          return;
        }

        setAccount(accounts[0]);

        const networkId = await web3.eth.net.getId();
        if (networkId.toString() !== parseInt(targetNetworkId, 16).toString()) {
          setNetworkError('Пожалуйста, подключитесь к сети Sepolia.');
        } else {
          const contractInstance = new web3.eth.Contract(contractABI, contractAddress);
          setContract(contractInstance);
          window.contract = contractInstance;
          setSepoliaConnected(true);
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 5000);
        }

        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          } else {
            setNetworkError('Аккаунты не найдены. Пожалуйста, убедитесь, что ваш кошелек подключен.');
          }
        });

        window.ethereum.on('chainChanged', (_chainId) => window.location.reload());
      } catch (error) {
        console.error("Ошибка загрузки данных блокчейна:", error);
        setNetworkError("Ошибка загрузки данных блокчейна. Пожалуйста, убедитесь, что вы подключены к правильной сети.");
      }
    };

    loadBlockchainData();
  }, []);

  return (
    <ThemeProvider theme={themeMode}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" component={Link} to="/" style={{ textTransform: 'none' }}>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              NFT Tickets
            </Typography>
          </Button>
          <Box display="flex" alignItems="center" flexGrow={1}>
            <Button color="inherit" component={Link} to="/events">События</Button>
            <Button color="inherit" component={Link} to="/tickets">Мои Билеты</Button>
            <Button color="inherit" component={Link} to="/verify-qr">Проверить QR код</Button>
          </Box>
          <Box display="flex" alignItems="center">
            <Typography variant="body2" style={{ marginRight: '8px' }}>
              Темная Тема
            </Typography>
            <Switch checked={theme === 'dark'} onChange={toggleTheme} />
          </Box>
          <Box display="flex" alignItems="center" ml={2}>
            <Typography variant="body2">
              Аккаунт: {account}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container>
        {networkError && (
          <Alert severity="error">
            {networkError}
          </Alert>
        )}
        {showSuccessMessage && sepoliaConnected && (
          <Alert severity="success">
            Успешное подключение к Sepolia.
          </Alert>
        )}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={contract ? (
            <div className="row">
              <div className="col-md-4">
                <CreateEvent account={account} contract={contract} />
              </div>
              <div className="col-md-8">
                <EventList contract={contract} />
              </div>
            </div>
          ) : <Typography variant="h6">Загрузка контракта...</Typography>} />
          <Route path="/tickets" element={contract ? (
            <MyTickets account={account} contract={contract} />
          ) : <Typography variant="h6">Загрузка контракта...</Typography>} />
          <Route path="/verify-qr" element={contract ? (
            <VerifyQrCode contract={contract} />
          ) : <Typography variant="h6">Загрузка контракта...</Typography>} />
        </Routes>
      </Container>
    </ThemeProvider>
  );
};

export default App;

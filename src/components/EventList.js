import React, { useEffect, useState } from 'react';
import web3 from '../utils/web3';
import { Button, Card, Container, Grid, TextField, Typography, Alert } from '@mui/material';

const EventList = ({ contract }) => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventCount = await contract.methods.getEventCount().call();
        const events = [];
        for (let i = 1; i <= eventCount; i++) {
          const event = await contract.methods.getEventDetails(i).call();
          events.push(event);
        }
        setEvents(events);
        setFilteredEvents(events);
      } catch (error) {
        console.error("Error loading events:", error);
        setErrorMessage("Error loading events. Please try again later.");
      }
    };

    loadEvents();
  }, [contract]);

  const purchaseTicket = async (eventId, ticketPrice) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      await contract.methods.purchaseTicket(eventId).send({ from: account, value: ticketPrice });
    } catch (error) {
      console.error("Error purchasing ticket:", error);
      setErrorMessage("Error purchasing ticket. Please try again.");
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterEvents(value, searchDate);
  };

  const handleDateSearch = (e) => {
    const value = e.target.value;
    setSearchDate(value);
    filterEvents(searchTerm, value);
  };

  const filterEvents = (term, date) => {
    const filtered = events.filter(event =>
      (event.name.toLowerCase().includes(term.toLowerCase()) ||
       event.location.toLowerCase().includes(term.toLowerCase())) &&
      (date === '' || event.date === date)
    );
    setFilteredEvents(filtered);
  };

  return (
    <Container>
      <Typography variant="h4" className="text-center mt-4">Список событий</Typography>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      <div className="event-search">
        <TextField
          label="Поиск событий по названию или местоположению"
          value={searchTerm}
          onChange={handleSearch}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Дата"
          type="date"
          value={searchDate}
          onChange={handleDateSearch}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      </div>
      <Grid container spacing={3} justifyContent="center">
        {filteredEvents.map(event => (
          <Grid item xs={12} md={6} lg={4} key={event.id}>
            <Card style={{ padding: '16px' }}>
              <div>
                <Typography variant="h5">{event.name}</Typography>
                <Typography>{event.date}</Typography>
                <Typography>{event.location}</Typography>
                <Typography>Цена: {web3.utils.fromWei(event.ticketPrice, 'ether')} ETH</Typography>
                <Typography>Доступно билетов: {Number(event.ticketsAvailable)}</Typography>
                <Button variant="contained" color="primary" onClick={() => purchaseTicket(event.id, event.ticketPrice)}>
                  Купить билет
                </Button>
              </div>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default EventList;

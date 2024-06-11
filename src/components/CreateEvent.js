import React, { useState } from 'react';
import { TextField, Button, Card, CardContent, Typography } from '@mui/material';

const CreateEvent = ({ account, contract }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [ticketsAvailable, setTicketsAvailable] = useState('');

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      await contract.methods.createEvent(name, date, location, ticketPrice, ticketsAvailable)
        .send({ from: account });
    } catch (error) {
      console.error("Ошибка создания события:", error);
    }
  };

  return (
    <Card style={{ backgroundColor: 'inherit', color: 'inherit' }}>
      <CardContent>
        <Typography variant="h5">Создать Событие</Typography>
        <form onSubmit={createEvent}>
          <TextField
            fullWidth
            label="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
            variant="outlined"
            InputLabelProps={{ style: { color: 'inherit' } }}
            InputProps={{ style: { color: 'inherit' } }}
          />
          <TextField
            fullWidth
            label="Дата"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            margin="normal"
            required
            variant="outlined"
            InputLabelProps={{ style: { color: 'inherit' }, shrink: true }}
            InputProps={{ style: { color: 'inherit' } }}
          />
          <TextField
            fullWidth
            label="Местоположение"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            margin="normal"
            required
            variant="outlined"
            InputLabelProps={{ style: { color: 'inherit' } }}
            InputProps={{ style: { color: 'inherit' } }}
          />
          <TextField
            fullWidth
            label="Цена билета (в Wei)"
            type="number"
            value={ticketPrice}
            onChange={(e) => setTicketPrice(e.target.value)}
            margin="normal"
            required
            variant="outlined"
            InputLabelProps={{ style: { color: 'inherit' } }}
            InputProps={{ style: { color: 'inherit' } }}
          />
          <TextField
            fullWidth
            label="Доступные билеты"
            type="number"
            value={ticketsAvailable}
            onChange={(e) => setTicketsAvailable(e.target.value)}
            margin="normal"
            required
            variant="outlined"
            InputLabelProps={{ style: { color: 'inherit' } }}
            InputProps={{ style: { color: 'inherit' } }}
          />
          <Button type="submit" variant="contained" color="primary">
            Создать Событие
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateEvent;

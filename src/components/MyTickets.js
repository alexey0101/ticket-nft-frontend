import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import web3 from '../utils/web3';
import { Button, Card, Container, Typography, Alert, Dialog, DialogContent, Grid, CardContent, CardActions } from '@mui/material';

const MyTickets = ({ account, contract }) => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const ticketIds = await contract.methods.getTicketsByOwner(account).call();
        const tickets = await Promise.all(ticketIds.map(async id => {
          const eventId = await contract.methods.getTicketEvent(id).call();
          const event = await contract.methods.getEventDetails(eventId).call();
          return { id, event };
        }));
        setTickets(tickets);
      } catch (error) {
        console.error("Ошибка загрузки билетов:", error);
        setErrorMessage("Ошибка загрузки билетов. Пожалуйста, попробуйте позже.");
      }
    };

    loadTickets();
  }, [account, contract]);

  const generateQrCode = async (ticket) => {
    const qrData = {
      ticketId: ticket.id.toString(),
      eventId: ticket.event.id.toString(),
      owner: account
    };

    const message = JSON.stringify(qrData);

    try {
      const from = account;
      const params = [from, message];
      const method = 'personal_sign';

      window.ethereum.sendAsync({
        method,
        params,
        from,
      }, (err, result) => {
        if (err) {
          console.error("Ошибка подписи сообщения:", err);
          setErrorMessage("Ошибка подписи сообщения. Пожалуйста, попробуйте снова.");
          return;
        }
        const signature = result.result;
        const signedQrData = {
          ...qrData,
          signature
        };
        setSelectedTicket({ ...ticket, signedQrData: JSON.stringify(signedQrData) });
        setOpen(true);
      });
    } catch (error) {
      console.error("Ошибка подписи сообщения:", error);
      setErrorMessage("Ошибка подписи сообщения. Пожалуйста, попробуйте снова.");
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>Мои Билеты</Typography>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      <Grid container spacing={3}>
        {tickets.map(ticket => (
          <Grid item xs={12} sm={6} md={4} key={ticket.id}>
            <Card style={{ backgroundColor: 'inherit', color: 'inherit' }}>
              <CardContent>
                <Typography variant="h6">{ticket.event.name}</Typography>
                <Typography color="textSecondary">{ticket.event.date}</Typography>
                <Typography color="textSecondary">{ticket.event.location}</Typography>
              </CardContent>
              <CardActions>
                <Button variant="contained" color="primary" onClick={() => generateQrCode(ticket)}>Показать QR</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          {selectedTicket && <QRCode value={selectedTicket.signedQrData} size={300} />}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default MyTickets;

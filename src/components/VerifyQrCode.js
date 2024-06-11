import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner';
import web3 from '../utils/web3';
import { Container, Alert } from 'react-bootstrap';

const VerifyQrCode = ({ contract }) => {
  const [scanResult, setScanResult] = useState('');
  const [verificationResult, setVerificationResult] = useState('');
  const [error, setError] = useState('');

  const handleScan = async (data) => {
    if (data) {
      setError('');
      try {
        const scannedData = JSON.parse(data.text);
        console.log('Scanned data:', scannedData);
        const { ticketId, eventId, owner, signature } = scannedData;
        setScanResult(JSON.stringify(scannedData, null, 2));

        const message = JSON.stringify({ ticketId, eventId, owner });
        const recoveredAddress = await web3.eth.accounts.recover(message, signature);
        console.log('Recovered address:', recoveredAddress);

        if (recoveredAddress.toLowerCase() !== owner.toLowerCase()) {
          setVerificationResult('Недействительная подпись.');
          return;
        }

        const result = await contract.methods.verifyOwnership(owner, eventId).call();
        console.log('Contract verification result:', result);
        setVerificationResult(result ? 'Билет действителен.' : 'Билет недействителен.');
      } catch (error) {
        console.error("Ошибка проверки QR кода:", error);
        setVerificationResult('Билет недействителен.');
      }
    }
  };

  const handleError = (err) => {
    console.error('Error:', err);
    setError('Ошибка сканирования QR кода.');
  };

  return (
    <Container>
      <h2 className="text-center mt-4">Проверка QR кода билета</h2>
      <QrScanner
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: '100%' }}
      />
      {error && <Alert variant="danger">{error}</Alert>}
      {scanResult && (
        <pre>Результат сканирования: {scanResult}</pre>
      )}
      {verificationResult && (
        <Alert variant={verificationResult === 'Билет действителен.' ? 'success' : 'danger'}>
          {verificationResult}
        </Alert>
      )}
    </Container>
  );
};

export default VerifyQrCode;

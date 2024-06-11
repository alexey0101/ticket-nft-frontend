import React, { useState, useEffect } from 'react';
import web3 from '../utils/web3';

const VerifyOwnership = ({ contract }) => {
  const [address, setAddress] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [isOwner, setIsOwner] = useState(null);
  const [signature, setSignature] = useState('');
  const [messageHash, setMessageHash] = useState('');

  useEffect(() => {
    const loadEvents = async () => {
      const eventCount = await contract.methods.getEventCount().call();
      const events = [];
      for (let i = 1; i <= eventCount; i++) {
        const event = await contract.methods.getEventDetails(i).call();
        events.push(event);
      }
      setEvents(events);
    };

    loadEvents();
  }, [contract]);

  const verifyOwnership = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      const message = `I am verifying ownership of the ticket for event ID: ${selectedEventId}`;
      const hash = web3.utils.sha3(message);
      setMessageHash(hash);

      const signedMessage = await web3.eth.personal.sign(hash, account);
      setSignature(signedMessage);

      const result = await contract.methods.verifySignature(hash, signedMessage).call({ from: account });
      setIsOwner(result);
    } catch (error) {
      console.error("Error verifying ownership:", error);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title">Verify Ticket Ownership</h2>
        <div className="mb-3">
          <input type="text" className="form-control" placeholder="User Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
        </div>
        <div className="mb-3">
          <select className="form-control" value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} required>
            <option value="">Select Event</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={verifyOwnership}>Verify Ownership</button>
        {isOwner !== null && (
          <div className={`alert mt-3 ${isOwner ? 'alert-success' : 'alert-danger'}`}>
            {isOwner ? 'This address owns a ticket for the event.' : 'This address does not own a ticket for the event.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyOwnership;

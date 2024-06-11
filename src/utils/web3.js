import Web3 from 'web3';

let web3;

if (window.ethereum) {
  web3 = new Web3(window.ethereum);
  window.ethereum.request({ method: 'eth_requestAccounts' })
    .catch((err) => console.error('User denied account access', err));
} else {
  const sepoliaUrl = 'https://rpc.sepolia.org';
  web3 = new Web3(new Web3.providers.HttpProvider(sepoliaUrl));
}

export default web3;

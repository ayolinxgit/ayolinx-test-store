import './App.css';
import { Button, Flex, Input, Text } from '@chakra-ui/react';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import moment from 'moment';
import { useState } from 'react';

function App() {
  const [client_id, setClientID] = useState('CKSandbox-83859d3c-38b0-4bd8-8b15-d60fa0d5eb0e');
  const [secret_key, setSecretKey] = useState('SKSandbox-ac8ab570-54de-403e-bbd3-a2ef638dc6fe');
  const [va_request_data, setVARequestData] = useState({
    fullname: '',
    phone_number: '',
    email: '',
    amount: 0
  });
  const [va_number, setVANumber] = useState('');

  function createSignature(request_id, target, body, iso_timestamp) {
    const raw_string_data = [
      `Client-Id:${client_id}`,
      `Request-Id:${request_id}`,
      `Request-Timestamp:${iso_timestamp}`,
      `Request-Target:${target}`,
      `Digest:${CryptoJS.SHA256(JSON.stringify(body)).toString(CryptoJS.enc.Base64)}`
    ];
    const signature = CryptoJS.HmacSHA256(raw_string_data.join('\n'), secret_key).toString(CryptoJS.enc.Hex);

    return signature;
  }

  async function payVA() {
    const base_url = 'http://localhost:3009';
    const payment_id = '123';
    const target_url = '/transaction/va/initiate';
    const iso_ts = moment().toISOString();
    try {
      const y = await axios.post(`${base_url}${target_url}`, va_request_data, {
        headers: {
          'Content-Type': 'application/json',
          'Client-Id': client_id,
          'Request-Id': payment_id,
          'Request-Timestamp': iso_ts,
          'Signature': createSignature(payment_id, target_url, va_request_data, iso_ts)
        }
      });
      setVANumber(y.data.data.va_number);
    } catch (err) {
      console.log(err);
      alert(JSON.stringify(err.response.data));
    }
  }

  return (
    <Flex 
      p={'24px'}
      direction={'column'}
      gap={'12px'}>
      <Text fontWeight={700}>
        VA Payment Sample
      </Text>
      <Input 
        value={client_id}
        onChange={e => setClientID(e.target.value)}
        placeholder={'Client Key'} />
      <Input 
        value={secret_key}
        onChange={e => setSecretKey(e.target.value)}
        placeholder={'Client Secret'} />
      <Input 
        value={va_request_data.fullname}
        onChange={e => setVARequestData({ ...va_request_data, fullname: e.target.value })}
        placeholder={'Name'} />
      <Input 
        value={va_request_data.email}
        onChange={e => setVARequestData({ ...va_request_data, email: e.target.value })}
        placeholder={'Email'} />
      <Input 
        value={va_request_data.phone_number}
        onChange={e => setVARequestData({ ...va_request_data, phone_number: e.target.value })}
        placeholder={'Phone Number'} />
      <Input 
        min={0}
        value={va_request_data.amount}
        onChange={e => setVARequestData({ ...va_request_data, amount: e.target.value })}
        type={'number'} placeholder={'Amount'} />
      <Button onClick={payVA}>
        Get VA Number
      </Button>
      <Text>
        VA Number: { va_number }
      </Text>
    </Flex>
  );
}

export default App;

import axios from 'axios';
import { apiUrl } from './config';

const sendEmail = async (data: any) => {
  try {
    const url = apiUrl('/api/lead/send-email/');
    const response = await axios.post(url,
      JSON.stringify(data)
      , {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        }
      });
    return response;
  } catch (error) {
    return false;
  }
}

async function sendLead(data: any): Promise<any> {
  try {
    const response = await fetch(`https://api.batscrm.com/leads`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const result = response.text();
    return result
  } catch (error) {
    return false
  }
}

export {
  sendEmail,
  sendLead
}
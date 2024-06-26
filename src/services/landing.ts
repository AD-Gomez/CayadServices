import axios from 'axios';

const sendEmail = async (data: any) => {
  try {
    const response = await axios.post("https://backupnode-production.up.railway.app/api/lead/send-email/",
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

async function sendLead (data: any): Promise<boolean> {
  try {
    const response = await fetch(`https://api.batscrm.com/leads`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const result = response.ok;
    return result
  } catch (error) {
    return false
  }
}

export {
  sendEmail,
  sendLead
}
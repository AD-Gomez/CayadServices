import axios from 'axios';

const sendEmail = async (data: any) => {
  try {
    const response = await axios.post("https://backupnode-production.up.railway.app/api/lead/send-email/",
      data
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

const sendLead = async (data: any) => {
  return new Promise((resolve, reject) => {
    fetch(`https://api.batscrm.com/leads`, {
      method: "POST",

      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        resolve(true);
      })
      .catch((err) => {
        // alert("Unexpected error, try again later");
        resolve(false);
      });
  });
}

export {
  sendEmail,
  sendLead
}
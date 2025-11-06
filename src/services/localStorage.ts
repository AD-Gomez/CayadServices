const isBrowser = typeof window !== 'undefined';

const saveEmail = (data: any) => {
  let send = {
    ...data,
    origin: data.origin_city,
    destination: data.destination_city,
    transport_type: data.transport_type === "0" ? "Open" : "Enclosed",
  };
  if (data.Vehicles && Array.isArray(data.Vehicles)) {
    // Vehicles no longer collected; skip mapping vehicle fields
  }
  delete send.origin_city;
  delete send.origin_postal_code;
  delete send.destination_city;
  delete send.destination_postal_code;
  Object.keys(send).map((key) => {
    if (send[key] === "") {
      delete send[key];
    }
  });
  if (typeof window !== 'undefined') window.localStorage.setItem("emailCayad", JSON.stringify(send));
}

const getEmail = (): any | null => {
  if (isBrowser) {
    const datos = localStorage.getItem('emailCayad');
    return datos ? JSON.parse(datos) : null;
  }

  return null
}

const sendedEmail = (data: boolean) => {
  if (typeof window !== 'undefined') window.localStorage.setItem("sendedEmail", JSON.stringify(data));
}

const getSendedEmail = (): any | null => {
  if (isBrowser) {
    const data = localStorage.getItem('sendedLead');
    return data ? JSON.parse(data) : null;
  }
  return null
}

const sendedLead = (boolean: boolean) => {
  if (typeof window !== 'undefined') window.localStorage.setItem("sendedLead", JSON.stringify(boolean));
}

const getSendedLead = (): any | null => {
  if (isBrowser) {
    const data = localStorage.getItem('sendedLead');
    return data ? JSON.parse(data) : null;
  }
  return null
}

const saveLead = (data: any) => {
  const dataToSend = {
    AuthKey: "849d9659-34b5-49c5-befd-1cd238e7f9fc",
    ...data,
    comment_from_shipper: "",
    origin_state: "",
    origin_country: "USA",
    destination_state: "",

    destination_country: "USA",
  };
  if (typeof window !== 'undefined') window.localStorage.setItem("lead", JSON.stringify(dataToSend));
}

const getLead = (): any | null => {
  if (isBrowser) {
    const datos = localStorage.getItem('lead');
    return datos ? JSON.parse(datos) : null;
  }
  return null
}

const saveNumberLead = (data: string) => {
  if (isBrowser) localStorage.setItem("numberLead", JSON.stringify(data));
};

const getNumberLead = (): string | null => {
  if (!isBrowser) return null;
  const datos = localStorage.getItem("numberLead");
  return datos ? JSON.parse(datos) : null;
};

const clearNumberLead = () => {
  if (isBrowser) localStorage.removeItem("numberLead");
};

const saveSectionNavbar = (data: string) => {
  if (typeof window !== 'undefined') window.localStorage.setItem("saveSectionNavbar", JSON.stringify(data));
}

const getSectionNavbar = (): any | null => {
  if (isBrowser) {
    const datos = localStorage.getItem('saveSectionNavbar');
    return datos ? JSON.parse(datos) : null;
  }
  return null
}

export {
  saveEmail,
  getEmail,
  saveLead,
  getLead,
  sendedEmail,
  sendedLead,
  getSendedEmail,
  getSendedLead,
  saveNumberLead,
  getNumberLead,
  saveSectionNavbar,
  getSectionNavbar
}
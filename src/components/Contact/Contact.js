// src/components/Contact.js
import React from 'react';
import { Helmet } from 'react-helmet-async';

function Contact() {
  return (
    <div>
      <Helmet>
        <title>Contacto - Charging Station as a Service</title>
      </Helmet>
      <h1>Contacto</h1>
      <p>Para poner en público tus estaciones de carga o algún problema con tus reservas, comunicate con el equipo a través del correo electrónico g5redes@usm.cl </p>
    </div>
  );
}

export default Contact;
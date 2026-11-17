"use client";

import { useState, type FormEvent } from 'react';

interface ContactFormProps {
  initialSubject: string;
}

export default function ContactForm({ initialSubject }: ContactFormProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [status, setStatus] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Le formulaire n'est pas encore relié à un service d'envoi. Aucun message n'a été transmis.");
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-form__row">
        <label>
          <span>Nom</span>
          <input name="name" type="text" placeholder="Votre nom" required />
        </label>
        <label>
          <span>Adresse e-mail</span>
          <input name="email" type="email" placeholder="vous@exemple.org" required />
        </label>
      </div>
      <label>
        <span>Objet</span>
        <input
          name="subject"
          type="text"
          placeholder="Demande de consultation, question sur une notice..."
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          required
        />
      </label>
      <label>
        <span>Message</span>
        <textarea
          name="message"
          rows={6}
          placeholder="Précisez la cote de la notice concernée si votre demande en porte sur une notice."
          required
        />
      </label>
      {status && <p className="form-status" role="status">{status}</p>}
      <div className="contact-form__footer">
        <span>Les champs sont obligatoires.</span>
        <button type="submit" className="button button--primary">
          Envoyer le message <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}

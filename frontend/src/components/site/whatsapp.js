// Enlace de WhatsApp con un mensaje ya escrito
export const whatsappLink = (number, text = 'Hola, quisiera hacer una reserva') =>
  number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : null;

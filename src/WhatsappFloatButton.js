import './whatsapp-float.css';

const WHATSAPP_NUMBER = '+905555555555';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^\d]/g, '')}`;
const WHATSAPP_LOGO_URL = 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg';

function WhatsappFloatButton() {
  return (
    <a
      href={WHATSAPP_LINK}
      className="whatsapp-float-btn"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ile iletişime geç"
    >
      <img src={WHATSAPP_LOGO_URL} alt="WhatsApp" />
    </a>
  );
}

export default WhatsappFloatButton;

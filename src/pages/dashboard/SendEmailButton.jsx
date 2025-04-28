import api from '../../utils/api';

const SendEmailButton = () => {
  const handleSend = async () => {
    try {
      await api.post('/email/sendEmail');
      alert('email sent!');
    } catch (err) {
      console.error(err);
      alert('Failed to send email');
    }
  };

  return <button onClick={handleSend}>Send Mock Email</button>;
};

export default SendEmailButton;

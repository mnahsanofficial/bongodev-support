import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1); // Go back to the previous page in history
  };

  const goToHome = () => {
    navigate('/'); // Go to the home page
  };

  return (
    <div className="flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 10rem)' }}> {/* Adjust height based on nav/footer */}
      <Card title="404 - Page Not Found" className="text-center shadow-md" style={{width: '30rem'}}>
        <p>Sorry, the page you are looking for does not exist.</p>
        <div className="mt-4 flex justify-content-center gap-2">
          <Button label="Go Back" icon="pi pi-arrow-left" onClick={goBack} />
          <Button label="Go to Homepage" icon="pi pi-home" onClick={goToHome} className="p-button-secondary" />
        </div>
      </Card>
    </div>
  );
};

export default NotFoundPage;

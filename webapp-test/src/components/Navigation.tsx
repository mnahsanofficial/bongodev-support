import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { MenuItem } from 'primereact/menuitem';

const Navigation: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const items: MenuItem[] = [
    {
      label: 'MurmurApp',
      icon: 'pi pi-home',
      command: () => navigate('/'),
    },
  ];

  if (isAuthenticated) {
    items.push({
      label: 'Timeline',
      icon: 'pi pi-list',
      command: () => navigate('/'),
    });
    if (user) {
      items.push({
        label: `My Profile (${user.name})`,
        icon: 'pi pi-user',
        command: () => navigate('/profile'),
      });
    }
  }

  const end = (
    <div className="flex align-items-center gap-2">
      {!isAuthenticated ? (
        <>
          <Button label="Login" icon="pi pi-sign-in" onClick={() => navigate('/login')} className="p-button-text" />
          <Button label="Register" icon="pi pi-user-plus" onClick={() => navigate('/register')} className="p-button-text" />
        </>
      ) : (
        <Button label="Logout" icon="pi pi-sign-out" onClick={logout} className="p-button-text" />
      )}
    </div>
  );

  return <Menubar model={items} end={end} />;
};

export default Navigation;

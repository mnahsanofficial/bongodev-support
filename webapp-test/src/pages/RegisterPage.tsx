import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, loginUser } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await registerUser({ name, email, password });
      // Registration successful, now redirect to login page
      toast.current?.show({ severity: 'success', summary: 'Registration Successful', detail: 'Please log in to continue.', life: 3000 });
      setTimeout(() => navigate('/login'), 2000); // Redirect to login page

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.current?.show({ severity: 'error', summary: 'Registration Failed', detail: errorMessage, life: 3000 });
      console.error(err);
    }
  };

  return (
    <div className="flex justify-content-center align-items-center min-h-screen">
      <Toast ref={toast} />
      <Card title="Register" style={{ width: '25rem' }}>
        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="field mt-3">
            <span className="p-float-label">
              <InputText
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
              <label htmlFor="name">Name</label>
            </span>
          </div>
          <div className="field mt-3">
            <span className="p-float-label">
              <InputText
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="email">Email</label>
            </span>
          </div>
          <div className="field mt-3">
            <span className="p-float-label">
              <Password
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                feedback={false} 
                tabIndex={1}
              />
              <label htmlFor="password">Password</label>
            </span>
          </div>
          <Button type="submit" label="Register" className="mt-4 w-full" />
          <div className="mt-3 text-center">
            <Link to="/login" className="text-primary hover:underline">
              Already have an account? Login
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;

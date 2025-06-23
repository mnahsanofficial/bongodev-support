import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginUser } from '../services/api';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await loginUser({ name: email, password });
      await auth.login(response.data.access_token, response.data.user);
      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Logged in successfully!', life: 3000 });
      setTimeout(() => navigate('/'), 1000); // Navigate after showing toast
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.current?.show({ severity: 'error', summary: 'Login Failed', detail: errorMessage, life: 3000 });
      console.error(err);
    }
  };

  return (
    <div className="flex justify-content-center align-items-center min-h-screen">
      <Toast ref={toast} />
      <Card title="Login" style={{ width: '25rem' }}>
        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="field mt-3">
            <span className="p-float-label">
              <InputText
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              <label htmlFor="email">Email (used as username)</label>
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
          <Button type="submit" label="Login" className="mt-4 w-full" />
          <div className="mt-3 text-center">
            <Link to="/register" className="text-primary hover:underline">
              Don't have an account? Sign Up
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;

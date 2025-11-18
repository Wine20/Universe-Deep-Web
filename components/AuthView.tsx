
import React, { useState } from 'react';
import { GoogleIcon, UserCircleIcon, BlueLogoIcon } from './Icons';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../services/userService';

type AuthMode = 'login' | 'register';

interface AuthViewProps {
    onDemoLogin: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onDemoLogin }) => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignUp = async () => {
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);
        const result = await signInWithGoogle();
        if (!result.success) {
            setError(result.message);
        }
        // On success, the onAuthStateChanged listener in App.tsx will handle the navigation.
        setIsLoading(false);
    };
    
    const handleDemo = () => {
        setIsLoading(true);
        onDemoLogin();
        setIsLoading(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        if (mode === 'login') {
            const result = await signInWithEmail(email, password);
            if (!result.success) {
                setError(result.message);
            }
        } else { // register
            if (!name.trim()) {
                setError('Por favor, insira seu nome.');
                setIsLoading(false);
                return;
            }
            const result = await signUpWithEmail(name, email, password);
            if (result.success) {
                setSuccessMessage(result.message + ' Você já pode fazer o login.');
                setMode('login'); // Switch to login screen after successful registration
            } else {
                setError(result.message);
            }
        }
        setIsLoading(false);
    };

    const toggleMode = () => {
        setMode(prev => prev === 'login' ? 'register' : 'login');
        setError(null);
        setSuccessMessage(null);
        setName('');
        setEmail('');
        setPassword('');
    }

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0f1f] animate-fade-in">
      <div className="w-full max-w-md bg-black/20 rounded-2xl shadow-2xl p-8 text-center border border-blue-500/20">
        <div className="flex justify-center mb-6">
          <BlueLogoIcon />
        </div>
        <h1 className="text-3xl font-bold text-blue-300 mb-2">
            {mode === 'login' ? 'Bluewhite Assistant' : 'Crie sua Conta'}
        </h1>
        <p className="text-gray-400 mb-6">
            {mode === 'login' ? 'Acesse sua conta para continuar.' : 'Complete seu cadastro para começar a usar o Bluewhite AI.'}
        </p>
        
        <div className="flex items-center space-x-4">
            <button
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="w-full flex justify-center items-center space-x-2 bg-white text-gray-700 font-semibold rounded-lg px-4 py-3 text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
                <GoogleIcon />
                <span>Google</span>
            </button>
            <button
                onClick={handleDemo}
                disabled={isLoading}
                className="w-full flex justify-center items-center space-x-3 bg-gray-600 text-white font-semibold rounded-lg px-4 py-3 text-sm hover:bg-gray-500 transition-colors disabled:opacity-50"
            >
                <UserCircleIcon className="h-5 w-5"/>
                <span>Conta Demo</span>
            </button>
        </div>

        <div className="flex items-center my-4">
            <hr className="w-full border-gray-600" />
            <span className="px-2 text-gray-500 text-xs">OU</span>
            <hr className="w-full border-gray-600" />
        </div>

        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md my-4 text-sm">{error}</div>}
        {successMessage && <div className="bg-green-500/20 text-green-300 p-3 rounded-md my-4 text-sm">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
              <input 
                type="text" 
                placeholder="Nome Completo" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          )}
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input 
            type="password" 
            placeholder="Senha" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 rounded-lg py-3 text-sm font-semibold disabled:bg-gray-500 disabled:cursor-wait"
        >
            {isLoading ? 'Processando...' : (mode === 'login' ? 'Entrar' : 'Registrar')}
          </button>
        </form>

        <div className="mt-6 text-sm">
            <button onClick={toggleMode} className="text-blue-400 hover:underline">
                {mode === 'login' ? 'Não tem uma conta? Registre-se' : 'Já tem uma conta? Faça login'}
            </button>
        </div>
        <div className="mt-8 text-xs text-gray-500">
            <p className="font-semibold">Universe Deep Web</p>
            <p className="font-bold">Ceo & Founder - Génesis Wine</p>
        </div>
      </div>
    </div>
  );
};

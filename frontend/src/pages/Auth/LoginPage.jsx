import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { CyberLogo } from '../../components/common/CyberLogo';
import { ReticleCard } from '../../components/common/ReticleCard';
import { CyberButton } from '../../components/common/CyberButton';
import { ROUTES } from '../../constants/routes';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login({ username, password });
      } else {
        await register({ username, password });
      }
      navigate(ROUTES.LOBBY);
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      if (serverMessage) {
        setError(serverMessage);
      } else if (mode === 'login') {
        setError('Authentication failed. Please verify your credentials.');
      } else {
        setError('Registration failed. Username may already be taken.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setMode('login');
    setUsername('CYBER_VIPER');
    setPassword('CyberViper2026!');
    setError('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-space-md relative overflow-hidden">
      {/* Background Matrix Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-secondary-container/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md flex flex-col gap-space-lg relative z-10">
        {/* Top Branding */}
        <div className="flex flex-col items-center text-center gap-space-xs">
          <CyberLogo className="h-10 w-auto" />
          <p className="font-label-data-sm uppercase tracking-widest text-outline mt-space-2xs">
            SECURITY PROTOCOL // PILOT AUTHENTICATION
          </p>
        </div>

        <ReticleCard glow={true} className="border border-outline-variant/30 shadow-2xl">
          {/* Cyber Mode Switch Tabs: LOGIN vs REGISTER */}
          <div className="grid grid-cols-2 p-1 bg-surface-container-lowest border border-outline-variant/40 rounded-lg mb- space-y-0">
            <button
              type="button"
              onClick={() => handleModeSwitch('login')}
              className={`py-2 text-xs font-headline-sm uppercase tracking-wider rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-primary-container text-on-primary-container font-extrabold shadow-[0_0_12px_rgba(0,242,254,0.4)]'
                  : 'text-outline hover:text-on-surface hover:bg-surface-container-high/40'
              }`}
            >
              ACCESS TERMINAL
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('register')}
              className={`py-2 text-xs font-headline-sm uppercase tracking-wider rounded-md transition-all ${
                mode === 'register'
                  ? 'bg-secondary text-on-secondary font-extrabold shadow-[0_0_12px_rgba(255,230,0,0.4)]'
                  : 'text-outline hover:text-on-surface hover:bg-surface-container-high/40'
              }`}
            >
              NEW REGISTRATION
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-space-md mt-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-xs">
              <span className="font-headline-sm uppercase tracking-wide text-sm font-bold">
                {mode === 'login' ? (
                  <span className="text-primary">SECURITY VERIFICATION</span>
                ) : (
                  <span className="text-secondary">PILOT ENLISTMENT</span>
                )}
              </span>
              <span
                className={`font-label-data-sm text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                  mode === 'login'
                    ? 'bg-primary-container/20 text-primary-container'
                    : 'bg-secondary-container/40 text-secondary'
                }`}
              >
                {mode === 'login' ? 'ENCRYPTED' : 'CYBER DRAFT'}
              </span>
            </div>

            {error && (
              <div className="p-space-xs rounded bg-error-container/30 border border-error/40 text-error font-label-data-sm text-sm flex items-center gap-2 animate-shake">
                <span className="material-symbols-outlined text-base">warning</span>
                <span>{error}</span>
              </div>
            )}

            {/* Field 1: Username */}
            <div className="flex flex-col gap-space-2xs">
              <label className="font-label-data-sm uppercase tracking-wider text-outline text-xs">
                {mode === 'login' ? 'Username / Gamer Tag' : 'Choose Username'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={mode === 'login' ? 'e.g. CYBER_VIPER' : 'e.g. NEO_PILOT'}
                  className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline/40 font-body-md px-space-sm py-space-xs rounded border border-outline-variant/50 focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Field 2: Security Passcode */}
            <div className="flex flex-col gap-space-2xs">
              <label className="font-label-data-sm uppercase tracking-wider text-outline text-xs">
                {mode === 'login' ? 'Security Passcode' : 'Create Password (min 6 chars)'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline/40 font-body-md px-space-sm py-space-xs rounded border border-outline-variant/50 focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <CyberButton
              type="submit"
              variant={mode === 'login' ? 'primary' : 'secondary'}
              disabled={loading}
              className="w-full mt-space-xs"
            >
              {loading
                ? mode === 'login'
                  ? 'AUTHENTICATING...'
                  : 'COMMISSIONING...'
                : mode === 'login'
                ? 'INITIALIZE LINK // LOGIN'
                : 'COMMISSION PILOT // REGISTER'}
            </CyberButton>

            {/* Mode Switch Helper Footer */}
            <div className="flex items-center justify-between text-xs font-label-data-sm text-outline pt-space-xs border-t border-outline-variant/20">
              {mode === 'login' ? (
                <>
                  <span>New recruit?</span>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('register')}
                    className="text-secondary hover:underline uppercase font-bold tracking-wider"
                  >
                    Register With Username & Password →
                  </button>
                </>
              ) : (
                <>
                  <span>Already enlisted?</span>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('login')}
                    className="text-primary-container hover:underline uppercase font-bold tracking-wider"
                  >
                    Access Terminal Login →
                  </button>
                </>
              )}
            </div>

            {/* Quick Demo Pilot Auto-Fill */}
            {mode === 'login' && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={fillDemoAccount}
                  className="text-[11px] font-label-data-sm text-outline/70 hover:text-primary transition underline"
                >
                  Autofill Default Test Pilot (CYBER_VIPER)
                </button>
              </div>
            )}
          </form>
        </ReticleCard>
      </div>
    </div>
  );
}

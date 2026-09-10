import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { CyberLogo } from '../../components/common/CyberLogo';
import { ReticleCard } from '../../components/common/ReticleCard';
import { CyberButton } from '../../components/common/CyberButton';
import { API_BASE_URL } from '../../constants/config';
import { ROUTES } from '../../constants/routes';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'reset'

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slowNotice, setSlowNotice] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking' | 'online' | 'waking'

  const { login, register, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Background server warmup on mobile mount to eliminate cold-start lag
  useEffect(() => {
    let isMounted = true;
    fetch(`${API_BASE_URL}/quests/public`, { method: 'GET' })
      .then((r) => {
        if (isMounted) setServerStatus(r.ok ? 'online' : 'waking');
      })
      .catch(() => {
        if (isMounted) setServerStatus('waking');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Display reassuring UI indicator if request takes > 2.5s (typical for Render sleeping container)
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => setSlowNotice(true), 2500);
    } else {
      setSlowNotice(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setError('');
  };

  const parseAuthError = (err, currentMode, targetUser) => {
    if (err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout')) {
      return 'Cloud server cold start is taking a moment (Render free tier wakes up in ~30-50s). Please wait a few seconds and tap again!';
    }
    if (!err.response) {
      return 'Cannot reach cloud server. Render may be waking up from sleep or mobile data is slow. Please tap again.';
    }

    const status = err.response.status;
    const serverMsg = err.response.data?.message;

    if (status === 400 || status === 409) {
      if (serverMsg) return serverMsg;
      if (currentMode === 'register') {
        return `Callsign "${targetUser}" is already registered. You can log in or use Reset Passcode.`;
      }
      return 'Invalid credentials or request format.';
    }

    if (status === 401) {
      return 'Authentication failed. Incorrect callsign or passcode.';
    }

    if (status === 404) {
      return serverMsg || `Pilot "${targetUser}" was not found.`;
    }

    if (status >= 500) {
      return `Cloud service responding with status ${status}. Please retry in a few moments.`;
    }

    return serverMsg || 'Operation failed. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanUsername = username.trim();

    try {
      if (mode === 'login') {
        await login({ username: cleanUsername, password });
      } else if (mode === 'register') {
        await register({ username: cleanUsername, password });
      } else if (mode === 'reset') {
        await resetPassword({ username: cleanUsername, newPassword: password });
      }
      navigate(ROUTES.LOBBY);
    } catch (err) {
      setError(parseAuthError(err, mode, cleanUsername));
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-space-md py-space-xl relative overflow-y-auto">
      {/* Background Matrix Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-secondary-container/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md flex flex-col gap-space-md relative z-10 my-auto">
        {/* Top Branding & Live Server Status */}
        <div className="flex flex-col items-center text-center gap-space-xs">
          <CyberLogo className="h-10 w-auto" />
          <p className="font-label-data-sm uppercase tracking-widest text-outline text-[11px] mt-space-2xs">
            SECURITY PROTOCOL // PILOT AUTHENTICATION
          </p>

          {/* Cloud Server Ping Status Indicator */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-label-data-sm border border-outline-variant/30 bg-surface-container-lowest/70 backdrop-blur-sm mt-1">
            <span
              className={`w-2 h-2 rounded-full ${
                serverStatus === 'online'
                  ? 'bg-primary animate-pulse shadow-[0_0_8px_#00f2fe]'
                  : 'bg-amber-400 animate-ping'
              }`}
            ></span>
            <span className="text-outline uppercase tracking-wider">
              {serverStatus === 'online' ? 'Cloud Server: Online' : 'Cloud Server: Waking Up...'}
            </span>
          </div>
        </div>

        <ReticleCard glow={true} className="border border-outline-variant/30 shadow-2xl">
          {/* Cyber Mode Switch Tabs: LOGIN vs REGISTER vs RESET */}
          <div className="grid grid-cols-3 p-1 bg-surface-container-lowest border border-outline-variant/40 rounded-lg">
            <button
              type="button"
              onClick={() => handleModeSwitch('login')}
              className={`py-2 text-[11px] font-headline-sm uppercase tracking-wider rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-primary-container text-on-primary-container font-extrabold shadow-[0_0_12px_rgba(0,242,254,0.4)]'
                  : 'text-outline hover:text-on-surface hover:bg-surface-container-high/40'
              }`}
            >
              LOGIN
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('register')}
              className={`py-2 text-[11px] font-headline-sm uppercase tracking-wider rounded-md transition-all ${
                mode === 'register'
                  ? 'bg-secondary text-on-secondary font-extrabold shadow-[0_0_12px_rgba(255,230,0,0.4)]'
                  : 'text-outline hover:text-on-surface hover:bg-surface-container-high/40'
              }`}
            >
              REGISTER
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('reset')}
              className={`py-2 text-[11px] font-headline-sm uppercase tracking-wider rounded-md transition-all ${
                mode === 'reset'
                  ? 'bg-tertiary-container text-on-tertiary-container font-extrabold shadow-[0_0_12px_rgba(230,0,255,0.4)]'
                  : 'text-outline hover:text-on-surface hover:bg-surface-container-high/40'
              }`}
            >
              RESET
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-space-md mt-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-xs">
              <span className="font-headline-sm uppercase tracking-wide text-xs font-bold">
                {mode === 'login' ? (
                  <span className="text-primary">ACCESS TERMINAL</span>
                ) : mode === 'register' ? (
                  <span className="text-secondary">PILOT ENLISTMENT</span>
                ) : (
                  <span className="text-tertiary">RECOVER PASSCODE</span>
                )}
              </span>
              <span
                className={`font-label-data-sm text-[9px] uppercase px-2 py-0.5 rounded font-bold ${
                  mode === 'login'
                    ? 'bg-primary-container/20 text-primary-container'
                    : mode === 'register'
                    ? 'bg-secondary-container/40 text-secondary'
                    : 'bg-tertiary-container/30 text-tertiary'
                }`}
              >
                {mode === 'login' ? 'ENCRYPTED' : mode === 'register' ? 'CYBER DRAFT' : 'RECOVERY'}
              </span>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-space-xs rounded bg-error-container/30 border border-error/40 text-error font-label-data-sm text-xs flex flex-col gap-1.5 animate-shake">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base shrink-0">warning</span>
                  <span>{error}</span>
                </div>
                {mode === 'register' && (error.includes('taken') || error.includes('already registered')) && (
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('reset')}
                    className="self-start text-[11px] text-primary underline uppercase font-bold tracking-wider hover:opacity-80 mt-1"
                  >
                    Reset passcode for this username instead →
                  </button>
                )}
              </div>
            )}

            {/* Slow Cloud Wakeup Notice */}
            {slowNotice && loading && (
              <div className="p-space-xs rounded bg-primary-container/20 border border-primary/40 text-primary font-label-data-sm text-xs flex items-center gap-2 animate-pulse">
                <span className="material-symbols-outlined text-base animate-spin">sync</span>
                <span>Connecting to cloud server (Render free tier takes ~30-50s to wake up on first visit)...</span>
              </div>
            )}

            {/* Field 1: Username / Callsign */}
            <div className="flex flex-col gap-space-2xs">
              <label className="font-label-data-sm uppercase tracking-wider text-outline text-xs">
                {mode === 'login'
                  ? 'Username / Callsign'
                  : mode === 'register'
                  ? 'Choose Username'
                  : 'Callsign to Recover'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={mode === 'login' ? 'e.g. Shriyog' : 'e.g. Shriyog'}
                  className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline/40 font-body-md px-space-sm py-space-xs rounded border border-outline-variant/50 focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Field 2: Security Passcode */}
            <div className="flex flex-col gap-space-2xs">
              <label className="font-label-data-sm uppercase tracking-wider text-outline text-xs">
                {mode === 'login'
                  ? 'Security Passcode'
                  : mode === 'register'
                  ? 'Create Password (min 6 chars)'
                  : 'Set New Passcode (min 6 chars)'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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
              variant={mode === 'login' ? 'primary' : mode === 'register' ? 'secondary' : 'primary'}
              disabled={loading}
              className="w-full mt-space-xs"
            >
              {loading
                ? mode === 'login'
                  ? 'AUTHENTICATING...'
                  : mode === 'register'
                  ? 'COMMISSIONING...'
                  : 'UPDATING PASSCODE...'
                : mode === 'login'
                ? 'INITIALIZE LINK // LOGIN'
                : mode === 'register'
                ? 'COMMISSION PILOT // REGISTER'
                : 'OVERWRITE & ENTER ARENA'}
            </CyberButton>

            {/* Mode Switch Helper Footers */}
            <div className="flex items-center justify-between text-xs font-label-data-sm text-outline pt-space-xs border-t border-outline-variant/20">
              {mode === 'login' && (
                <>
                  <span>New recruit?</span>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('register')}
                    className="text-secondary hover:underline uppercase font-bold tracking-wider"
                  >
                    Quick Register →
                  </button>
                </>
              )}
              {mode === 'register' && (
                <>
                  <span>Already registered?</span>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('login')}
                    className="text-primary-container hover:underline uppercase font-bold tracking-wider"
                  >
                    Terminal Login →
                  </button>
                </>
              )}
              {mode === 'reset' && (
                <>
                  <span>Remember passcode?</span>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('login')}
                    className="text-primary-container hover:underline uppercase font-bold tracking-wider"
                  >
                    Return to Login →
                  </button>
                </>
              )}
            </div>

            {/* Autofill Demo Option */}
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

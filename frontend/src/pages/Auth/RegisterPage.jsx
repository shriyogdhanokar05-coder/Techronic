import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { CyberLogo } from '../../components/common/CyberLogo';
import { ReticleCard } from '../../components/common/ReticleCard';
import { CyberButton } from '../../components/common/CyberButton';
import { API_BASE_URL } from '../../constants/config';
import { ROUTES } from '../../constants/routes';

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slowNotice, setSlowNotice] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');

  const { register } = useAuth();
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

  // Show notice if cloud backend is taking time to wake up
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => setSlowNotice(true), 2500);
    } else {
      setSlowNotice(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanUsername = username.trim();

    try {
      await register({
        username: cleanUsername,
        password,
      });
      navigate(ROUTES.LOBBY);
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message?.toLowerCase().includes('timeout')) {
        setError('Cloud server cold start is taking a moment (Render free tier wakes up in ~30-50s). Please wait a few seconds and tap again!');
      } else if (!err.response) {
        setError('Cannot reach cloud server. Render may be waking up from sleep or network is slow. Please tap again.');
      } else {
        const status = err.response.status;
        const msg = err.response.data?.message;
        if (status === 400 || status === 409) {
          setError(msg || `Callsign "${cleanUsername}" is already taken. Try another or access the login terminal.`);
        } else if (status >= 500) {
          setError(`Server rebooting (${status}). Please retry in a few moments.`);
        } else {
          setError(msg || 'Registration failed. Please check inputs and retry.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-space-md py-space-xl relative overflow-y-auto">
      {/* Background Matrix Glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary-container/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md flex flex-col gap-space-md relative z-10 my-auto">
        <div className="flex flex-col items-center text-center gap-space-xs">
          <CyberLogo className="h-10 w-auto" />
          <p className="font-label-data-sm uppercase tracking-widest text-outline text-[11px] mt-space-2xs">
            NEW PILOT COMMISSION // QUICK ENLISTMENT
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-xs">
              <span className="font-headline-sm uppercase text-secondary tracking-wide text-xs font-bold">
                PILOT ENLISTMENT
              </span>
              <span className="font-label-data-sm text-[9px] uppercase bg-secondary-container/40 text-secondary px-2 py-0.5 rounded font-bold">
                CYBER DRAFT
              </span>
            </div>

            {error && (
              <div className="p-space-xs rounded bg-error-container/30 border border-error/40 text-error font-label-data-sm text-xs flex flex-col gap-1.5 animate-shake">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base shrink-0">warning</span>
                  <span>{error}</span>
                </div>
                {error.includes('already taken') && (
                  <Link
                    to={ROUTES.LOGIN}
                    className="self-start text-[11px] text-primary underline uppercase font-bold tracking-wider hover:opacity-80 mt-1"
                  >
                    Go to Login Terminal / Reset Passcode →
                  </Link>
                )}
              </div>
            )}

            {slowNotice && loading && (
              <div className="p-space-xs rounded bg-secondary-container/20 border border-secondary/40 text-secondary font-label-data-sm text-xs flex items-center gap-2 animate-pulse">
                <span className="material-symbols-outlined text-base animate-spin">sync</span>
                <span>Connecting to cloud server (Render free instances take ~30-50s to wake up)...</span>
              </div>
            )}

            <div className="flex flex-col gap-space-2xs">
              <label className="font-label-data-sm uppercase tracking-wider text-outline text-xs">
                Username / Callsign
              </label>
              <input
                type="text"
                required
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Shriyog"
                className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline/40 font-body-md px-space-sm py-space-xs rounded border border-outline-variant/50 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition text-sm"
              />
            </div>

            <div className="flex flex-col gap-space-2xs">
              <label className="font-label-data-sm uppercase tracking-wider text-outline text-xs">
                Security Passcode (min 6 chars)
              </label>
              <input
                type="password"
                required
                minLength={6}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline/40 font-body-md px-space-sm py-space-xs rounded border border-outline-variant/50 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition text-sm"
              />
            </div>

            <CyberButton
              type="submit"
              variant="secondary"
              disabled={loading}
              className="w-full mt-space-xs"
            >
              {loading ? 'COMMISSIONING...' : 'COMMISSION PILOT // REGISTER'}
            </CyberButton>

            <div className="flex items-center justify-between text-xs font-label-data-sm text-outline pt-space-xs border-t border-outline-variant/20">
              <span>Already registered?</span>
              <Link
                to={ROUTES.LOGIN}
                className="text-secondary hover:underline uppercase font-bold tracking-wider"
              >
                Access Terminal →
              </Link>
            </div>
          </form>
        </ReticleCard>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { CyberLogo } from '../../components/common/CyberLogo';
import { ReticleCard } from '../../components/common/ReticleCard';
import { CyberButton } from '../../components/common/CyberButton';
import { ROUTES } from '../../constants/routes';

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        username,
        password,
      });
      navigate(ROUTES.LOBBY);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Username may already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-space-md relative overflow-hidden">
      {/* Background Matrix Glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary-container/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md flex flex-col gap-space-lg relative z-10">
        <div className="flex flex-col items-center text-center gap-space-xs">
          <CyberLogo className="h-10 w-auto" />
          <p className="font-label-data-sm uppercase tracking-widest text-outline mt-space-2xs">
            NEW PILOT COMMISSION // QUICK ENLISTMENT
          </p>
        </div>

        <ReticleCard glow={true} className="border border-outline-variant/30 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-xs">
              <span className="font-headline-sm uppercase text-secondary tracking-wide">
                PILOT ENLISTMENT
              </span>
              <span className="font-label-data-sm text-[10px] uppercase bg-secondary-container/40 text-secondary px-2 py-0.5 rounded font-bold">
                CYBER DRAFT
              </span>
            </div>

            {error && (
              <div className="p-space-xs rounded bg-error-container/30 border border-error/40 text-error font-label-data-sm text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-space-2xs">
              <label className="font-label-data-sm uppercase tracking-wider text-outline text-xs">
                Username / Callsign
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. NEO_WARRIOR"
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

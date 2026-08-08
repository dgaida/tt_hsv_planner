import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface AuthScreenProps {
  onSessionChange: () => void;
}

export default function AuthScreen({ onSessionChange }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          throw new Error('Bitte gib deinen vollen Namen an.');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: fullName.trim(),
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data.user && data.session) {
          onSessionChange();
        } else {
          setSuccessMsg('Registrierung erfolgreich! Bitte prüfe deine E-Mails zur Bestätigung deines Kontos (sofern aktiviert). Du kannst dich danach einloggen.');
          setIsSignUp(false);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        onSessionChange();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentifizierungsfehler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border border-gray-100">
        <div className="text-4xl mb-4 text-center">🏓</div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {isSignUp ? 'Spieler-Konto erstellen' : 'Anmelden im Verein'}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 text-green-700 p-3 rounded-xl mb-4 text-sm font-medium">
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Name / Vorname (z.B. Peter)
              </label>
              <input
                type="text"
                placeholder="Dein Vorname oder Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              E-Mail Adresse
            </label>
            <input
              type="email"
              placeholder="spieler@verein.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Passwort
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl shadow transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-r-2 border-white"></span>
            ) : isSignUp ? (
              'Konto erstellen'
            ) : (
              'Anmelden'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {isSignUp ? (
            <>
              Bereits ein Konto?{' '}
              <button
                onClick={() => setIsSignUp(false)}
                className="text-teal-600 font-semibold hover:underline"
              >
                Hier anmelden
              </button>
            </>
          ) : (
            <>
              Noch kein Spieler-Konto?{' '}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-teal-600 font-semibold hover:underline"
              >
                Hier registrieren
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

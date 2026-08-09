import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthScreen from '../src/components/AuthScreen';
import { supabase } from '../src/lib/supabaseClient';

vi.mock('../src/lib/supabaseClient', () => {
  return {
    supabase: {
      from: vi.fn(),
      auth: {
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
      },
    },
  };
});

describe('AuthScreen', () => {
  const mockProfiles = [
    { id: '1', name: 'Max Mustermann', ttr_points: 1600 },
    { id: '2', name: 'Mia Musterfrau', ttr_points: 1500 },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders tab bar and loads dropdown list of profiles', async () => {
    const fromMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }),
      }),
    });
    vi.mocked(supabase.from).mockImplementation(fromMock as any);

    render(<AuthScreen onSelectPlayer={() => {}} />);

    // Renders loading first
    expect(screen.getByText('Lade Spieler...')).toBeDefined();

    // Renders profiles list next
    await waitFor(() => {
      expect(screen.getByText('TTV Spielplaner')).toBeDefined();
      expect(screen.getByText('Max Mustermann (1600 TTR)')).toBeDefined();
    });
  });

  it('allows switching tabs between passwordless, password, and register', async () => {
    const fromMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }),
      }),
    });
    vi.mocked(supabase.from).mockImplementation(fromMock as any);

    render(<AuthScreen onSelectPlayer={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Direkt-Auswahl')).toBeDefined();
    });

    const passTab = screen.getByText('Mit Passwort');
    fireEvent.click(passTab);

    expect(screen.getByPlaceholderText('name@verein.de')).toBeDefined();
    expect(screen.getByPlaceholderText('••••••••')).toBeDefined();
  });
});

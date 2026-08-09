import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';
import { supabase } from '../src/lib/supabaseClient';

vi.mock('../src/lib/supabaseClient', () => {
  return {
    supabase: {
      from: vi.fn(),
      rpc: vi.fn(),
    },
  };
});

describe('App Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();

    const createMockChain = (dataValue: any): any => {
      const chain: any = {
        select: vi.fn().mockImplementation(() => chain),
        eq: vi.fn().mockImplementation(() => chain),
        in: vi.fn().mockImplementation(() => chain),
        order: vi.fn().mockImplementation(() => chain),
        limit: vi.fn().mockImplementation(() => chain),
        single: vi.fn().mockImplementation(() => {
          const singleVal = Array.isArray(dataValue) ? dataValue[0] : dataValue;
          return createMockChain(singleVal);
        }),
        then: vi.fn().mockImplementation((resolve) => {
          resolve({ data: dataValue, error: null });
          return Promise.resolve({ data: dataValue, error: null });
        }),
      };
      return chain;
    };

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createMockChain([
          { id: 'p-1', name: 'Max Mustermann', role: 'sportwart', team_number: 1 },
        ]);
      }
      if (table === 'teams') {
        return createMockChain([
          { id: 't-1', name: 'Herren I', short_name: 'Herren 1', active: true },
        ]);
      }
      return createMockChain([]);
    });

    vi.mocked(supabase.rpc).mockResolvedValue({ data: true, error: null } as any);
  });

  it('renders PasswordGate if club password is not verified', async () => {
    render(<App />);
    expect(screen.getByText(/Diese Anwendung ist passwortgeschützt/)).toBeTruthy();
  });

  it('bypasses PasswordGate if club password in localStorage or pw URL parameter is present', async () => {
    localStorage.setItem('club_password', 'valid-pw');
    localStorage.setItem('ttv_selected_player_id', 'p-1');

    render(<App />);

    // Renders the main app after password bypass and user selection load
    await waitFor(() => {
      expect(screen.getByText('TTV Spielplaner')).toBeTruthy();
      expect(screen.getByText('Max Mustermann')).toBeTruthy();
    });
  });
});

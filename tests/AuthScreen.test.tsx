import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthScreen from '../src/components/AuthScreen';
import { supabase } from '../src/lib/supabaseClient';

vi.mock('../src/lib/supabaseClient', () => {
  return {
    supabase: {
      from: vi.fn(),
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

  it('renders loading state then renders select dropdown with profiles', async () => {
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
      expect(screen.getByText('Spieler-Anmeldung')).toBeDefined();
      expect(screen.getByText('Max Mustermann (1600 TTR-Punkte)')).toBeDefined();
      expect(screen.getByText('Mia Musterfrau (1500 TTR-Punkte)')).toBeDefined();
    });
  });

  it('selects cached player from localStorage automatically', async () => {
    localStorage.setItem('ttv_selected_player_id', '2');

    const fromMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }),
      }),
    });
    vi.mocked(supabase.from).mockImplementation(fromMock as any);

    render(<AuthScreen onSelectPlayer={() => {}} />);

    await waitFor(() => {
      const selectElement = screen.getByRole('combobox') as HTMLSelectElement;
      expect(selectElement.value).toBe('2');
    });
  });

  it('calls onSelectPlayer when form is submitted with a player selected', async () => {
    const onSelectPlayerMock = vi.fn();

    const fromMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }),
      }),
    });
    vi.mocked(supabase.from).mockImplementation(fromMock as any);

    render(<AuthScreen onSelectPlayer={onSelectPlayerMock} />);

    await waitFor(() => {
      expect(screen.getByText('Max Mustermann (1600 TTR-Punkte)')).toBeDefined();
    });

    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: '1' } });

    const submitBtn = screen.getByRole('button', { name: 'Anmelden' });
    fireEvent.click(submitBtn);

    expect(localStorage.getItem('ttv_selected_player_id')).toBe('1');
    expect(onSelectPlayerMock).toHaveBeenCalledWith(mockProfiles[0]);
  });

  it('shows error message if database call fails', async () => {
    const fromMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB Error') }),
      }),
    });
    vi.mocked(supabase.from).mockImplementation(fromMock as any);

    render(<AuthScreen onSelectPlayer={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('⚠️ Fehler beim Laden der Spielerliste.')).toBeDefined();
    });
  });
});

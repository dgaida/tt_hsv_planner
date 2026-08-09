import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SportwartView from '../src/components/SportwartView';
import { supabase } from '../src/lib/supabaseClient';

vi.mock('../src/lib/supabaseClient', () => {
  return {
    supabase: {
      from: vi.fn(),
    },
  };
});

describe('SportwartView', () => {
  const mockProfiles = [
    { id: 'p-1', name: 'Max Mustermann', role: 'sportwart', ttr_points: 1600, team_number: 1, position_number: 1 },
    { id: 'p-2', name: 'Mia Musterfrau', role: 'player', ttr_points: 1500, team_number: 1, position_number: 2 },
  ];

  const mockTeams = [
    { id: 't-1', name: 'Herren I', short_name: 'Herren 1', webcal_url: 'webcal://foo', active: true },
  ];

  const mockAbsences = [
    { id: 'a-1', player_id: 'p-2', start_date: '2026-08-15', end_date: '2026-08-15', reason: 'Holiday', profiles: { name: 'Mia Musterfrau' } },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
    vi.stubGlobal('alert', vi.fn());
  });

  const setupMocks = () => {
    const fromMock = vi.fn().mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }),
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'p-new' }, error: null }),
            }),
          }),
        };
      }
      if (table === 'teams') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockTeams, error: null }),
            }),
          }),
        };
      }
      if (table === 'club_settings') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { key: 'registered_teams_count', value: '1' }, error: null }),
            }),
          }),
        };
      }
      if (table === 'absences') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockAbsences, error: null }),
          }),
        };
      }
      return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
    });

    vi.mocked(supabase.from).mockImplementation(fromMock as any);
  };

  it('renders loading state then loads and displays Sportwart dashboard', async () => {
    setupMocks();

    render(<SportwartView />);

    await waitFor(() => {
      expect(screen.getByText(/Sportwart-Dashboard/)).toBeTruthy();
      expect(screen.getByText('Max Mustermann')).toBeTruthy();
      expect(screen.getAllByText('Mia Musterfrau').length).toBeGreaterThan(0);
    });
  });

  it('allows adding a new player', async () => {
    setupMocks();

    render(<SportwartView />);

    await waitFor(() => {
      expect(screen.getByText('Spieler anlegen')).toBeTruthy();
    });

    const addBtn = screen.getByText('Spieler anlegen');
    fireEvent.click(addBtn);

    // Wait for player add form to render
    await waitFor(() => {
      expect(screen.getByPlaceholderText('z.B. Max Mustermann')).toBeTruthy();
    });

    const nameInput = screen.getByPlaceholderText('z.B. Max Mustermann');
    fireEvent.change(nameInput, { target: { value: 'New Test Player' } });

    // Now both "Speichern" buttons are present: the Settings save and the Player save.
    const submitBtn = screen.getAllByText('Speichern')[1];
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });
  });
});

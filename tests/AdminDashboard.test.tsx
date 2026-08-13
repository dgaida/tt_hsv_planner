import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDashboard from '../src/components/AdminDashboard';
import { supabase } from '../src/lib/supabaseClient';

vi.mock('../src/lib/supabaseClient', () => {
  return {
    supabase: {
      from: vi.fn(),
      functions: {
        invoke: vi.fn(),
      },
    },
  };
});

describe('AdminDashboard', () => {
  const mockTeams = [
    { id: 't-1', name: 'Herren I', short_name: 'Herren 1', webcal_url: 'webcal://foo', active: true },
  ];

  const mockProfiles = [
    { id: 'p-1', name: 'Max Mustermann', role: 'club_admin' },
  ];

  const mockSyncRuns = [
    { id: 'run-1', started_at: '2026-08-09T18:00:00.000Z', status: 'success', summary_text: 'Synchronisiert' },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
    vi.stubGlobal('alert', vi.fn());
  });

  const setupMocks = () => {
    const fromMock = vi.fn().mockImplementation((table: string) => {
      if (table === 'teams') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockTeams, error: null }),
          }),
        };
      }
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }),
          }),
        };
      }
      if (table === 'sync_runs') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: mockSyncRuns, error: null }),
            }),
          }),
        };
      }
      return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
    });

    vi.mocked(supabase.from).mockImplementation(fromMock as any);
  };

  it('loads and displays teams, profiles and sync logs', async () => {
    setupMocks();

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('🛡️ Vereins-Administration')).toBeTruthy();
      expect(screen.getByText('Herren I')).toBeTruthy();
      expect(screen.getByText('Max M')).toBeTruthy();
      expect(screen.getByText('Synchronisiert')).toBeTruthy();
    });
  });

  it('triggers edge function manual sync on button click', async () => {
    setupMocks();
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { message: 'Sync complete' },
      error: null,
    } as any);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Spielpläne jetzt synchronisieren/)).toBeTruthy();
    });

    const syncBtn = screen.getByText(/Spielpläne jetzt synchronisieren/);
    fireEvent.click(syncBtn);

    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith('sync-calendars', expect.any(Object));
      expect(screen.getByText('Sync complete')).toBeTruthy();
    });
  });
});

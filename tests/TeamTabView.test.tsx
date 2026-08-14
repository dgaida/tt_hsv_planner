import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TeamTabView from '../src/components/TeamTabView';
import { supabase } from '../src/lib/supabaseClient';
import { syncTeamCalendar } from '../src/lib/syncEngine';

vi.mock('../src/lib/supabaseClient', () => {
  return {
    supabase: {
      from: vi.fn(),
    },
  };
});

vi.mock('../src/lib/syncEngine', () => {
  return {
    syncTeamCalendar: vi.fn().mockResolvedValue({
      status: 'success',
      teamId: 'team-123',
      teamName: 'Herren I',
      message: 'Mock sync success',
      added: 0,
      updated: 0,
      rescheduled: 0,
      deactivated: 0,
    }),
  };
});

describe('TeamTabView', () => {
  const mockTeamId = 'team-123';
  const mockUserId = 'user-456';

  const mockTeam = { id: 'team-123', name: 'Herren I' };

  const mockMatches = [
    {
      id: 'm-1',
      team_id: mockTeamId,
      summary: 'Herren I vs TV Klaswipper',
      dtstart: '2026-08-12T18:00:00.000Z',
      is_home: true,
      active: true,
      version: 1,
      matchday: 1,
    },
  ];

  const mockUserAv = [
    { id: 'av-123', match_id: 'm-1', player_id: mockUserId, response: 'yes', comment: 'Let\'s go', version_responded: 1, profiles: { name: 'Max' } },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and renders team matches and user votes', async () => {
    const fromMock = vi.fn().mockImplementation((table: string) => {
      const queryMock: any = {
        eq: vi.fn().mockImplementation(() => queryMock),
        in: vi.fn().mockImplementation(() => queryMock),
        order: vi.fn().mockImplementation(() => queryMock),
        single: vi.fn().mockImplementation(() => Promise.resolve({ data: null, error: null })),
        select: vi.fn().mockImplementation(() => queryMock),
        delete: vi.fn().mockImplementation(() => queryMock),
        insert: vi.fn().mockImplementation(() => queryMock),
        update: vi.fn().mockImplementation(() => queryMock),
        then: vi.fn().mockImplementation((onFulfilled) => {
          return Promise.resolve({ data: [], error: null }).then(onFulfilled);
        }),
      };

      if (table === 'teams') {
        queryMock.order = vi.fn().mockResolvedValue({ data: [mockTeam], error: null });
        queryMock.single = vi.fn().mockResolvedValue({ data: mockTeam, error: null });
      }
      if (table === 'matches') {
        queryMock.order = vi.fn().mockResolvedValue({ data: mockMatches, error: null });
      }
      if (table === 'profiles') {
        queryMock.single = vi.fn().mockResolvedValue({ data: { id: mockUserId, name: 'Max', team_number: 1 }, error: null });
        queryMock.order = vi.fn().mockResolvedValue({ data: [], error: null });
      }
      if (table === 'availabilities') {
        queryMock.then = vi.fn().mockImplementation((onFulfilled) => {
          return Promise.resolve({ data: mockUserAv, error: null }).then(onFulfilled);
        });
      }

      return queryMock;
    });

    vi.mocked(supabase.from).mockImplementation(fromMock as any);

    render(
      <TeamTabView
        teamId={mockTeamId}
        userId={mockUserId}
        userRole="player"
        isClubAdmin={false}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Herren I/)).toBeTruthy();
      expect(screen.getByText(/gegen TV Klaswipper/)).toBeTruthy();
    });

    const jaBtn = screen.getByRole('button', { name: /Ja/ });
    expect(jaBtn).toBeTruthy();
  });

  it('correctly prioritizes lineup: yes > no response > maybe > no', async () => {
    const mockProfiles = [
      { id: 'p-1', name: 'Player A', team_number: 1, position_number: 1, role: 'player' },
      { id: 'p-2', name: 'Player B', team_number: 1, position_number: 2, role: 'player' },
      { id: 'p-3', name: 'Player C', team_number: 1, position_number: 3, role: 'player' },
      { id: 'p-4', name: 'Player D', team_number: 1, position_number: 4, role: 'player' },
      { id: 'p-5', name: 'Player E', team_number: 1, position_number: 5, role: 'player' },
      { id: 'p-6', name: 'Player F', team_number: 1, position_number: 6, role: 'player' },
    ];

    const mockAvs = [
      { id: 'av-1', match_id: 'm-1', player_id: 'p-1', response: 'no', version_responded: 1, profiles: { name: 'Player A' } },
      { id: 'av-2', match_id: 'm-1', player_id: 'p-2', response: 'maybe', version_responded: 1, profiles: { name: 'Player B' } },
      { id: 'av-3', match_id: 'm-1', player_id: 'p-3', response: 'yes', version_responded: 1, profiles: { name: 'Player C' } },
      // Player D has no RSVP
      { id: 'av-5', match_id: 'm-1', player_id: 'p-5', response: 'yes', version_responded: 1, profiles: { name: 'Player E' } },
      { id: 'av-6', match_id: 'm-1', player_id: 'p-6', response: 'no', version_responded: 1, profiles: { name: 'Player F' } },
    ];

    const fromMock = vi.fn().mockImplementation((table: string) => {
      const queryMock: any = {
        eq: vi.fn().mockImplementation(() => queryMock),
        in: vi.fn().mockImplementation(() => queryMock),
        order: vi.fn().mockImplementation(() => queryMock),
        single: vi.fn().mockImplementation(() => Promise.resolve({ data: null, error: null })),
        select: vi.fn().mockImplementation(() => queryMock),
        delete: vi.fn().mockImplementation(() => queryMock),
        insert: vi.fn().mockImplementation(() => queryMock),
        update: vi.fn().mockImplementation(() => queryMock),
        then: vi.fn().mockImplementation((onFulfilled) => {
          return Promise.resolve({ data: [], error: null }).then(onFulfilled);
        }),
      };

      if (table === 'teams') {
        queryMock.order = vi.fn().mockResolvedValue({ data: [mockTeam], error: null });
        queryMock.single = vi.fn().mockResolvedValue({ data: mockTeam, error: null });
      }
      if (table === 'matches') {
        queryMock.order = vi.fn().mockResolvedValue({ data: mockMatches, error: null });
      }
      if (table === 'profiles') {
        queryMock.single = vi.fn().mockResolvedValue({ data: { id: mockUserId, name: 'Max', team_number: 1 }, error: null });
        queryMock.order = vi.fn().mockResolvedValue({ data: mockProfiles, error: null });
      }
      if (table === 'availabilities') {
        queryMock.then = vi.fn().mockImplementation((onFulfilled) => {
          return Promise.resolve({ data: mockAvs, error: null }).then(onFulfilled);
        });
      }

      return queryMock;
    });

    vi.mocked(supabase.from).mockImplementation(fromMock as any);

    render(
      <TeamTabView
        teamId={mockTeamId}
        userId={mockUserId}
        userRole="team_manager"
        isClubAdmin={false}
      />
    );

    // Wait for the tab to load and render the matches and lineups
    await waitFor(() => {
      expect(screen.getByText(/Herren I/)).toBeTruthy();
      const lineupSection = screen.getByText(/👥 Aufstellung/).closest('.w-full');
      expect(lineupSection).toBeTruthy();

      // Players in Priorities 1, 2, 3, and 4 should be in the top 5 lineup
      expect(lineupSection!.textContent).toContain('Player C'); // Priority 1 (yes)
      expect(lineupSection!.textContent).toContain('Player E'); // Priority 1 (yes)
      expect(lineupSection!.textContent).toContain('Player D'); // Priority 2 (no response)
      expect(lineupSection!.textContent).toContain('Player B'); // Priority 3 (maybe)
      expect(lineupSection!.textContent).toContain('Player A'); // Priority 4 (no) - 5th player (Ersatzspieler)

      // Player F (Priority 4, position 6, "Nein") should not be in the top 5 lineup because Player A (position 1) has higher ranking
      expect(lineupSection!.textContent).not.toContain('Player F');
    });
  });

  it('does NOT call syncTeamCalendar when a player clicks Aktualisieren', async () => {
    const fromMock = vi.fn().mockImplementation((table: string) => {
      const queryMock: any = {
        eq: vi.fn().mockImplementation(() => queryMock),
        in: vi.fn().mockImplementation(() => queryMock),
        order: vi.fn().mockImplementation(() => queryMock),
        single: vi.fn().mockImplementation(() => Promise.resolve({ data: null, error: null })),
        select: vi.fn().mockImplementation(() => queryMock),
        delete: vi.fn().mockImplementation(() => queryMock),
        insert: vi.fn().mockImplementation(() => queryMock),
        update: vi.fn().mockImplementation(() => queryMock),
        then: vi.fn().mockImplementation((onFulfilled) => {
          return Promise.resolve({ data: [], error: null }).then(onFulfilled);
        }),
      };

      if (table === 'teams') {
        queryMock.order = vi.fn().mockResolvedValue({ data: [mockTeam], error: null });
        queryMock.single = vi.fn().mockResolvedValue({ data: mockTeam, error: null });
      }
      if (table === 'matches') {
        queryMock.order = vi.fn().mockResolvedValue({ data: mockMatches, error: null });
      }
      if (table === 'profiles') {
        queryMock.single = vi.fn().mockResolvedValue({ data: { id: mockUserId, name: 'Max', team_number: 1 }, error: null });
        queryMock.order = vi.fn().mockResolvedValue({ data: [], error: null });
      }
      if (table === 'availabilities') {
        queryMock.then = vi.fn().mockImplementation((onFulfilled) => {
          return Promise.resolve({ data: mockUserAv, error: null }).then(onFulfilled);
        });
      }

      return queryMock;
    });

    vi.mocked(supabase.from).mockImplementation(fromMock as any);

    render(
      <TeamTabView
        teamId={mockTeamId}
        userId={mockUserId}
        userRole="player"
        isClubAdmin={false}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Herren I/)).toBeTruthy();
    });

    const refreshBtn = screen.getByRole('button', { name: /🔄 Aktualisieren/ });
    expect(refreshBtn).toBeTruthy();

    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(screen.getByText(/Daten aus Datenbank neu geladen/)).toBeTruthy();
    });

    expect(syncTeamCalendar).not.toHaveBeenCalled();
  });

  it('calls syncTeamCalendar when a team manager clicks Aktualisieren', async () => {
    const fromMock = vi.fn().mockImplementation((table: string) => {
      const queryMock: any = {
        eq: vi.fn().mockImplementation(() => queryMock),
        in: vi.fn().mockImplementation(() => queryMock),
        order: vi.fn().mockImplementation(() => queryMock),
        single: vi.fn().mockImplementation(() => Promise.resolve({ data: null, error: null })),
        select: vi.fn().mockImplementation(() => queryMock),
        delete: vi.fn().mockImplementation(() => queryMock),
        insert: vi.fn().mockImplementation(() => queryMock),
        update: vi.fn().mockImplementation(() => queryMock),
        then: vi.fn().mockImplementation((onFulfilled) => {
          return Promise.resolve({ data: [], error: null }).then(onFulfilled);
        }),
      };

      if (table === 'teams') {
        queryMock.order = vi.fn().mockResolvedValue({ data: [mockTeam], error: null });
        queryMock.single = vi.fn().mockResolvedValue({ data: mockTeam, error: null });
      }
      if (table === 'matches') {
        queryMock.order = vi.fn().mockResolvedValue({ data: mockMatches, error: null });
      }
      if (table === 'profiles') {
        queryMock.single = vi.fn().mockResolvedValue({ data: { id: mockUserId, name: 'Max', team_number: 1 }, error: null });
        queryMock.order = vi.fn().mockResolvedValue({ data: [], error: null });
      }
      if (table === 'availabilities') {
        queryMock.then = vi.fn().mockImplementation((onFulfilled) => {
          return Promise.resolve({ data: mockUserAv, error: null }).then(onFulfilled);
        });
      }

      return queryMock;
    });

    vi.mocked(supabase.from).mockImplementation(fromMock as any);

    render(
      <TeamTabView
        teamId={mockTeamId}
        userId={mockUserId}
        userRole="team_manager"
        isClubAdmin={false}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Herren I/)).toBeTruthy();
    });

    const refreshBtn = screen.getByRole('button', { name: /🔄 Aktualisieren/ });
    expect(refreshBtn).toBeTruthy();

    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(screen.getByText(/Erfolgreich synchronisiert! Neue Spiele: 0/)).toBeTruthy();
    });

    expect(syncTeamCalendar).toHaveBeenCalledWith(expect.anything(), mockTeamId);
  });

  it('deletes availability record when switching back to "Keine Antwort" in lineup dropdown', async () => {
    const mockProfiles = [
      { id: mockUserId, name: 'Max', team_number: 1, position_number: 1, role: 'team_manager' },
    ];
    const mockAvs = [
      { id: 'av-123', match_id: 'm-1', player_id: mockUserId, response: 'yes', version_responded: 1, profiles: { name: 'Max' } },
    ];

    const deleteMock = vi.fn().mockImplementation(() => ({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    }));

    const fromMock = vi.fn().mockImplementation((table: string) => {
      const queryMock: any = {
        eq: vi.fn().mockImplementation(() => queryMock),
        in: vi.fn().mockImplementation(() => queryMock),
        order: vi.fn().mockImplementation(() => queryMock),
        single: vi.fn().mockImplementation(() => Promise.resolve({ data: null, error: null })),
        select: vi.fn().mockImplementation(() => queryMock),
        delete: deleteMock,
        insert: vi.fn().mockImplementation(() => queryMock),
        update: vi.fn().mockImplementation(() => queryMock),
        then: vi.fn().mockImplementation((onFulfilled) => {
          return Promise.resolve({ data: [], error: null }).then(onFulfilled);
        }),
      };

      if (table === 'teams') {
        queryMock.order = vi.fn().mockResolvedValue({ data: [mockTeam], error: null });
        queryMock.single = vi.fn().mockResolvedValue({ data: mockTeam, error: null });
      }
      if (table === 'matches') {
        queryMock.order = vi.fn().mockResolvedValue({ data: mockMatches, error: null });
      }
      if (table === 'profiles') {
        queryMock.single = vi.fn().mockResolvedValue({ data: { id: mockUserId, name: 'Max', team_number: 1 }, error: null });
        queryMock.order = vi.fn().mockResolvedValue({ data: mockProfiles, error: null });
      }
      if (table === 'availabilities') {
        queryMock.then = vi.fn().mockImplementation((onFulfilled) => {
          return Promise.resolve({ data: mockAvs, error: null }).then(onFulfilled);
        });
      }

      return queryMock;
    });

    vi.mocked(supabase.from).mockImplementation(fromMock as any);

    render(
      <TeamTabView
        teamId={mockTeamId}
        userId={mockUserId}
        userRole="team_manager"
        isClubAdmin={false}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Herren I/)).toBeTruthy();
    });

    const selectElem = screen.getByDisplayValue('Ja');
    expect(selectElem).toBeTruthy();

    fireEvent.change(selectElem, { target: { value: '' } });

    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalled();
    });
  });
});

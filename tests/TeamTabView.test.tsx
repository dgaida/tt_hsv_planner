import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TeamTabView from '../src/components/TeamTabView';
import { supabase } from '../src/lib/supabaseClient';

vi.mock('../src/lib/supabaseClient', () => {
  return {
    supabase: {
      from: vi.fn(),
    },
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
    vi.restoreAllMocks();
  });

  it('loads and renders team matches and user votes', async () => {
    const fromMock = vi.fn().mockImplementation((table: string) => {
      if (table === 'teams') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [mockTeam], error: null }),
              single: vi.fn().mockResolvedValue({ data: mockTeam, error: null }),
            }),
          }),
        };
      }
      if (table === 'matches') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockMatches, error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        };
      }
      if (table === 'availabilities') {
        const queryMock = {
          eq: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: mockUserAv, error: null }),
          select: vi.fn().mockReturnThis(),
        };
        // Ensure chaining is supportable
        queryMock.eq.mockReturnValue(queryMock);
        return {
          select: vi.fn().mockReturnValue(queryMock),
        };
      }
      if (table === 'match_changes') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          }),
        };
      }
      return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
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
    ];

    const mockAvs = [
      { id: 'av-1', match_id: 'm-1', player_id: 'p-1', response: 'no', version_responded: 1, profiles: { name: 'Player A' } },
      { id: 'av-2', match_id: 'm-1', player_id: 'p-2', response: 'maybe', version_responded: 1, profiles: { name: 'Player B' } },
      { id: 'av-3', match_id: 'm-1', player_id: 'p-3', response: 'yes', version_responded: 1, profiles: { name: 'Player C' } },
      // Player D has no RSVP
      { id: 'av-5', match_id: 'm-1', player_id: 'p-5', response: 'yes', version_responded: 1, profiles: { name: 'Player E' } },
    ];

    const fromMock = vi.fn().mockImplementation((table: string) => {
      if (table === 'teams') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [mockTeam], error: null }),
              single: vi.fn().mockResolvedValue({ data: mockTeam, error: null }),
            }),
          }),
        };
      }
      if (table === 'matches') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockMatches, error: null }),
              }),
            }),
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
      if (table === 'availabilities') {
        const queryMock = {
          eq: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: mockAvs, error: null }),
          select: vi.fn().mockReturnThis(),
        };
        queryMock.eq.mockReturnValue(queryMock);
        return {
          select: vi.fn().mockReturnValue(queryMock),
        };
      }
      if (table === 'match_changes') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          }),
        };
      }
      return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
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

      // Players in Priorities 1, 2, and 3 should be in the top 4 lineup
      expect(lineupSection!.textContent).toContain('Player C'); // Priority 1 (yes)
      expect(lineupSection!.textContent).toContain('Player E'); // Priority 1 (yes)
      expect(lineupSection!.textContent).toContain('Player D'); // Priority 2 (no response)
      expect(lineupSection!.textContent).toContain('Player B'); // Priority 3 (maybe)

      // Player A (Priority 4, "Nein") should not be in the top 4 lineup because we have 4 other preferred players
      expect(lineupSection!.textContent).not.toContain('Player A');
    });
  });
});

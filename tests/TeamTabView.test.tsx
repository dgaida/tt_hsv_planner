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

  const mockTeam = { name: 'Herren I' };

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
});

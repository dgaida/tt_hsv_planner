import { describe, it, expect } from 'vitest';
import {
  getFirstName,
  formatShortDayDate,
  formatTime,
  getDeadlineDayDate,
  getOpponentName,
  generateWhatsAppMessage,
} from '../src/lib/whatsappUtils';

describe('whatsappUtils', () => {
  it('extracts first name correctly', () => {
    expect(getFirstName('Max Mustermann')).toBe('Max');
    expect(getFirstName('Erika')).toBe('Erika');
    expect(getFirstName(' Hans  Peter ')).toBe('Hans');
    expect(getFirstName('')).toBe('');
  });

  it('formats short day date and time correctly', () => {
    const dtstart = '2026-08-15T18:30:00.000Z';
    const shortDate = formatShortDayDate(dtstart);
    expect(shortDate).toMatch(/^(Mo|Di|Mi|Do|Fr|Sa|So) \d{2}\.\d{2}\.$/);

    const timeStr = formatTime(dtstart);
    expect(timeStr).toMatch(/^\d{2}:\d{2}$/);
  });

  it('calculates 1-week deadline date correctly', () => {
    const dtstart = '2026-08-15T18:30:00.000Z'; // Saturday Aug 15
    const deadlineStr = getDeadlineDayDate(dtstart);
    // 7 days prior: Aug 8
    expect(deadlineStr).toMatch(/08\.08\.$/);
  });

  it('parses opponent name correctly for home and away matches', () => {
    const homeMatch = { summary: 'Heiligenhauser SV vs TTV Gegner Stadt', is_home: true };
    const awayMatch = { summary: 'TTV Gegner Stadt vs Heiligenhauser SV', is_home: false };

    expect(getOpponentName(homeMatch)).toBe('TTV Gegner Stadt');
    expect(getOpponentName(awayMatch)).toBe('TTV Gegner Stadt');
  });

  it('generates Option 1 WhatsApp message when >= 4 players confirm', () => {
    const match = {
      id: 'm-1',
      summary: 'Heiligenhauser SV vs TTG Rivalen',
      is_home: true,
      dtstart: '2026-09-20T17:00:00.000Z',
      version: 1,
    };

    const matchAvailabilities = [
      { match_id: 'm-1', player_id: 'p-1', response: 'yes', version_responded: 1 },
      { match_id: 'm-1', player_id: 'p-2', response: 'yes', version_responded: 1 },
      { match_id: 'm-1', player_id: 'p-3', response: 'yes', version_responded: 1 },
      { match_id: 'm-1', player_id: 'p-4', response: 'yes', version_responded: 1 },
    ];

    const allProfiles = [
      { id: 'p-1', name: 'Alice Schmidt', team_number: 1, position_number: 1 },
      { id: 'p-2', name: 'Bob Müller', team_number: 1, position_number: 2 },
      { id: 'p-3', name: 'Charlie Meier', team_number: 1, position_number: 3 },
      { id: 'p-4', name: 'David Schulze', team_number: 1, position_number: 4 },
    ];

    const message = generateWhatsAppMessage(match, matchAvailabilities, allProfiles);
    expect(message).toContain('Das Heimspiel gegen TTG Rivalen am');
    expect(message).toContain('spielen wir in der Aufstellung Alice, Bob, Charlie, David.');
  });

  it('generates Option 2 WhatsApp message when < 4 players confirm', () => {
    const match = {
      id: 'm-2',
      summary: 'Post SV vs Heiligenhauser SV',
      is_home: false,
      dtstart: '2026-10-10T14:00:00.000Z',
      version: 1,
    };

    const matchAvailabilities = [
      { match_id: 'm-2', player_id: 'p-1', response: 'yes', version_responded: 1 },
      { match_id: 'm-2', player_id: 'p-2', response: 'yes', version_responded: 1 },
    ];

    const allProfiles = [
      { id: 'p-1', name: 'Alice Schmidt', team_number: 1, position_number: 1 },
      { id: 'p-2', name: 'Bob Müller', team_number: 1, position_number: 2 },
    ];

    const message = generateWhatsAppMessage(match, matchAvailabilities, allProfiles);
    expect(message).toContain('WICHTIG: Für das Auswärtsspiel gegen Post SV am');
    expect(message).toContain('fehlen uns noch 2 Spieler! Bisher haben zugesagt: Alice, Bob.');
    expect(message).toContain('melden, ansonsten muss ich das Spiel absagen.');
  });

  it('respects custom match lineup order if defined', () => {
    const match = {
      id: 'm-3',
      summary: 'Heiligenhauser SV vs TTC Table',
      is_home: true,
      dtstart: '2026-11-05T19:00:00.000Z',
      version: 1,
      lineup: ['p-3', 'p-1', 'p-4', 'p-2'],
    };

    const matchAvailabilities = [
      { match_id: 'm-3', player_id: 'p-1', response: 'yes', version_responded: 1 },
      { match_id: 'm-3', player_id: 'p-2', response: 'yes', version_responded: 1 },
      { match_id: 'm-3', player_id: 'p-3', response: 'yes', version_responded: 1 },
      { match_id: 'm-3', player_id: 'p-4', response: 'yes', version_responded: 1 },
    ];

    const allProfiles = [
      { id: 'p-1', name: 'Alice Schmidt' },
      { id: 'p-2', name: 'Bob Müller' },
      { id: 'p-3', name: 'Charlie Meier' },
      { id: 'p-4', name: 'David Schulze' },
    ];

    const message = generateWhatsAppMessage(match, matchAvailabilities, allProfiles);
    expect(message).toContain('spielen wir in der Aufstellung Charlie, Alice, David, Bob.');
  });
});

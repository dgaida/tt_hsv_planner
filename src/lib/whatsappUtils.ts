export function getFirstName(fullName: string): string {
  if (!fullName) return '';
  const trimmed = fullName.trim();
  const spaceIndex = trimmed.indexOf(' ');
  if (spaceIndex === -1) return trimmed;
  return trimmed.substring(0, spaceIndex);
}

export function formatShortDayDate(dateStr: string): string {
  const date = new Date(dateStr);
  const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' }); // e.g. "Sa" or "Sa."
  const cleanDayName = dayName.replace(/\.$/, '');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${cleanDayName} ${day}.${month}.`;
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getDeadlineDayDate(dtstartStr: string): string {
  const matchDate = new Date(dtstartStr);
  const deadlineDate = new Date(matchDate);
  deadlineDate.setDate(matchDate.getDate() - 7);
  return formatShortDayDate(deadlineDate.toISOString());
}

export function getOpponentName(match: { summary: string; is_home: boolean }): string {
  if (!match || !match.summary) return '';
  if (match.is_home) {
    return (match.summary.split(' vs ')[1] || match.summary).trim();
  } else {
    return (match.summary.split(' vs ')[0] || match.summary).trim();
  }
}

export function generateWhatsAppMessage(
  match: any,
  matchAvailabilities: any[],
  allProfiles: any[],
  teamPlayers: any[] = []
): string {
  const matchType = match.is_home ? 'Heimspiel' : 'Auswärtsspiel';
  const opponent = getOpponentName(match);
  const dateTimeStr = `${formatShortDayDate(match.dtstart)} um ${formatTime(match.dtstart)} Uhr`;

  // Get active confirmed ("yes") availabilities for this match version
  const yesAvails = matchAvailabilities.filter(
    (a) => a.match_id === match.id && a.response === 'yes' && a.version_responded === match.version
  );

  // Map confirmed player profiles
  let confirmedProfiles: any[] = [];

  if (match.lineup && Array.isArray(match.lineup) && match.lineup.length > 0) {
    // If custom lineup is defined, filter confirmed players and order by match.lineup index
    const lineupOrder = match.lineup as string[];
    const profilesMap = new Map<string, any>();

    yesAvails.forEach((av) => {
      const prof = allProfiles.find((p) => p.id === av.player_id) || av.profiles;
      if (prof) {
        profilesMap.set(prof.id, prof);
      }
    });

    // Pick profiles in lineup order first, then any remaining confirmed profiles
    const ordered: any[] = [];
    lineupOrder.forEach((pid) => {
      if (profilesMap.has(pid)) {
        ordered.push(profilesMap.get(pid));
        profilesMap.delete(pid);
      }
    });
    profilesMap.forEach((prof) => ordered.push(prof));
    confirmedProfiles = ordered;
  } else {
    // Sort confirmed profiles by team_number, position_number, name
    confirmedProfiles = yesAvails
      .map((av) => allProfiles.find((p) => p.id === av.player_id) || av.profiles)
      .filter(Boolean);

    confirmedProfiles.sort((a, b) => {
      const teamNumA = a.team_number ?? 999999;
      const teamNumB = b.team_number ?? 999999;
      if (teamNumA !== teamNumB) return teamNumA - teamNumB;

      const posNumA = a.position_number ?? 999999;
      const posNumB = b.position_number ?? 999999;
      if (posNumA !== posNumB) return posNumA - posNumB;

      return (a.name || '').localeCompare(b.name || '');
    });
  }

  const confirmedFirstNames = confirmedProfiles
    .map((p) => getFirstName(p.name))
    .filter(Boolean);

  if (yesAvails.length >= 4) {
    // Option 1: 4 or more yes votes
    // "🏓 Das Heim-/Auswärtsspiel gegen Gegner am DDD TT.MM. um HH:MM Uhr spielen wir in der Aufstellung A, B, C, D mit Backup E."
    const primaryNames = confirmedFirstNames.slice(0, 4).join(', ');
    const backupStr = confirmedFirstNames.length > 4 ? ` mit Backup ${confirmedFirstNames[4]}` : '';
    return `🏓 Das ${matchType} gegen ${opponent} am ${dateTimeStr} spielen wir in der Aufstellung ${primaryNames}${backupStr}.`;
  } else {
    // Option 2: less than 4 yes votes
    // "⚠️ WICHTIG: Für das Heim-/Auswärtsspiel gegen Gegner am DDD TT.MM. um HH:MM Uhr fehlt/fehlen uns noch N Spieler! Bisher haben zugesagt: A, B, C. Bitte bis DDD TT.MM. melden, ansonsten muss ich das Spiel absagen. 🙏"
    const missingCount = 4 - yesAvails.length;
    const missingPhrase = missingCount === 1 ? 'fehlt uns noch 1 Spieler' : `fehlen uns noch ${missingCount} Spieler`;
    const confirmedList = confirmedFirstNames.length > 0 ? confirmedFirstNames.join(', ') : 'keine';
    const deadlineStr = getDeadlineDayDate(match.dtstart);

    return `⚠️ WICHTIG: Für das ${matchType} gegen ${opponent} am ${dateTimeStr} ${missingPhrase}! Bisher haben zugesagt: ${confirmedList}. Bitte bis ${deadlineStr} melden, ansonsten muss ich das Spiel absagen. 🙏`;
  }
}

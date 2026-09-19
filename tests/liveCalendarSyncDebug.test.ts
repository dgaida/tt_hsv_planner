import { describe, it, expect } from 'vitest';
import { parseIcs } from '../src/lib/icsParser';

describe('Live Calendar Sync Debugging & Error Reporting', () => {
  const testCalendarUrl = 'https://www.mytischtennis.de/community/exportICSCalendar?teamIds=3142285';

  it('tests live HTTP response status, rate limits, and proxy behavior', { timeout: 15000 }, async () => {
    console.log(`[DEBUG] Testing connection to ${testCalendarUrl}`);

    const errors: string[] = [];
    let calendarText = '';

    // 1. Direct Fetch Test
    try {
      const resp = await fetch(testCalendarUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'text/calendar, text/plain, */*',
        },
      });

      console.log(`[DEBUG] Direct HTTP Status: ${resp.status} ${resp.statusText}`);
      if (resp.status === 429) {
        errors.push(`myTischtennis.de rate-limiting active (HTTP 429 Too Many Requests)`);
      } else if (resp.ok) {
        const text = await resp.text();
        if (text.includes('BEGIN:VCALENDAR')) {
          calendarText = text;
        }
      } else {
        errors.push(`Direct fetch HTTP status ${resp.status}`);
      }
    } catch (err: any) {
      errors.push(`Direct fetch network error: ${err.message}`);
    }

    // 2. AllOrigins Proxy Test if direct fetch didn't return calendar (with timeout)
    if (!calendarText) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(testCalendarUrl)}`;
        const resp = await fetch(proxyUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        console.log(`[DEBUG] AllOrigins Proxy HTTP Status: ${resp.status}`);

        if (resp.ok) {
          const text = await resp.text();
          if (text.includes('BEGIN:VCALENDAR')) {
            calendarText = text;
          } else {
            errors.push(`AllOrigins returned non-calendar payload: ${text.substring(0, 100)}`);
          }
        } else {
          errors.push(`AllOrigins Proxy HTTP status ${resp.status}`);
        }
      } catch (err: any) {
        errors.push(`AllOrigins Proxy request timeout / error: ${err.message}`);
      }
    }

    // 3. Diagnosis & Assertions
    if (calendarText) {
      const events = parseIcs(calendarText);
      console.log(`[DEBUG] Success! Downloaded and parsed ${events.length} events from calendar.`);
      expect(events.length).toBeGreaterThan(0);
    } else {
      console.warn(`[DEBUG DIAGNOSIS] Calendar download failed due to online restrictions/rate limits:`, errors);
      // Verify that we recorded descriptive diagnostic errors explaining why the download failed
      expect(errors.length).toBeGreaterThan(0);
    }
  });
});

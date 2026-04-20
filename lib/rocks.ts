import { getClientDb } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';

export type RockPeriod = 'week' | 'quarter' | 'year';

export interface Rock {
  id: string;
  text: string;
  completed: boolean;
  period: RockPeriod;
  order: number;
  userId: string;
  /**
   * Canonical period identifier.
   * - week:    ISO-8601 week starting Monday, e.g. "2026-W17"
   * - quarter: "2026-Q2"
   * - year:    "2026"
   */
  periodKey: string;
  createdAt: Date;
}

/* -------------------------------------------------------------------------- */
/*  Date math                                                                 */
/* -------------------------------------------------------------------------- */

const MS_PER_DAY = 86_400_000;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Monday at 00:00:00 local time for the week that contains `date`. */
export function getMondayOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay(); // Sunday = 0 ... Saturday = 6
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

/** ISO-8601 week number + ISO week-year for a given local date. */
function getISOWeekParts(date: Date): { year: number; week: number } {
  // Shift to UTC midnight of the same calendar day to sidestep DST.
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = utc.getUTCDay() || 7; // Mon=1 ... Sun=7
  // Nearest Thursday: current date + 4 - current day number
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
  const yearStart = Date.UTC(utc.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((utc.getTime() - yearStart) / MS_PER_DAY + 1) / 7);
  return { year: utc.getUTCFullYear(), week };
}

export function getWeekKeyForDate(date: Date): string {
  const { year, week } = getISOWeekParts(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export function getQuarterKeyForDate(date: Date): string {
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `${date.getFullYear()}-Q${quarter}`;
}

export function getYearKeyForDate(date: Date): string {
  return date.getFullYear().toString();
}

export function getCurrentWeekKey(): string {
  return getWeekKeyForDate(new Date());
}

export function getCurrentQuarterKey(): string {
  return getQuarterKeyForDate(new Date());
}

export function getCurrentYearKey(): string {
  return getYearKeyForDate(new Date());
}

export function getPeriodKey(period: RockPeriod): string {
  switch (period) {
    case 'week':
      return getCurrentWeekKey();
    case 'quarter':
      return getCurrentQuarterKey();
    case 'year':
      return getCurrentYearKey();
  }
}

/* -------------------------------------------------------------------------- */
/*  Parsing + ranges                                                          */
/* -------------------------------------------------------------------------- */

function parseWeekKey(weekKey: string): { year: number; week: number } {
  const match = /^(\d{4})-W(\d{2})$/.exec(weekKey);
  if (!match) throw new Error(`Invalid week key: ${weekKey}`);
  return { year: parseInt(match[1], 10), week: parseInt(match[2], 10) };
}

function parseQuarterKey(quarterKey: string): { year: number; quarter: number } {
  const match = /^(\d{4})-Q([1-4])$/.exec(quarterKey);
  if (!match) throw new Error(`Invalid quarter key: ${quarterKey}`);
  return { year: parseInt(match[1], 10), quarter: parseInt(match[2], 10) };
}

function parseYearKey(yearKey: string): number {
  const match = /^(\d{4})$/.exec(yearKey);
  if (!match) throw new Error(`Invalid year key: ${yearKey}`);
  return parseInt(match[1], 10);
}

/** Monday 00:00 and Sunday 23:59:59.999 for the ISO week identified by `weekKey`. */
export function getWeekRange(weekKey: string): { start: Date; end: Date } {
  const { year, week } = parseWeekKey(weekKey);
  // Jan 4 is always in ISO week 1
  const jan4 = new Date(year, 0, 4);
  const week1Monday = getMondayOfWeek(jan4);
  const start = new Date(week1Monday);
  start.setDate(week1Monday.getDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function getQuarterRange(quarterKey: string): { start: Date; end: Date } {
  const { year, quarter } = parseQuarterKey(quarterKey);
  const start = new Date(year, (quarter - 1) * 3, 1, 0, 0, 0, 0);
  const end = new Date(year, quarter * 3, 0, 23, 59, 59, 999);
  return { start, end };
}

export function getYearRange(yearKey: string): { start: Date; end: Date } {
  const year = parseYearKey(yearKey);
  return {
    start: new Date(year, 0, 1, 0, 0, 0, 0),
    end: new Date(year, 11, 31, 23, 59, 59, 999),
  };
}

/* -------------------------------------------------------------------------- */
/*  Navigation                                                                */
/* -------------------------------------------------------------------------- */

export function addWeeks(weekKey: string, delta: number): string {
  const { start } = getWeekRange(weekKey);
  const target = new Date(start);
  target.setDate(start.getDate() + delta * 7);
  return getWeekKeyForDate(target);
}

export function addQuarters(quarterKey: string, delta: number): string {
  const { year, quarter } = parseQuarterKey(quarterKey);
  const totalQuarters = (year * 4 + (quarter - 1)) + delta;
  const newYear = Math.floor(totalQuarters / 4);
  const newQuarter = (totalQuarters % 4 + 4) % 4 + 1;
  return `${newYear}-Q${newQuarter}`;
}

export function addYears(yearKey: string, delta: number): string {
  return String(parseYearKey(yearKey) + delta);
}

/* -------------------------------------------------------------------------- */
/*  Quarter <-> week mapping                                                  */
/* -------------------------------------------------------------------------- */

/** The quarter key a given week belongs to (based on its Monday). */
export function getQuarterForWeek(weekKey: string): string {
  const { start } = getWeekRange(weekKey);
  return getQuarterKeyForDate(start);
}

/** All ISO weeks whose Monday falls within the given quarter, in order. */
export function getWeeksInQuarter(quarterKey: string): string[] {
  const { start, end } = getQuarterRange(quarterKey);
  // Start from the Monday of the week containing the first day of the quarter.
  // We include a week only if its Monday is within [start, end].
  let monday = getMondayOfWeek(start);
  if (monday < start) {
    monday = new Date(monday);
    monday.setDate(monday.getDate() + 7);
  }
  const keys: string[] = [];
  const cursor = new Date(monday);
  while (cursor <= end) {
    keys.push(getWeekKeyForDate(cursor));
    cursor.setDate(cursor.getDate() + 7);
  }
  return keys;
}

/* -------------------------------------------------------------------------- */
/*  Formatting                                                                */
/* -------------------------------------------------------------------------- */

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatShort(date: Date, withYear: boolean): string {
  const base = `${MONTH_SHORT[date.getMonth()]} ${date.getDate()}`;
  return withYear ? `${base}, ${date.getFullYear()}` : base;
}

/** e.g. "Week 17 · Apr 20 – Apr 26" (adds year if week spans year boundary or isn't current year) */
export function formatWeekLabel(weekKey: string): string {
  const { week } = parseWeekKey(weekKey);
  const { start, end } = getWeekRange(weekKey);
  const currentYear = new Date().getFullYear();
  const spansYears = start.getFullYear() !== end.getFullYear();
  const notCurrentYear =
    start.getFullYear() !== currentYear || end.getFullYear() !== currentYear;
  const showYear = spansYears || notCurrentYear;
  return `Week ${week} · ${formatShort(start, showYear && spansYears)} – ${formatShort(end, showYear)}`;
}

export function formatWeekRangeShort(weekKey: string): string {
  const { start, end } = getWeekRange(weekKey);
  return `${formatShort(start, false)} – ${formatShort(end, false)}`;
}

export function formatQuarterLabel(quarterKey: string): string {
  const { year, quarter } = parseQuarterKey(quarterKey);
  return `Q${quarter} ${year}`;
}

export function formatQuarterRange(quarterKey: string): string {
  const { start, end } = getQuarterRange(quarterKey);
  return `${formatShort(start, false)} – ${formatShort(end, false)}`;
}

export function formatYearLabel(yearKey: string): string {
  return yearKey;
}

/* -------------------------------------------------------------------------- */
/*  Firestore operations                                                      */
/* -------------------------------------------------------------------------- */

export async function createRock(
  rock: Omit<Rock, 'id' | 'userId' | 'createdAt' | 'periodKey'>,
  userId: string,
  explicitPeriodKey?: string
): Promise<Rock> {
  const db = getClientDb();
  if (!db) throw new Error('Firestore not available');
  const periodKey = explicitPeriodKey ?? getPeriodKey(rock.period);
  const now = new Date();
  const docRef = await addDoc(collection(db, 'rocks'), {
    ...rock,
    userId,
    periodKey,
    createdAt: Timestamp.fromDate(now),
  });
  return {
    id: docRef.id,
    ...rock,
    userId,
    periodKey,
    createdAt: now,
  };
}

export async function updateRock(
  rockId: string,
  updates: Partial<Pick<Rock, 'text' | 'completed' | 'order'>>
) {
  const db = getClientDb();
  if (!db) throw new Error('Firestore not available');
  const ref = doc(db, 'rocks', rockId);
  await updateDoc(ref, updates);
}

export async function deleteRock(rockId: string) {
  const db = getClientDb();
  if (!db) throw new Error('Firestore not available');
  const ref = doc(db, 'rocks', rockId);
  await deleteDoc(ref);
}

export async function reorderRocks(
  rocks: { id: string; order: number }[]
) {
  const db = getClientDb();
  if (!db) throw new Error('Firestore not available');
  const batch = writeBatch(db);
  rocks.forEach(({ id, order }) => {
    const ref = doc(db, 'rocks', id);
    batch.update(ref, { order });
  });
  await batch.commit();
}

/**
 * Subscribe to rocks for a given period + explicit periodKey.
 * Pass an empty string or omit to default to the current period.
 */
export function subscribeToRocks(
  userId: string,
  period: RockPeriod,
  periodKey: string,
  callback: (rocks: Rock[]) => void
) {
  const db = getClientDb();
  if (!db) throw new Error('Firestore not available');
  const effectiveKey = periodKey || getPeriodKey(period);
  const q = query(
    collection(db, 'rocks'),
    where('userId', '==', userId),
    where('period', '==', period),
    where('periodKey', '==', effectiveKey)
  );
  return onSnapshot(q, (snapshot) => {
    const rocks = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
      } as Rock;
    });
    rocks.sort((a, b) => a.order - b.order);
    callback(rocks);
  });
}

/**
 * Subscribe to rock counts for a set of period keys (e.g. every week in a quarter).
 * Emits a map of periodKey -> { total, completed }.
 */
export function subscribeToRockCounts(
  userId: string,
  period: RockPeriod,
  periodKeys: string[],
  callback: (counts: Record<string, { total: number; completed: number }>) => void
) {
  const db = getClientDb();
  if (!db) throw new Error('Firestore not available');
  if (periodKeys.length === 0) {
    callback({});
    return () => {};
  }
  // Firestore `in` queries are limited to 30 values; chunk if needed.
  const chunks: string[][] = [];
  for (let i = 0; i < periodKeys.length; i += 30) {
    chunks.push(periodKeys.slice(i, i + 30));
  }

  const chunkResults: Record<number, Record<string, { total: number; completed: number }>> = {};

  const emit = () => {
    const merged: Record<string, { total: number; completed: number }> = {};
    for (const key of periodKeys) {
      merged[key] = { total: 0, completed: 0 };
    }
    for (const idx of Object.keys(chunkResults)) {
      const chunk = chunkResults[Number(idx)];
      for (const [k, v] of Object.entries(chunk)) {
        merged[k] = v;
      }
    }
    callback(merged);
  };

  const unsubs = chunks.map((chunk, idx) => {
    const q = query(
      collection(db, 'rocks'),
      where('userId', '==', userId),
      where('period', '==', period),
      where('periodKey', 'in', chunk)
    );
    return onSnapshot(q, (snapshot) => {
      const counts: Record<string, { total: number; completed: number }> = {};
      for (const key of chunk) counts[key] = { total: 0, completed: 0 };
      snapshot.forEach((d) => {
        const data = d.data() as { periodKey: string; completed?: boolean };
        const entry = counts[data.periodKey] ?? { total: 0, completed: 0 };
        entry.total += 1;
        if (data.completed) entry.completed += 1;
        counts[data.periodKey] = entry;
      });
      chunkResults[idx] = counts;
      emit();
    });
  });

  return () => unsubs.forEach((u) => u());
}

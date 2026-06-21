import type { SealRecord, ReturnRecord } from '../types';

const SEAL_RECORDS_KEY = 'coldchain_seal_records';
const RETURN_RECORDS_KEY = 'coldchain_return_records';

export function loadSealRecords(defaultRecords: SealRecord[]): SealRecord[] {
  try {
    const raw = localStorage.getItem(SEAL_RECORDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return defaultRecords;
}

export function saveSealRecords(records: SealRecord[]): void {
  try {
    const toSave = records.map(r => ({
      ...r,
      photoUrl: r.photoUrl ? '(photo-captured)' : null
    }));
    localStorage.setItem(SEAL_RECORDS_KEY, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}

export function loadReturnRecords(defaultRecords: ReturnRecord[]): ReturnRecord[] {
  try {
    const raw = localStorage.getItem(RETURN_RECORDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return defaultRecords;
}

export function saveReturnRecords(records: ReturnRecord[]): void {
  try {
    localStorage.setItem(RETURN_RECORDS_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

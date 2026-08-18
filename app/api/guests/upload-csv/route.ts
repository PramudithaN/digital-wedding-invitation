import { NextResponse } from 'next/server';
import { getGuests, updateGuest } from '@/lib/db';
import { normalizePhoneNumber } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

// Helper to parse RFC-4180 compliant CSV content
function parseCSV(text: string): Record<string, string>[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === '\n' || char === '\r') {
      if (inQuotes) {
        currentLine += char;
      } else {
        if (char === '\r' && nextChar === '\n') {
          i++; // skip \n
        }
        lines.push(currentLine);
        currentLine = '';
      }
    } else {
      currentLine += char;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  
  if (lines.length === 0) return [];
  
  // Parse headers
  const headers = splitCSVLine(lines[0]);
  const records: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = splitCSVLine(line);
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header.trim()] = values[index]?.trim() || '';
    });
    records.push(record);
  }
  
  return records;
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',') {
      if (inQuotes) {
        current += char;
      } else {
        result.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    const text = await file.text();
    const records = parseCSV(text);
    
    if (records.length === 0) {
      return NextResponse.json({ error: 'The uploaded CSV file is empty' }, { status: 400 });
    }
    
    // Fetch all current guests to map them
    const guests = await getGuests();
    
    // Determine headers mapping
    const sampleRecord = records[0];
    const keys = Object.keys(sampleRecord);
    
    // Find key for table no
    const tableNoKey = keys.find(k => /table\s*(no|num|number)/i.test(k));
    // Find key for guest ID
    const idKey = keys.find(k => /guest\s*id|id/i.test(k));
    // Find key for guest name
    const nameKey = keys.find(k => /guest\s*name|name/i.test(k));
    // Find key for phone
    const phoneKey = keys.find(k => /phone|mobile|contact/i.test(k));
    
    if (!tableNoKey) {
      return NextResponse.json({ 
        error: 'Could not find a "Table No" column in the CSV file. Please make sure the column is named "Table No".' 
      }, { status: 400 });
    }
    
    let updateCount = 0;
    const errors: string[] = [];
    
    for (const record of records) {
      const tableNoValue = record[tableNoKey]?.trim() || '';
      
      // Attempt to find the guest in the database
      let matchedGuest = null;
      
      // 1. Match by Guest ID
      if (idKey && record[idKey]) {
        const idVal = record[idKey].trim();
        matchedGuest = guests.find(g => g.id.toLowerCase() === idVal.toLowerCase());
      }
      
      // 2. Match by Name (fallback)
      if (!matchedGuest && nameKey && record[nameKey]) {
        const nameVal = record[nameKey].trim().toLowerCase();
        matchedGuest = guests.find(g => g.name.trim().toLowerCase() === nameVal);
      }
      
      // 3. Match by Phone (fallback)
      if (!matchedGuest && phoneKey && record[phoneKey]) {
        const phoneVal = normalizePhoneNumber(record[phoneKey].trim());
        if (phoneVal) {
          matchedGuest = guests.find(g => {
            const guestPhone = g.phone ? normalizePhoneNumber(g.phone) : '';
            return guestPhone && guestPhone === phoneVal;
          });
        }
      }
      
      if (matchedGuest) {
        // Only update if the table number has actually changed
        if ((matchedGuest.table_no || '') !== tableNoValue) {
          await updateGuest(matchedGuest.id, { table_no: tableNoValue });
          updateCount++;
        }
      } else {
        const nameDesc = (nameKey && record[nameKey]) ? `"${record[nameKey]}"` : `Row with ID ${record[idKey || '']}`;
        errors.push(`Could not match guest: ${nameDesc}`);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      updatedCount: updateCount,
      totalRowsProcessed: records.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : null, // return first 10 errors if any
      totalErrors: errors.length
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An error occurred during file upload.' }, { status: 500 });
  }
}

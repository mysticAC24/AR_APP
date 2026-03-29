import React, { useState, useContext } from 'react';
import { AppContext } from '../lib/context.jsx';
import { db, storage } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { CalendarIcon, ChevronRight, Upload } from 'lucide-react';
import ICAL from 'ical.js';

function parseICSToSchedule(fileText) {
  try {
    const jcal = ICAL.parse(fileText);
    const comp = new ICAL.Component(jcal);
    const vevents = comp.getAllSubcomponents('vevent');
    const seen = new Set();
    const result = [];
    for (const e of vevents) {
      const dtstart = e.getFirstPropertyValue('dtstart');
      if (!dtstart) continue;
      // Skip all-day events (ical.js marks DATE-only values with isDate = true)
      if (dtstart.isDate) continue;
      const jsStart = dtstart.toJSDate();
      const startTime = jsStart.toTimeString().slice(0, 5);
      // Skip midnight-anchored events (likely all-day or badly formatted)
      if (startTime === '00:00') continue;
      const day = jsStart.getDay();
      const key = `${day}-${startTime}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const dtend = e.getFirstPropertyValue('dtend');
      const endTime = dtend ? dtend.toJSDate().toTimeString().slice(0, 5) : startTime;
      result.push({ day, startTime, endTime });
    }
    return result;
  } catch {
    return [];
  }
}

const DAY_MAP = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
};

function parseCSVToSchedule(text) {
  try {
    const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
    const seen = new Set();
    const result = [];
    for (const line of lines) {
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      if (cols.length < 2) continue;
      const [dayRaw, startRaw, endRaw] = cols;
      // Skip header row
      const dayLower = dayRaw.toLowerCase();
      if (dayLower === 'day' || dayLower === 'days') continue;
      let day;
      if (/^\d$/.test(dayRaw)) {
        day = parseInt(dayRaw);
      } else {
        day = DAY_MAP[dayLower];
      }
      if (day === undefined || day < 0 || day > 6) continue;
      const startTime = startRaw?.slice(0, 5) || '';
      const endTime = endRaw?.slice(0, 5) || startTime;
      if (!startTime || startTime === '00:00') continue;
      const key = `${day}-${startTime}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({ day, startTime, endTime });
    }
    return result;
  } catch {
    return [];
  }
}

export default function OnboardingPage() {
  const { firebaseUser } = useContext(AppContext);

  const [form, setForm] = useState({
    fullName: firebaseUser?.displayName || '',
    phone: '',
    vertical: 'Design',
    role: 'Representative',
    upiId: '',
  });
  const [icsFile, setIcsFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) { setError('Full name is required.'); return; }
    if (!form.phone.trim()) { setError('Phone number is required.'); return; }

    setLoading(true);
    setError('');

    try {
      let schedule = [];

      // Parse schedule file in browser if provided
      if (icsFile) {
        const text = await icsFile.text();
        schedule = icsFile.name.toLowerCase().endsWith('.csv')
          ? parseCSVToSchedule(text)
          : parseICSToSchedule(text);

        // Also upload to Storage for backup
        try {
          const storageRef = ref(storage, `schedules/${firebaseUser.uid}.ics`);
          await uploadBytes(storageRef, icsFile);
        } catch {
          // Non-fatal — schedule is already parsed
        }
      }

      // Write user document to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        uid: firebaseUser.uid,
        fullName: form.fullName.trim(),
        email: firebaseUser.email,
        phone: form.phone.trim(),
        avatarUrl: firebaseUser.photoURL || '',
        bannerUrl: '',
        role: form.role,
        vertical: form.vertical,
        upiId: form.upiId.trim(),
        totalHours: 0,
        badgesAppreciate: 0,
        badgesSlap: 0,
        isFreeNow: true,
        schedule,
        onboardingComplete: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // onAuthStateChanged in context will pick up the new doc and route to main app
    } catch (err) {
      setError('Failed to save profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-100 min-h-screen font-sans">
      <div className="w-full max-w-md bg-white min-h-screen sm:min-h-[auto] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <div className="bg-white text-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl rotate-3">
            <CalendarIcon size={28} />
          </div>
          <h1 className="text-2xl font-black">Welcome to AlumSync</h1>
          <p className="text-blue-100 mt-1 text-sm">Set up your profile to get started</p>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                required
                type="text"
                value={form.fullName}
                onChange={e => handleChange('fullName', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Vertical</label>
                <select
                  value={form.vertical}
                  onChange={e => handleChange('vertical', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="Design">Design</option>
                  <option value="Networking">Networking</option>
                  <option value="Operations">Operations</option>
                  <option value="Media">Media</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Role</label>
                <select
                  value={form.role}
                  onChange={e => handleChange('role', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="Representative">Representative</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Team Leader">Team Leader</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">UPI ID <span className="font-normal text-gray-400 normal-case">(for expense reimbursement)</span></label>
              <input
                type="text"
                value={form.upiId}
                onChange={e => handleChange('upiId', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="yourname@okhdfc (optional)"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Weekly Schedule <span className="font-normal text-gray-400 normal-case">(.ics or .csv, optional)</span>
              </label>
              <label className="flex items-center justify-center w-full border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group">
                <input
                  type="file"
                  accept=".ics,.csv"
                  className="hidden"
                  onChange={e => setIcsFile(e.target.files?.[0] || null)}
                />
                <Upload size={18} className="text-gray-400 group-hover:text-blue-500 mr-2 transition-colors" />
                <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                  {icsFile ? icsFile.name : 'Upload .ics or .csv timetable'}
                </span>
              </label>
              {icsFile && (
                <p className="text-xs text-green-600 mt-1.5 font-medium">✓ Schedule will be parsed automatically</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl mt-2 hover:bg-blue-700 active:bg-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>Join Platform <ChevronRight size={18} className="ml-1" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

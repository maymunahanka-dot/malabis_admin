import { useState } from 'react';
import { Ban, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useBlockDays } from '../hooks/useBlockDays';
import { useConsultations } from '../hooks/useConsultations';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
const pad = (n) => String(n).padStart(2, '0');
const toKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

export default function Calendar() {
  const today = new Date();
  const [viewMode, setViewMode] = useState('Months');
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [blockMode, setBlockMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [blockModal, setBlockModal] = useState(null); // { dateKey }
  const [blockForm, setBlockForm] = useState({ location: 'all', appointmentWith: 'all', type: 'all' });
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    return d.getDate() - d.getDay();
  });
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const { blockDays, loading: loadingBlocks, error: blockError, block, unblock } = useBlockDays();
  const { consultations, loading: loadingConsults } = useConsultations();
  const { toast } = useToast();

  const loading = loadingBlocks || loadingConsults;

  // build lookup maps
  const blockedMap = {};
  blockDays.forEach((b) => {
    const key = b.date?.split('T')[0];
    if (key) blockedMap[key] = b.id;
  });

  const consultMap = {};
  consultations.forEach((c) => {
    const key = c.date?.split('T')[0];
    if (key) {
      if (!consultMap[key]) consultMap[key] = [];
      consultMap[key].push(c);
    }
  });

  // navigation
  const prevPeriod = () => {
    if (viewMode === 'Months') {
      if (month === 0) { setMonth(11); setYear(y => y - 1); }
      else setMonth(m => m - 1);
    } else if (viewMode === 'Weeks') {
      const d = new Date(year, month, weekStart - 7);
      setYear(d.getFullYear()); setMonth(d.getMonth()); setWeekStart(d.getDate());
    } else {
      const d = new Date(year, month, selectedDay - 1);
      setYear(d.getFullYear()); setMonth(d.getMonth()); setSelectedDay(d.getDate());
    }
  };

  const nextPeriod = () => {
    if (viewMode === 'Months') {
      if (month === 11) { setMonth(0); setYear(y => y + 1); }
      else setMonth(m => m + 1);
    } else if (viewMode === 'Weeks') {
      const d = new Date(year, month, weekStart + 7);
      setYear(d.getFullYear()); setMonth(d.getMonth()); setWeekStart(d.getDate());
    } else {
      const d = new Date(year, month, selectedDay + 1);
      setYear(d.getFullYear()); setMonth(d.getMonth()); setSelectedDay(d.getDate());
    }
  };

  const toggleBlock = async (dateKey) => {
    if (!blockMode) return;
    if (blockedMap[dateKey]) {
      // unblock directly
      setSaving(true);
      try {
        await unblock(blockedMap[dateKey]);
        toast('Day unblocked', 'info');
      } catch (err) { toast(err.message, 'error'); }
      finally { setSaving(false); }
    } else {
      // open modal to choose options
      setBlockForm({ location: 'all', appointmentWith: 'all', type: 'all' });
      setBlockModal({ dateKey });
    }
  };

  const confirmBlock = async () => {
    if (!blockModal) return;
    setSaving(true);
    try {
      await block(blockModal.dateKey, blockForm);
      toast('Day blocked');
      setBlockModal(null);
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  // month grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(year, month, weekStart + i);
    return { date: d.getDate(), month: d.getMonth(), year: d.getFullYear() };
  });

  const periodLabel = viewMode === 'Months'
    ? `${monthName}, ${year}`
    : viewMode === 'Weeks'
    ? (() => {
        const s = new Date(year, month, weekStart);
        const e = new Date(year, month, weekStart + 6);
        return `${s.toLocaleDateString('default', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      })()
    : new Date(year, month, selectedDay).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Spinner size={36} />
    </div>
  );

  if (blockError) return (
    <div className="p-8 text-red-500 text-sm">Failed to load calendar: {blockError}</div>
  );

  return (
    <div className="p-8">
      <div className="mb-6">
        <p className="text-[#8B7355] mb-1">Welcome back, Aaminah</p>
        <h1 className="text-3xl font-serif text-[#B8860B]">Calendar</h1>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 mb-6">
        {['Months', 'Weeks', 'Days'].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === mode
                ? 'bg-[#B8860B] text-white'
                : 'bg-white text-[#8B7355] border border-[#E5E0D8] hover:border-[#B8860B]'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-[#4A4035]">{periodLabel}</h2>
          <button onClick={prevPeriod} className="p-1 hover:bg-[#F5F0E8] rounded">
            <ChevronLeft size={20} className="text-[#8B7355]" />
          </button>
          <button onClick={nextPeriod} className="p-1 hover:bg-[#F5F0E8] rounded">
            <ChevronRight size={20} className="text-[#8B7355]" />
          </button>
        </div>
        <button
          onClick={() => setBlockMode(b => !b)}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-60 ${
            blockMode ? 'bg-[#4B5563] text-white' : 'bg-[#6B7280] text-white hover:bg-[#5A6268]'
          }`}
        >
          {saving ? <Spinner size={16} /> : <Ban size={18} />}
          {blockMode ? 'Done Blocking' : 'Block Days'}
        </button>
      </div>

      {blockMode && (
        <p className="text-xs text-[#8B7355] mb-3 italic">Click a date to toggle block / unblock</p>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-[#6B5E4E]">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#B8860B] inline-block" /> Appointment</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#6B7280] inline-block" /> Blocked</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#B8860B] border-2 border-[#B8860B] inline-block" /> Today</span>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'Months' && (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E0D8] overflow-hidden">
          <div className="grid grid-cols-7 bg-[#B8860B]">
            {WEEK_DAYS.map((d) => (
              <div key={d} className="py-3 text-center text-white font-medium text-sm">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const key = day ? toKey(year, month, day) : null;
              const isB = key && !!blockedMap[key];
              const appts = key ? (consultMap[key] || []) : [];
              return (
                <div
                  key={i}
                  onClick={() => key && toggleBlock(key)}
                  className={`min-h-[80px] p-2 border-r border-b border-[#E5E0D8] transition-colors
                    ${!day ? 'bg-[#FAF8F5]' : ''}
                    ${isB ? 'bg-[#F3F4F6]' : 'bg-white'}
                    ${day && blockMode ? 'cursor-pointer hover:bg-[#FFF8EC]' : ''}
                  `}
                >
                  {day && (
                    <>
                      <span className={`text-sm font-medium inline-flex items-center justify-center w-6 h-6 ${
                        isToday(day) ? 'bg-[#B8860B] text-white rounded-full' : 'text-[#4A4035]'
                      }`}>
                        {day}
                      </span>
                      <div className="mt-1 flex flex-col gap-0.5">
                        {isB && (
                          <span className="text-[10px] font-medium bg-[#6B7280] text-white px-1.5 py-0.5 rounded">
                            Blocked{blockDays.find(b => b.id === blockedMap[key])?.location !== 'all' ? ` · ${blockDays.find(b => b.id === blockedMap[key])?.location}` : ''}
                          </span>
                        )}
                        {appts.slice(0, 2).map((a, idx) => (
                          <span key={idx} className="text-[10px] font-medium bg-[#FEF3C7] text-[#92400E] px-1.5 py-0.5 rounded truncate">
                            {a.fullName}
                          </span>
                        ))}
                        {appts.length > 2 && (
                          <span className="text-[10px] text-[#B8860B]">+{appts.length - 2} more</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'Weeks' && (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E0D8] overflow-hidden">
          <div className="grid grid-cols-7 bg-[#B8860B]">
            {weekDates.map((wd, i) => (
              <div key={i} className="py-3 text-center text-white font-medium text-sm">
                {WEEK_DAYS[i]}<br />
                <span className="text-xs font-normal opacity-90">{wd.date}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {weekDates.map((wd, i) => {
              const key = toKey(wd.year, wd.month, wd.date);
              const isB = !!blockedMap[key];
              const appts = consultMap[key] || [];
              const isTd = wd.date === today.getDate() && wd.month === today.getMonth() && wd.year === today.getFullYear();
              return (
                <div
                  key={i}
                  onClick={() => blockMode && toggleBlock(key)}
                  className={`min-h-[160px] p-3 border-r border-[#E5E0D8] transition-colors
                    ${isTd ? 'bg-[#FFFBF0]' : isB ? 'bg-[#F3F4F6]' : 'bg-white'}
                    ${blockMode ? 'cursor-pointer hover:bg-[#FFF8EC]' : ''}
                  `}
                >
                  {isB && <span className="text-[10px] font-medium bg-[#6B7280] text-white px-1.5 py-0.5 rounded">Blocked</span>}
                  <div className="mt-2 flex flex-col gap-1">
                    {appts.map((a, idx) => (
                      <div key={idx} className="text-[10px] bg-[#FEF3C7] text-[#92400E] px-1.5 py-1 rounded">
                        <p className="font-semibold truncate">{a.fullName}</p>
                        <p className="truncate opacity-80">{a.appointmentType}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {viewMode === 'Days' && (() => {
        const key = toKey(year, month, selectedDay);
        const isB = !!blockedMap[key];
        const appts = consultMap[key] || [];
        return (
          <div className="bg-white rounded-xl shadow-sm border border-[#E5E0D8] overflow-hidden">
            <div className="bg-[#B8860B] py-3 px-6 text-white font-medium text-sm">
              {new Date(year, month, selectedDay).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="p-6 min-h-[300px] flex flex-col gap-4">
              {isB && <span className="inline-block px-3 py-1.5 text-sm font-medium bg-[#6B7280] text-white rounded w-fit">Blocked Date</span>}
              {appts.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {appts.map((a, i) => (
                    <div key={i} className="border border-[#E5E0D8] rounded-lg p-4 bg-[#FDFAF5]">
                      <p className="font-semibold text-[#2C1F0E]">{a.fullName}</p>
                      <p className="text-sm text-[#8B7355]">{a.appointmentType}</p>
                      {a.time && <p className="text-xs text-[#A09080] mt-1">{a.time}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                !isB && <p className="text-sm text-[#A09080]">No appointments scheduled.</p>
              )}
              {blockMode && (
                <button
                  onClick={() => toggleBlock(key)}
                  disabled={saving}
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-[#6B7280] text-white rounded-lg text-sm hover:bg-[#5A6268] transition-colors w-fit disabled:opacity-60"
                >
                  <Ban size={16} /> {isB ? 'Unblock this day' : 'Block this day'}
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Block Modal */}
      {blockModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#2C1F0E]">Block {blockModal.dateKey}</h3>
              <button onClick={() => setBlockModal(null)}><X size={18} className="text-[#8B7355]" /></button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B5E4E] uppercase tracking-wide">Location</label>
              <select value={blockForm.location} onChange={e => setBlockForm(p => ({ ...p, location: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-[#FDFAF5] text-sm text-[#2C1F0E] focus:outline-none focus:border-[#B8860B]">
                <option value="all">All Locations</option>
                <option value="MalaabisbyMaymz Abuja Branch">Abuja</option>
                <option value="MalaabisbyMaymz Kano Branch">Kano</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B5E4E] uppercase tracking-wide">Appointment With</label>
              <select value={blockForm.appointmentWith} onChange={e => setBlockForm(p => ({ ...p, appointmentWith: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-[#FDFAF5] text-sm text-[#2C1F0E] focus:outline-none focus:border-[#B8860B]">
                <option value="all">All</option>
                <option value="team">Design Team Only</option>
                <option value="maimuna">Maimuna Anka</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B5E4E] uppercase tracking-wide">Appointment Type</label>
              <select value={blockForm.type} onChange={e => setBlockForm(p => ({ ...p, type: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-[#FDFAF5] text-sm text-[#2C1F0E] focus:outline-none focus:border-[#B8860B]">
                <option value="all">All Types</option>
                <option value="physical">Physical</option>
                <option value="virtual">Virtual</option>
              </select>
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={confirmBlock} disabled={saving}
                className="flex-1 py-2.5 bg-[#6B7280] text-white rounded-lg text-sm font-semibold hover:bg-[#5A6268] disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Spinner size={16} />} Block Day
              </button>
              <button onClick={() => setBlockModal(null)}
                className="flex-1 py-2.5 border border-[#E5E0D8] text-[#8B7355] rounded-lg text-sm font-medium hover:bg-[#F5F0E8]">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

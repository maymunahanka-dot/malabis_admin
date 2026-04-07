import { useState, useMemo } from 'react';
import { ChevronDown, TrendingUp, BookOpen, Users, Download } from 'lucide-react';
import { usePayments } from '../hooks/usePayments';
import { useConsultations } from '../hooks/useConsultations';
import { useClients } from '../hooks/useClients';
import Spinner from '../components/Spinner';

const fmt = (n) => `₦${Number(n).toLocaleString()}`;

const FILTERS = ['This week', 'This month', 'This year'];

function isInRange(dateStr, filter) {
  const d = new Date(dateStr);
  const now = new Date();
  if (filter === 'This week') {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return d >= start;
  }
  if (filter === 'This month') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }
  if (filter === 'This year') {
    return d.getFullYear() === now.getFullYear();
  }
  return true;
}

export default function Reports() {
  const { payments, loading: lp } = usePayments();
  const { consultations, loading: lc } = useConsultations();
  const { clients, loading: lcl } = useClients();
  const [filter, setFilter] = useState('This month');
  const [showFilter, setShowFilter] = useState(false);

  const loading = lp || lc || lcl;

  const filteredPayments     = useMemo(() => payments.filter(p => isInRange(p.date || p.createdAt, filter)), [payments, filter]);
  const filteredConsultations = useMemo(() => consultations.filter(c => isInRange(c.date || c.createdAt, filter)), [consultations, filter]);
  const filteredClients      = useMemo(() => clients.filter(c => isInRange(c.createdAt, filter)), [clients, filter]);

  const totalRevenue  = filteredPayments.filter(p => p.status === 'Paid').reduce((a, p) => a + Number(p.amount), 0);
  const totalBookings = filteredConsultations.length;
  const totalClients  = filteredClients.length;

  const stats = [
    { label: 'Total Revenue',  value: fmt(totalRevenue),  sublabel: filter, icon: TrendingUp },
    { label: 'Total Bookings', value: totalBookings,       sublabel: filter, icon: BookOpen },
    { label: 'Total Clients',  value: totalClients,        sublabel: filter, icon: Users },
  ];

  // build monthly chart data from all paid payments this year
  const chartMonths = useMemo(() => {
    const months = Array(12).fill(0);
    payments.filter(p => p.status === 'Paid' && new Date(p.date || p.createdAt).getFullYear() === new Date().getFullYear())
      .forEach(p => { months[new Date(p.date || p.createdAt).getMonth()] += Number(p.amount); });
    return months;
  }, [payments]);

  const maxVal = Math.max(...chartMonths, 1);
  const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // SVG line chart
  const W = 600, H = 180, PAD = 10;
  const points = chartMonths.map((v, i) => {
    const x = PAD + (i / 11) * (W - PAD * 2);
    const y = H - PAD - ((v / maxVal) * (H - PAD * 2));
    return [x, y];
  });
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const areaD = `${pathD} L ${points[11][0]} ${H} L ${points[0][0]} ${H} Z`;

  // export CSV
  const exportCSV = () => {
    const rows = [
      ['Client', 'Service', 'Amount', 'Method', 'Date', 'Status'],
      ...payments.map(p => [p.clientName, p.service, p.amount, p.paymentMethod, p.date?.split('T')[0], p.status]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'payments_report.csv';
    a.click();
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner size={36} /></div>;

  return (
    <div className="p-8 bg-[#F5F0E8] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[#8B7355] mb-1">Welcome back, Aaminah</p>
          <h1 className="text-3xl font-serif text-[#B8860B]">Reports / Export</h1>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[#B8860B] text-white rounded-lg text-sm font-medium hover:bg-[#9A7209] transition-colors">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {stats.map(({ label, value, sublabel, icon: Icon }, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E0D8]">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-[#F5F0E8] rounded-lg">
                <Icon size={24} className="text-[#B8860B]" />
              </div>
              <div>
                <p className="text-sm text-[#8B7355]">{label}</p>
                <p className="text-xs text-[#A09080] mb-2">{sublabel}</p>
                <p className="text-2xl font-semibold text-[#4A4035]">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex items-center justify-end gap-4 mb-6">
        <div className="relative">
          <button onClick={() => setShowFilter(f => !f)}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-[#E5E0D8] rounded-xl text-sm text-[#4A4035] hover:border-[#B8860B]">
            {filter} <ChevronDown size={16} className="text-[#8B7355]" />
          </button>
          {showFilter && (
            <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-[#E5E0D8] z-10">
              {FILTERS.map(o => (
                <button key={o} onClick={() => { setFilter(o); setShowFilter(false); }}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-[#F5F0E8] first:rounded-t-lg last:rounded-b-lg ${filter === o ? 'text-[#B8860B] font-semibold' : 'text-[#4A4035]'}`}>
                  {o}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E0D8] p-6 mb-8">
        <h2 className="text-lg font-serif text-[#4A4035] mb-4">Revenue Chart — {new Date().getFullYear()}</h2>
        <div className="flex gap-4">
          {/* Y labels */}
          <div className="flex flex-col justify-between text-xs text-[#8B7355] text-right w-20 shrink-0" style={{ height: 180 }}>
            {[maxVal, maxVal*0.75, maxVal*0.5, maxVal*0.25, 0].map((v, i) => (
              <span key={i}>{fmt(Math.round(v))}</span>
            ))}
          </div>
          {/* SVG */}
          <div className="flex-1 flex flex-col gap-1">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B8860B" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#B8860B" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* grid */}
              {[0,0.25,0.5,0.75,1].map((v, i) => (
                <line key={i} x1={PAD} x2={W - PAD} y1={PAD + v * (H - PAD * 2)} y2={PAD + v * (H - PAD * 2)}
                  stroke="#E5E0D8" strokeWidth="1" />
              ))}
              <path d={areaD} fill="url(#areaGrad)" />
              <path d={pathD} fill="none" stroke="#B8860B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {points.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="4" fill="#B8860B" />
              ))}
            </svg>
            {/* X labels */}
            <div className="flex justify-between text-xs text-[#8B7355] px-2">
              {MONTH_LABELS.map(m => <span key={m}>{m}</span>)}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

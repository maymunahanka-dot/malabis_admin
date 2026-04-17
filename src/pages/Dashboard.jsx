import { useState } from 'react';
import { Search, Plus, BookMarked, Clock3, CalendarCheck2, TrendingUp } from 'lucide-react';
import AddReservationPanel from '../components/AddReservationPanel';
import ReservationDetailPanel from '../components/ReservationDetailPanel';
import { useConsultations } from '../hooks/useConsultations';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import { uploadMultiple } from '../lib/uploadToCloudinary';

const tabs = [
  'All',
  'Physical Bridal Consultation',
  'Virtual Bridal Consultation',
  'Fitting Session',
  'Measurement Session',
];

const statusColor = (s) => {
  if (s === 'Paid') return 'bg-green-100 text-green-700';
  if (s === 'Pending') return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

const Dashboard = () => {
  const { consultations, loading, create, update, remove } = useConsultations();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const stats = [
    { label: 'Total Bookings', sublabel: 'This week', value: consultations.length, icon: BookMarked },
    { label: 'Pending Approvals', sublabel: 'This week', value: consultations.filter(r => r.paymentStatus === 'Pending').length, icon: Clock3 },
    { label: "Today's Appointment", sublabel: 'Today', value: consultations.filter(r => r.date === new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })).length, icon: CalendarCheck2 },
    { label: 'Total Revenue', sublabel: 'All time', value: `₦${consultations.filter(r => r.paymentStatus === 'Paid').reduce((sum, r) => sum + (r.consultationFee || 0), 0).toLocaleString()}`, icon: TrendingUp },
  ];

  const buildFormData = (data) => {
    const formData = new FormData();
    // map frontend field names → backend field names
    const mapped = {
      fullName:        data.name,
      email:           data.email,
      phoneNumber:     data.phone,
      nextOfKin:       data.nextOfKin,
      nextOfKinPhone:  data.nextOfKinPhone,
      appointmentType: data.appointmentType,
      appointmentWith: data.appointmentWith,
      location:        data.appointmentLocation,
      date:            data.appointmentDate,
      time:            data.appointmentTime,
      consultationFee: data.consultationFee,
      paymentStatus:   data.paymentStatus,
      paymentGateway:  data.paymentGateway,
      fabricPreference:     data.fabricPreference,
      trainLength:          data.trainLength,
      sleevePreference:     data.sleevePreference,
      silhouettePreference: data.silhouettePreference,
      weddingDate:     data.weddingDate,
      budget:          data.budget,
      weddingLocation: data.weddingLocation,
      ceremonyType:    data.ceremonyType,
      additionalInfo:  data.additionalInfo,
    };
    Object.entries(mapped).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') formData.append(k, v);
    });
    // images array
    if (Array.isArray(data.images)) {
      data.images.forEach((file) => formData.append('inspirationImages', file));
    }
    return formData;
  };

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      let inspirationImages = [];
      if (Array.isArray(data.images) && data.images.some(f => f instanceof File)) {
        const files = data.images.filter(f => f instanceof File);
        inspirationImages = await uploadMultiple(files);
      }
      await create({
        fullName:        data.name || '',
        email:           data.email || '',
        phoneNumber:     data.phone || '',
        nextOfKin:       data.nextOfKin || '',
        nextOfKinPhone:  data.nextOfKinPhone || '',
        appointmentType: data.appointmentType || '',
        appointmentWith: data.appointmentWith || '',
        location:        data.appointmentLocation || '',
        date:            data.appointmentDate || '',
        time:            data.appointmentTime || '',
        consultationFee: data.consultationFee || '',
        paymentStatus:   data.paymentStatus || 'Pending',
        paymentGateway:  data.paymentGateway || '',
        fabricPreference:     data.fabricPreference || '',
        trainLength:          data.trainLength || '',
        sleevePreference:     data.sleevePreference || '',
        silhouettePreference: data.silhouettePreference || '',
        weddingDate:     data.weddingDate || '',
        budget:          data.budget || '',
        weddingLocation: data.weddingLocation || '',
        ceremonyType:    data.ceremonyType || '',
        additionalInfo:  data.additionalInfo || '',
        inspirationImages,
      });
      setPanelOpen(false);
      toast('Reservation added successfully');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (data) => {
    setSaving(true);
    try {
      let inspirationImages = Array.isArray(data.images)
        ? data.images.filter(f => typeof f === 'string') // keep existing URLs
        : [];
      const newFiles = Array.isArray(data.images) ? data.images.filter(f => f instanceof File) : [];
      if (newFiles.length > 0) {
        const uploaded = await uploadMultiple(newFiles);
        inspirationImages = [...inspirationImages, ...uploaded];
      }
      await update(selected.id, {
        fullName:        data.name || '',
        email:           data.email || '',
        phoneNumber:     data.phone || '',
        nextOfKin:       data.nextOfKin || '',
        nextOfKinPhone:  data.nextOfKinPhone || '',
        appointmentType: data.appointmentType || '',
        appointmentWith: data.appointmentWith || '',
        location:        data.appointmentLocation || '',
        date:            data.appointmentDate || '',
        time:            data.appointmentTime || '',
        consultationFee: data.consultationFee || '',
        paymentStatus:   data.paymentStatus || 'Pending',
        paymentGateway:  data.paymentGateway || '',
        fabricPreference:     data.fabricPreference || '',
        trainLength:          data.trainLength || '',
        sleevePreference:     data.sleevePreference || '',
        silhouettePreference: data.silhouettePreference || '',
        weddingDate:     data.weddingDate || '',
        budget:          data.budget || '',
        weddingLocation: data.weddingLocation || '',
        ceremonyType:    data.ceremonyType || '',
        additionalInfo:  data.additionalInfo || '',
        inspirationImages,
      });
      setEditOpen(false);
      setSelected(null);
      toast('Reservation updated');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await remove(selected.id);
      setDetailOpen(false);
      setSelected(null);
      toast('Reservation deleted', 'info');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // normalize MongoDB field names → panel field names
  const normalize = (r) => ({
    ...r,
    name:                r.fullName,
    phone:               r.phoneNumber,
    appointmentDate:     r.date,
    appointmentTime:     r.time,
    appointmentLocation: r.location,
    images:              r.inspirationImages || [],
  });

  const openDetail = (r) => {
    setSelected(normalize(r));
    setDetailOpen(true);
  };

  const filtered = consultations.filter((r) => {
    const matchTab = activeTab === 'All' || r.appointmentType === activeTab;
    const q = search.toLowerCase();
    const matchSearch = !q || r.fullName?.toLowerCase().includes(q) || r.date?.includes(q) || r.id?.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  return (
    <div className="px-10 py-8 bg-[#F5F0E8] min-h-screen font-sans">

      {/* Page Title */}
      <div className="mb-6">
        <p className="text-[#B8860B] text-sm font-medium mb-0.5">Welcome back, Aaminah</p>
        <h1 className="text-[2rem] font-bold text-[#2C1F0E] font-serif leading-tight">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl px-6 pt-5 pb-6 shadow-sm flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <Icon size={20} className="text-[#B8860B] mb-1" />
                <p className="text-sm font-semibold text-[#2C1F0E] font-sans leading-snug">{stat.label}</p>
                <p className="text-xs text-[#A09080] font-sans">{stat.sublabel}</p>
              </div>
              <p className="text-[2.2rem] font-bold text-[#1A1208] font-sans leading-none mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Reservations row */}
      <div className="flex items-center gap-4 mb-5">
        <h2 className="text-lg font-bold text-[#B8860B] font-serif whitespace-nowrap">Reservations</h2>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0A898]" size={15} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, ID or date"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E0D8] rounded-full text-sm text-[#8B7355] placeholder-[#C0B8A8] font-sans focus:outline-none focus:border-[#B8860B]"
          />
        </div>
        <button
          onClick={() => setPanelOpen(true)}
          disabled={saving}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-[#B8860B] text-white rounded-lg text-sm font-medium font-sans hover:bg-[#9A7209] transition-colors whitespace-nowrap disabled:opacity-60"
        >
          {saving ? <Spinner size={15} className="text-white" /> : <Plus size={15} />}
          + Add
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-7 mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm pb-1.5 whitespace-nowrap transition-colors font-sans ${
              activeTab === tab
                ? 'text-[#B8860B] font-semibold border-b-2 border-[#B8860B]'
                : 'text-[#6B5E4E] font-normal hover:text-[#B8860B]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-visible">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-[#EDEAE4]">
              <th className="px-6 py-4 text-sm font-semibold text-[#2C1F0E]">Client's ID</th>
              <th className="px-6 py-4 text-sm font-semibold text-[#2C1F0E]">Client's Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-[#2C1F0E]">Appointment Type</th>
              <th className="px-6 py-4 text-sm font-semibold text-[#2C1F0E]">Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-[#2C1F0E]">Payment</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center"><Spinner size={28} className="mx-auto" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-[#A09080]">No reservations found</td>
              </tr>
            ) : (
              filtered.map((r, i) => (
                <tr key={i} onClick={() => openDetail(r)} className="border-b border-[#F0EBE3] last:border-0 hover:bg-[#FDFAF5] transition-colors cursor-pointer">
                  <td className="px-6 py-4 text-sm text-[#4A4035]">{r.id?.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-4 text-sm text-[#4A4035]">{r.fullName}</td>
                  <td className="px-6 py-4 text-sm text-[#4A4035]">{r.appointmentType}</td>
                  <td className="px-6 py-4 text-sm text-[#4A4035]">
                    <div className="flex items-center gap-2">
                      <span>{r.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(r.paymentStatus)}`}>
                      {r.paymentStatus || '—'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddReservationPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onSubmit={handleSubmit}
      />

      <AddReservationPanel
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEdit}
        initial={selected ? {
          ...selected,
          name:              selected.fullName  || selected.name,
          phone:             selected.phoneNumber || selected.phone,
          appointmentDate:   selected.date?.split('T')[0] || selected.appointmentDate,
          appointmentTime:   selected.time || selected.appointmentTime,
          appointmentLocation: selected.location || selected.appointmentLocation,
          images:            selected.inspirationImages || selected.images || [],
        } : null}
      />

      <ReservationDetailPanel
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        reservation={selected}
        onEdit={() => { setDetailOpen(false); setEditOpen(true); }}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Dashboard;

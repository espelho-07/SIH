import React, { useState, useEffect } from 'react';
import { pharmacyApi } from '@/api/pharmacyApi';
import { MedicineInventoryItem } from '@/types/resources';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import {
  Package,
  Search,
  Plus,
  Minus,
  RefreshCw,
  X,
  Calendar,
} from 'lucide-react';

export const PharmacyStockPage: React.FC = () => {
  const [medicines, setMedicines] = useState<MedicineInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'EXPIRING_SOON' | 'OUT_OF_STOCK' | 'QUARANTINED'
  >('ALL');

  // Adjustment Modal State
  const [adjustModalMed, setAdjustModalMed] = useState<MedicineInventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [adjustAmount, setAdjustAmount] = useState<number>(100);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [submittingAdjustment, setSubmittingAdjustment] = useState(false);

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    setLoading(true);
    try {
      const res = await pharmacyApi.getMedicines();
      if (res.success && res.data) {
        setMedicines(res.data);
      }
    } catch (err) {
      console.error('Failed to load medicines inventory', err);
    } finally {
      setLoading(false);
    }
  };

  // Categories list
  const categories = ['ALL', ...Array.from(new Set(medicines.map((m) => m.category)))];

  // Filtered medicines
  const filteredMedicines = medicines.filter((med) => {
    if (statusFilter !== 'ALL' && med.status !== statusFilter) return false;
    if (selectedCategory !== 'ALL' && med.category !== selectedCategory) return false;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    return (
      med.medicineName.toLowerCase().includes(q) ||
      med.genericName.toLowerCase().includes(q) ||
      med.batchNumber.toLowerCase().includes(q) ||
      med.category.toLowerCase().includes(q)
    );
  });

  const handleOpenAdjust = (med: MedicineInventoryItem, type: 'ADD' | 'DEDUCT') => {
    setAdjustModalMed(med);
    setAdjustType(type);
    setAdjustAmount(type === 'ADD' ? 200 : 20);
    setAdjustReason(type === 'ADD' ? 'Routine central warehouse stock delivery' : 'Damaged / expired blister pack disposal');
  };

  const handleSaveAdjustment = async () => {
    if (!adjustModalMed) return;

    setSubmittingAdjustment(true);
    try {
      const delta = adjustType === 'ADD' ? adjustAmount : -adjustAmount;
      const res = await pharmacyApi.adjustStock(
        adjustModalMed.id,
        delta,
        adjustReason || 'Inventory reconciliation'
      );

      if (res.success && res.data) {
        setMedicines((prev) =>
          prev.map((m) => (m.id === res.data.id ? res.data : m))
        );
        setAdjustModalMed(null);
      }
    } catch (err) {
      console.error('Adjustment error', err);
      alert('Failed to adjust stock. Please try again.');
    } finally {
      setSubmittingAdjustment(false);
    }
  };

  // Metrics summary
  const totalCount = medicines.length;
  const inStockCount = medicines.filter((m) => m.status === 'IN_STOCK').length;
  const lowStockCount = medicines.filter((m) => m.status === 'LOW_STOCK').length;
  const expiringCount = medicines.filter((m) => m.status === 'EXPIRING_SOON').length;
  const outOfStockCount = medicines.filter((m) => m.status === 'OUT_OF_STOCK').length;
  const quarantinedCount = medicines.filter((m) => m.status === 'QUARANTINED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in-50 duration-200">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
              <Package className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Hospital Dispensary Formulary
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            Medicine Stock &amp; Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Live stock levels, threshold monitoring, and batch management for outpatient dispensing.
          </p>
        </div>

        <Button
          onClick={loadMedicines}
          variant="outline"
          size="sm"
          className="self-start sm:self-auto text-slate-600 hover:text-slate-900 text-xs font-semibold"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh Stock
        </Button>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-teal-50/80 border-teal-300 ring-2 ring-teal-600/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Items</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('IN_STOCK')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'IN_STOCK'
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-600/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-emerald-700 uppercase">Optimal</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{inStockCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('LOW_STOCK')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'LOW_STOCK'
              ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-600/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-rose-700 uppercase">Low Stock</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{lowStockCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('EXPIRING_SOON')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'EXPIRING_SOON'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-600/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-amber-700 uppercase">Near Expiry</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{expiringCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('OUT_OF_STOCK')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'OUT_OF_STOCK'
              ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-600/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase">Stockout</span>
          <p className="text-2xl font-black text-slate-800 mt-1">{outOfStockCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('QUARANTINED')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'QUARANTINED'
              ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-600/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-purple-700 uppercase">Quarantined</span>
          <p className="text-2xl font-black text-purple-700 mt-1">{quarantinedCount}</p>
        </div>
      </div>

      {/* 3. Search & Category Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search medicine, generic name, or batch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white"
          />
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-medium bg-white border border-slate-300 shadow-2xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-700 cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Medicine Inventory List / Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading medicine catalog...</div>
        ) : filteredMedicines.length === 0 ? (
          <Card className="border-slate-200 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Medications Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try relaxing your search terms or status filter.
            </p>
          </Card>
        ) : (
          filteredMedicines.map((med) => {
            const stockPct = Math.min(
              100,
              Math.round((med.availableQuantity / (med.minimumStockThreshold * 2.5)) * 100)
            );
            const isCritical = med.availableQuantity <= med.minimumStockThreshold;

            return (
              <Card
                key={med.id}
                className="border-slate-200 hover:border-teal-300 hover:shadow-xs transition-all overflow-hidden"
              >
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-slate-900">
                        {med.medicineName}
                      </span>
                      <StatusBadge status={med.status} />
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {med.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>Generic: <strong className="text-slate-700">{med.genericName}</strong></span>
                      <span>•</span>
                      <span className="font-mono">
                        Batch: <strong>{med.batchNumber}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        Exp: {new Date(med.expiryDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Stock level visual bar */}
                    <div className="pt-1 max-w-md space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">
                          Threshold: {med.minimumStockThreshold.toLocaleString()} {med.unit}
                        </span>
                        <span className={`font-bold ${isCritical ? 'text-rose-600' : 'text-slate-700'}`}>
                          Available: {med.availableQuantity.toLocaleString()} {med.unit}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            med.status === 'OUT_OF_STOCK'
                              ? 'bg-rose-500 w-full'
                              : isCritical
                              ? 'bg-rose-500'
                              : med.status === 'EXPIRING_SOON'
                              ? 'bg-amber-500'
                              : 'bg-teal-600'
                          }`}
                          style={{ width: `${Math.max(5, stockPct)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantity & Actions */}
                  <div className="shrink-0 flex sm:flex-col items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <div className="text-right">
                      <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {med.availableQuantity.toLocaleString()}
                      </p>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        {med.unit} in Dispensary
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        onClick={() => handleOpenAdjust(med, 'ADD')}
                        variant="outline"
                        size="sm"
                        className="text-teal-800 border-teal-200 hover:bg-teal-50 text-xs font-bold px-2.5 py-1 min-h-[36px]"
                        title="Add delivered warehouse stock"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Restock
                      </Button>

                      <Button
                        onClick={() => handleOpenAdjust(med, 'DEDUCT')}
                        variant="ghost"
                        size="sm"
                        className="text-slate-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-bold px-2.5 py-1 min-h-[36px]"
                        title="Deduct broken/expired stock"
                      >
                        <Minus className="h-3.5 w-3.5 mr-1" />
                        Adjust
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* 5. Adjustment Modal */}
      {adjustModalMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl sm:max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-xl ${
                    adjustType === 'ADD' ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {adjustType === 'ADD' ? <Plus className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {adjustType === 'ADD' ? 'Log Inward Restock' : 'Log Stock Adjustment / Disposal'}
                  </h3>
                  <p className="text-xs text-slate-500">{adjustModalMed.medicineName}</p>
                </div>
              </div>
              <button
                onClick={() => setAdjustModalMed(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-600">Current In Stock:</span>
                <span className="font-extrabold text-slate-900">
                  {adjustModalMed.availableQuantity.toLocaleString()} {adjustModalMed.unit}
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Quantity to {adjustType === 'ADD' ? 'Add' : 'Deduct'} ({adjustModalMed.unit}):
                </label>
                <input
                  type="number"
                  min={1}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Audit Reason / Note:</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Warehouse shipment delivery, broken blister pack"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white"
                />
              </div>

              <div className="p-3 bg-teal-50 text-teal-900 rounded-xl flex items-center justify-between">
                <span>New Projected Stock:</span>
                <span className="font-black text-sm text-teal-950">
                  {Math.max(
                    0,
                    adjustType === 'ADD'
                      ? adjustModalMed.availableQuantity + adjustAmount
                      : adjustModalMed.availableQuantity - adjustAmount
                  ).toLocaleString()}{' '}
                  {adjustModalMed.unit}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                onClick={() => setAdjustModalMed(null)}
                variant="outline"
                size="sm"
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAdjustment}
                disabled={submittingAdjustment}
                variant="primary"
                size="sm"
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold min-h-[38px] px-4"
              >
                {submittingAdjustment ? 'Updating Stock...' : 'Confirm & Save Audit Record'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

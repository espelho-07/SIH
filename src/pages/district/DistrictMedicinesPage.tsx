import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLocationContext } from '@/contexts/LocationContext';
import { INITIAL_MEDICINES, INITIAL_FACILITIES } from '@/mock/mockData';
import {
  Pill,
  Search,
  AlertTriangle,
  CheckCircle2,
  Package,
  Plus,
  TrendingDown,
} from 'lucide-react';

export const DistrictMedicinesPage: React.FC = () => {
  const { selectedDistrict } = useLocationContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showIndentModal, setShowIndentModal] = useState(false);
  const [indentSuccess, setIndentSuccess] = useState<string | null>(null);

  // Form State
  const [selectedDrug, setSelectedDrug] = useState(INITIAL_MEDICINES[0]?.medicineName || '');
  const [targetFacility, setTargetFacility] = useState(INITIAL_FACILITIES[0]?.id || '');
  const [indentQty, setIndentQty] = useState('500');

  // Categories list
  const categories = ['ALL', 'Antibiotic', 'Cardiovascular', 'Antidiabetic', 'Analgesic', 'Emergency'];

  // Filter medicines
  const filteredMedicines = INITIAL_MEDICINES.filter((med) => {
    const matchesSearch =
      med.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || med.category.toLowerCase().includes(categoryFilter.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'LOW') matchesStatus = med.status === 'LOW_STOCK';
    if (statusFilter === 'CRITICAL') matchesStatus = med.status === 'OUT_OF_STOCK';
    if (statusFilter === 'ADEQUATE') matchesStatus = med.status === 'IN_STOCK';

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // KPIs
  const totalItems = INITIAL_MEDICINES.length;
  const criticalStockouts = INITIAL_MEDICINES.filter((m) => m.status === 'OUT_OF_STOCK').length;
  const lowStockCount = INITIAL_MEDICINES.filter((m) => m.status === 'LOW_STOCK').length;
  const inStockCount = INITIAL_MEDICINES.filter((m) => m.status === 'IN_STOCK').length;

  const handleCreateIndent = (e: React.FormEvent) => {
    e.preventDefault();
    setIndentSuccess(`Emergency indent for ${indentQty} units of ${selectedDrug} submitted to Gujarat Medical Services Corporation (GMSCL).`);
    setShowIndentModal(false);

    setTimeout(() => {
      setIndentSuccess(null);
    }, 6000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="District Medicine Inventory"
        subtitle={`Track essential drug inventory, low stock thresholds, and warehouse indents across ${selectedDistrict}.`}
        breadcrumbs={[
          { label: 'District Admin', to: '/district' },
          { label: 'Medicines' },
        ]}
        actions={
          <Button
            onClick={() => setShowIndentModal(true)}
            size="sm"
            className="gap-2 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white"
          >
            <Plus className="h-4 w-4" />
            <span>Raise Emergency Indent</span>
          </Button>
        }
      />

      {/* Success Notification */}
      {indentSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900">
          <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
          <p className="font-semibold">{indentSuccess}</p>
        </div>
      )}

      {/* 3 Decision-Driving KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Monitored EML Drugs</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Pill className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalItems} Items</p>
          <span className="text-[11px] text-teal-700 font-medium">{inStockCount} drugs in adequate supply</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Low Stock Buffer</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{lowStockCount} Items</p>
          <span className="text-[11px] text-amber-700 font-medium">Reorder threshold reached</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Critical Stockouts</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{criticalStockouts} Items</p>
          <span className="text-[11px] text-rose-700 font-medium">Immediate warehouse indent needed</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by drug name, batch, or therapeutic class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-hidden"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="ADEQUATE">Adequate Stock Only</option>
              <option value="LOW">Low Stock Warning</option>
              <option value="CRITICAL">Stockouts Only</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                categoryFilter === cat
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat === 'ALL' ? 'All Classes' : cat}
            </button>
          ))}
        </div>
      </Card>

      {/* Medicines Inventory Table */}
      <Card className="p-5 bg-white border-slate-200 shadow-xs space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                <th className="py-2.5 px-3">Medicine & Dosage</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Available Stock</th>
                <th className="py-2.5 px-3">Minimum Safety Limit</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.map((med) => {
                const isCritical = med.status === 'OUT_OF_STOCK';
                const isLow = med.status === 'LOW_STOCK';

                return (
                  <tr key={med.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{med.medicineName}</span>
                      <span className="text-[11px] text-slate-400">Unit: {med.unit}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {med.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-bold ${isCritical ? 'text-rose-600 font-black' : isLow ? 'text-amber-600 font-bold' : 'text-slate-900'}`}>
                        {med.availableQuantity} {med.unit}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{med.minimumStockThreshold} {med.unit}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800'
                            : isLow
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isCritical ? 'Stockout' : isLow ? 'Low Stock' : 'Adequate'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDrug(med.medicineName);
                          setShowIndentModal(true);
                        }}
                        className="text-xs font-semibold"
                      >
                        Reorder
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Emergency Indent Modal */}
      {showIndentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl sm:max-w-3xl p-6 sm:p-8 bg-white border-slate-200 shadow-xl space-y-4 rounded-3xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-base">
                <Package className="h-5 w-5" />
                <h3>Raise Emergency Drug Indent</h3>
              </div>
              <button
                onClick={() => setShowIndentModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIndent} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Drug / Formulation</label>
                <select
                  value={selectedDrug}
                  onChange={(e) => setSelectedDrug(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-hidden focus:border-teal-700"
                >
                  {INITIAL_MEDICINES.map((m) => (
                    <option key={m.id} value={m.medicineName}>
                      {m.medicineName} ({m.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Delivery Destination</label>
                <select
                  value={targetFacility}
                  onChange={(e) => setTargetFacility(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-hidden focus:border-teal-700"
                >
                  <option value="central_warehouse">Gandhinagar District Drug Warehouse</option>
                  {INITIAL_FACILITIES.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Indent Quantity</label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={indentQty}
                    onChange={(e) => setIndentQty(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-hidden focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Procurement Track</label>
                  <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-hidden focus:border-teal-700">
                    <option>GMSCL Fast-Track (48h)</option>
                    <option>Local Emergency Purchase</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowIndentModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs bg-teal-700 hover:bg-teal-800 text-white font-semibold"
                >
                  Submit Indent
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

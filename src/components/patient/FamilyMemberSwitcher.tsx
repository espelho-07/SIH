import React, { useState, useRef, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { AddFamilyMemberModal } from './AddFamilyMemberModal';
import { Link } from 'react-router-dom';
import {
  Users,
  ChevronDown,
  Check,
  UserPlus,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export const FamilyMemberSwitcher: React.FC<{ variant?: 'banner' | 'compact' }> = ({
  variant = 'banner',
}) => {
  const { members, activeMember, setActiveMemberId } = useFamily();
  const [isOpen, setIsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="relative inline-block text-left" ref={dropdownRef}>
        {variant === 'banner' ? (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 rounded-xl bg-teal-800/80 hover:bg-teal-700/90 border border-teal-500/50 px-3 py-1.5 text-xs text-white shadow-xs transition-all cursor-pointer group"
            title="Switch family member profile"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-[10px] uppercase">
              {activeMember.name.slice(0, 2)}
            </div>
            <div className="text-left">
              <span className="text-[10px] text-teal-200 block leading-none">
                Active Patient Profile
              </span>
              <span className="font-bold text-xs text-white flex items-center gap-1.5 mt-0.5">
                {activeMember.name} ({activeMember.relation === 'SELF' ? 'Self' : activeMember.relationLabel.split(' ')[0]})
              </span>
            </div>
            <ChevronDown
              className={`h-3.5 w-3.5 text-teal-300 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <Users className="h-3.5 w-3.5 text-teal-700" />
            <span className="truncate max-w-[110px]">
              {activeMember.name}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>
        )}

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 z-50 animate-in fade-in-50 duration-100 space-y-1">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Household Members ({members.length})
              </span>
              <Link
                to="/patient/profile"
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
              >
                Manage
              </Link>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 py-1">
              {members.map((m) => {
                const isActive = m.id === activeMember.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setActiveMemberId(m.id);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all ${
                      isActive
                        ? 'bg-teal-50 text-teal-950 font-bold border border-teal-200/60 shadow-2xs'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                          isActive
                            ? 'bg-teal-700 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs truncate leading-tight">
                          {m.name}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {m.relationLabel} • {m.age}y
                        </p>
                      </div>
                    </div>

                    {isActive && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-700 text-white">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsAddModalOpen(true);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 px-2 py-1.5 rounded-lg hover:bg-teal-50 w-full justify-center transition-colors"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Add Family Member</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <AddFamilyMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
};

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import {
  INITIAL_SYSTEM_HEALTH,
  INITIAL_FACILITIES,
  INITIAL_PERMISSION_MATRIX,
  INITIAL_AI_MODELS,
  INITIAL_AUDIT_LOGS,
  DEMO_USERS,
} from '@/mock/mockData';
import { Facility } from '@/types/facility';
import { User } from '@/types/auth';
import { AuditLog } from '@/types/admin';
import { adminApi } from '@/api/adminApi';
import {
  LayoutDashboard,
  Server,
  Building2,
  Users,
  KeyRound,
  BrainCircuit,
  ShieldCheck,
  Settings,
} from 'lucide-react';

// Subviews
import { OverviewTab } from './views/OverviewTab';
import { SystemHealthTab } from './views/SystemHealthTab';
import { FacilitiesTab } from './views/FacilitiesTab';
import { UsersTab } from './views/UsersTab';
import { RolesTab } from './views/RolesTab';
import { AiModelsTab } from './views/AiModelsTab';
import { AuditLogsTab } from './views/AuditLogsTab';
import { SettingsTab } from './views/SettingsTab';

type TabKey = 'OVERVIEW' | 'HEALTH' | 'FACILITIES' | 'USERS' | 'ROLES' | 'MODELS' | 'AUDIT' | 'SETTINGS';

const TAB_URL_MAP: Record<TabKey, string> = {
  OVERVIEW: '',
  HEALTH: 'system-health',
  FACILITIES: 'facilities',
  USERS: 'users',
  ROLES: 'roles',
  MODELS: 'ai-models',
  AUDIT: 'audit',
  SETTINGS: 'settings',
};

const URL_TAB_MAP: Record<string, TabKey> = {
  '': 'OVERVIEW',
  overview: 'OVERVIEW',
  'system-health': 'HEALTH',
  health: 'HEALTH',
  facilities: 'FACILITIES',
  users: 'USERS',
  roles: 'ROLES',
  permissions: 'ROLES',
  'ai-models': 'MODELS',
  models: 'MODELS',
  audit: 'AUDIT',
  settings: 'SETTINGS',
};

export const SuperAdminDashboard: React.FC = () => {
  const { tab: routeTab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();

  // Resolve active tab from URL param
  const activeTab: TabKey = (routeTab && URL_TAB_MAP[routeTab]) || 'OVERVIEW';

  // Live state backed by mock initial state
  const [health, setHealth] = useState(INITIAL_SYSTEM_HEALTH);
  const [facilities, setFacilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [usersList, setUsersList] = useState<User[]>(Object.values(DEMO_USERS));
  const [permissions] = useState(INITIAL_PERMISSION_MATRIX);
  const [models, setModels] = useState(INITIAL_AI_MODELS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeploying, setIsDeploying] = useState<string | null>(null);

  // Sync tab change with URL
  const handleTabChange = (newTab: TabKey) => {
    const targetSubpath = TAB_URL_MAP[newTab];
    if (!targetSubpath) {
      navigate('/super-admin');
    } else {
      navigate(`/super-admin/${targetSubpath}`);
    }
  };

  // Run synthetic health check
  const handleRunHealthCheck = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    setHealth((prev) => ({
      ...prev,
      services: prev.services.map((s) => ({
        ...s,
        latencyMs: Math.floor(Math.random() * 20) + 12,
      })),
    }));
    setIsRefreshing(false);
  };

  // Add facility
  const handleAddFacility = (newFac: Partial<Facility>) => {
    const fullFac: Facility = {
      id: `fac_${Date.now()}`,
      name: newFac.name || 'Community Health Clinic',
      type: newFac.type || 'CHC',
      district: newFac.district || 'Gandhinagar',
      state: 'Gujarat',
      address: 'Sector 24, Gandhinagar',
      pincode: '382024',
      contactNumber: '+91 79 2322 0000',
      emergencyNumber: '108',
      totalBeds: newFac.totalBeds || 20,
      availableBeds: newFac.availableBeds || 15,
      icuBedsTotal: 4,
      icuBedsAvailable: 2,
      oxygenAvailable: true,
      bloodBankAvailable: false,
      ambulanceAvailable: true,
      isOpen: true,
      isVerified: true,
      emergencyAvailable: newFac.emergencyAvailable ?? true,
      currentWaitTimeMinutes: 15,
      coordinates: { lat: 23.2156, lng: 72.6369 },
      departments: [
        { id: 'd_gen', name: 'General Medicine', code: 'GEN', activeDoctors: 3, currentWaitMinutes: 15, opdOpen: true },
        { id: 'd_peds', name: 'Pediatrics', code: 'PED', activeDoctors: 2, currentWaitMinutes: 10, opdOpen: true },
      ],
      specialties: ['General Medicine', 'Maternal Health'],
      equipment: [],
      lastUpdated: new Date().toISOString(),
    };

    setFacilities((prev) => [fullFac, ...prev]);

    // Record audit log
    const newLog: AuditLog = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorId: 'usr_super_01',
      actorName: 'Vikram Mehta',
      actorRole: 'SUPER_ADMIN',
      action: 'FACILITY_CREATE',
      resourceType: 'FACILITY',
      resourceId: fullFac.id,
      details: `Registered new facility: ${fullFac.name}`,
      ipAddress: '10.91.242.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'SUCCESS',
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Add user
  const handleAddUser = (newUser: Partial<User>) => {
    const fullUser: User = {
      id: `usr_${Date.now()}`,
      name: newUser.name || 'Healthcare Worker',
      phone: newUser.phone || '9876543210',
      role: newUser.role || 'DOCTOR',
      staffSubType: newUser.staffSubType,
      facilityName: newUser.facilityName || 'Gandhinagar Civil Hospital',
    };

    setUsersList((prev) => [fullUser, ...prev]);

    const newLog: AuditLog = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorId: 'usr_super_01',
      actorName: 'Vikram Mehta',
      actorRole: 'SUPER_ADMIN',
      action: 'USER_CREATE',
      resourceType: 'USER',
      resourceId: fullUser.id,
      details: `Created user: ${fullUser.name} with role ${fullUser.role}`,
      ipAddress: '10.91.242.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'SUCCESS',
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // AI model actions
  const handleDeployModel = async (id: string) => {
    setIsDeploying(id);
    await adminApi.deployModel(id);
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'ACTIVE', deployedAt: new Date().toISOString().slice(0, 10) } : m))
    );
    const newLog: AuditLog = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorId: 'usr_super_01',
      actorName: 'Vikram Mehta',
      actorRole: 'SUPER_ADMIN',
      action: 'MODEL_DEPLOY',
      resourceType: 'AI_MODEL',
      resourceId: id,
      details: `Deployed model ${id} to production grid`,
      ipAddress: '10.91.242.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'SUCCESS',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    setIsDeploying(null);
  };

  const handleRollbackModel = async (id: string) => {
    setIsDeploying(id);
    await adminApi.rollbackModel(id);
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'STAGING' } : m))
    );
    const newLog: AuditLog = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorId: 'usr_super_01',
      actorName: 'Vikram Mehta',
      actorRole: 'SUPER_ADMIN',
      action: 'MODEL_ROLLBACK',
      resourceType: 'AI_MODEL',
      resourceId: id,
      details: `Rolled back model ${id} to staging`,
      ipAddress: '10.91.242.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'SUCCESS',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    setIsDeploying(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400" aria-label="Breadcrumbs">
        <span className="text-teal-700 font-semibold">HealthConnect</span>
        <span>/</span>
        <span className="text-slate-600 font-semibold">Operations Center</span>
        {activeTab !== 'OVERVIEW' && (
          <>
            <span>/</span>
            <span className="text-slate-900 font-bold capitalize">{activeTab.toLowerCase()}</span>
          </>
        )}
      </nav>

      {/* Top Banner (HealthConnect Patient Design Language: Calm, Clinical, Reassuring) */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1B365D] via-[#20548A] to-[#2B6CB0] text-white p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#4792CE]/40">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-0.5 text-xs font-semibold text-[#E1EFF8] border border-white/25">
            <Server className="h-3.5 w-3.5" />
            <span>Operations Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">System Administration</h1>
          <p className="text-xs text-[#E1EFF8]/90 max-w-2xl">
            Monitor system services, manage user access, and configure platform governance across the healthcare grid.
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 text-center shrink-0">
          <span className="text-[10px] uppercase font-bold text-[#9CCBEA] block tracking-wider">Platform Status</span>
          <span className="text-[#E1EFF8] font-bold text-sm flex items-center justify-center gap-1.5 mt-1">
            <span className="h-2 w-2 rounded-full bg-[#6CAEDE] animate-pulse" />
            All systems operational
          </span>
        </div>
      </div>

      {/* Navigation Tabs (8 Logical Modules) */}
      <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as TabKey)}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 max-w-full">
          <TabsTrigger value="OVERVIEW" icon={<LayoutDashboard className="h-4 w-4" />}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="HEALTH" icon={<Server className="h-4 w-4" />}>
            System Health
          </TabsTrigger>
          <TabsTrigger value="FACILITIES" icon={<Building2 className="h-4 w-4" />}>
            Facilities
          </TabsTrigger>
          <TabsTrigger value="USERS" icon={<Users className="h-4 w-4" />}>
            Users
          </TabsTrigger>
          <TabsTrigger value="ROLES" icon={<KeyRound className="h-4 w-4" />}>
            Permissions
          </TabsTrigger>
          <TabsTrigger value="MODELS" icon={<BrainCircuit className="h-4 w-4" />}>
            AI Models
          </TabsTrigger>
          <TabsTrigger value="AUDIT" icon={<ShieldCheck className="h-4 w-4" />}>
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="SETTINGS" icon={<Settings className="h-4 w-4" />}>
            Settings
          </TabsTrigger>
        </TabsList>

        {/* 1. OVERVIEW */}
        <TabsContent value="OVERVIEW" className="pt-2">
          <OverviewTab
            health={health}
            recentLogs={auditLogs}
            facilityCount={facilities.length}
            userCount={usersList.length}
            modelCount={models.length}
            onNavigateTab={(k) => handleTabChange(k as TabKey)}
            onRunHealthCheck={handleRunHealthCheck}
            isRefreshing={isRefreshing}
          />
        </TabsContent>

        {/* 2. SYSTEM HEALTH */}
        <TabsContent value="HEALTH" className="pt-2">
          <SystemHealthTab
            health={health}
            onRefresh={handleRunHealthCheck}
            isRefreshing={isRefreshing}
          />
        </TabsContent>

        {/* 3. FACILITIES */}
        <TabsContent value="FACILITIES" className="pt-2">
          <FacilitiesTab
            facilities={facilities}
            onAddFacility={handleAddFacility}
          />
        </TabsContent>

        {/* 4. USERS */}
        <TabsContent value="USERS" className="pt-2">
          <UsersTab
            users={usersList}
            onAddUser={handleAddUser}
          />
        </TabsContent>

        {/* 5. PERMISSIONS */}
        <TabsContent value="ROLES" className="pt-2">
          <RolesTab permissions={permissions} />
        </TabsContent>

        {/* 6. AI MODELS */}
        <TabsContent value="MODELS" className="pt-2">
          <AiModelsTab
            models={models}
            onDeployModel={handleDeployModel}
            onRollbackModel={handleRollbackModel}
            isDeploying={isDeploying}
          />
        </TabsContent>

        {/* 7. AUDIT LOGS */}
        <TabsContent value="AUDIT" className="pt-2">
          <AuditLogsTab logs={auditLogs} />
        </TabsContent>

        {/* 8. SETTINGS */}
        <TabsContent value="SETTINGS" className="pt-2">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

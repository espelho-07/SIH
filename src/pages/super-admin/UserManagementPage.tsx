import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RoleBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/Dialog';
import { DEMO_USERS } from '@/mock/mockData';
import { User, UserRole, StaffSubType } from '@/types/auth';
import {
  Users,
  Search,
  Plus,
  Phone,
  Building2,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Eye,
  Edit2,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(Object.values(DEMO_USERS));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deactivateUser, setDeactivateUser] = useState<User | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('DOCTOR');
  const [staffSubType, setStaffSubType] = useState<StaffSubType>('REGISTRATION_CLERK');
  const [facilityName, setFacilityName] = useState('Gandhinagar Civil Hospital');

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.facilityName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRole]);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      phone,
      role,
      staffSubType: role === 'FACILITY_STAFF' ? staffSubType : undefined,
      facilityName,
    };

    setUsers((prev) => [newUser, ...prev]);
    setShowAddModal(false);
    setName('');
    setPhone('');
  };

  const handleConfirmDeactivate = () => {
    if (!deactivateUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== deactivateUser.id));
    setDeactivateUser(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle="Manage verified healthcare workers, clinical roles, and facility assignments."
        breadcrumbs={[
          { label: 'Technical Center', to: '/super-admin' },
          { label: 'Users' },
        ]}
        actions={
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            size="sm"
            className="gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        }
      />

      {/* Summary Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Accounts</span>
          <p className="text-3xl font-black text-slate-900 mt-1">{users.length}</p>
          <span className="text-xs text-slate-500">Government health staff</span>
        </Card>

        <Card className="p-4 border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctors & Specialists</span>
          <p className="text-3xl font-black text-teal-700 mt-1">
            {users.filter((u) => u.role === 'DOCTOR').length}
          </p>
          <span className="text-xs text-slate-500">Clinical decision makers</span>
        </Card>

        <Card className="p-4 border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Frontline ASHA</span>
          <p className="text-3xl font-black text-emerald-700 mt-1">
            {users.filter((u) => u.role === 'ASHA').length}
          </p>
          <span className="text-xs text-slate-500">Field & community workers</span>
        </Card>

        <Card className="p-4 border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Facility Staff</span>
          <p className="text-3xl font-black text-slate-900 mt-1">
            {users.filter((u) => u.role === 'FACILITY_STAFF').length}
          </p>
          <span className="text-xs text-slate-500">Registration, lab, pharmacy</span>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search by staff name, phone, or hospital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-50 text-xs"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="flex min-h-[44px] rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            <option value="ALL">All Roles</option>
            <option value="PATIENT">Patient</option>
            <option value="ASHA">ASHA Worker</option>
            <option value="DOCTOR">Doctor</option>
            <option value="FACILITY_STAFF">Facility Staff</option>
            <option value="DISTRICT_ADMIN">District Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium self-end sm:self-center">
          Showing {filteredUsers.length} of {users.length} users
        </span>
      </div>

      {/* Users Table / List */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="No healthcare staff accounts matched your search or role filter."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedRole('ALL');
          }}
        />
      ) : (
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500">
                <tr>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Facility / Jurisdiction</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {u.phone}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <RoleBadge role={u.role} subType={u.staffSubType} />
                    </td>
                    <td className="p-3.5 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[220px] font-medium text-slate-800">
                          {u.facilityName || 'Gandhinagar District Grid'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Active
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          onClick={() => setSelectedUser(u)}
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs text-teal-700 hover:text-teal-800 hover:bg-teal-50 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                        <Button
                          onClick={() => setDeactivateUser(u)}
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                        >
                          Deactivate
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)} maxWidth="md">
          <DialogHeader>
            <DialogTitle>{selectedUser.name}</DialogTitle>
            <DialogDescription>
              Healthcare staff account details and permission profile
            </DialogDescription>
          </DialogHeader>

          <DialogContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Role</span>
                <div className="mt-1">
                  <RoleBadge role={selectedUser.role} subType={selectedUser.staffSubType} />
                </div>
              </div>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Account Verified
              </span>
            </div>

            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Account ID:</span>
                <span className="font-mono font-bold text-slate-900">{selectedUser.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone Contact:</span>
                <span className="font-semibold text-slate-900">{selectedUser.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Facility:</span>
                <span className="font-semibold text-slate-900">{selectedUser.facilityName || 'Gandhinagar District Grid'}</span>
              </div>
              {selectedUser.abhaId && (
                <div className="flex justify-between">
                  <span className="text-slate-500">ABHA Health ID:</span>
                  <span className="font-mono font-bold text-teal-800">{selectedUser.abhaId}</span>
                </div>
              )}
            </div>
          </DialogContent>

          <DialogFooter>
            <Button onClick={() => setSelectedUser(null)} variant="secondary" size="sm" className="cursor-pointer">
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Deactivate User Confirmation Dialog (Destructive Action Rule) */}
      {deactivateUser && (
        <Dialog open={!!deactivateUser} onOpenChange={() => setDeactivateUser(null)} maxWidth="sm">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Deactivate User?</DialogTitle>
                <DialogDescription>
                  Revoke system login access for {deactivateUser.name}.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogContent className="text-xs text-slate-600 space-y-2">
            <p>
              Deactivating this account will immediately revoke all active portal sessions and prevent logging in.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-50 border text-[11px] font-mono">
              Role: {deactivateUser.role} • Facility: {deactivateUser.facilityName}
            </div>
          </DialogContent>

          <DialogFooter>
            <Button onClick={() => setDeactivateUser(null)} variant="secondary" size="sm" className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleConfirmDeactivate} variant="destructive" size="sm" className="cursor-pointer">
              Confirm Deactivation
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Add User Dialog */}
      {showAddModal && (
        <Dialog open={showAddModal} onOpenChange={setShowAddModal} maxWidth="md">
          <DialogHeader>
            <DialogTitle>Add Healthcare User</DialogTitle>
            <DialogDescription>
              Create a new user profile with verified role permissions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser}>
            <DialogContent className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Full Name</label>
                <Input
                  required
                  placeholder="e.g. Dr. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Mobile Phone Number</label>
                <Input
                  required
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="flex min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  >
                    <option value="DOCTOR">Doctor</option>
                    <option value="ASHA">ASHA Worker</option>
                    <option value="FACILITY_STAFF">Facility Staff</option>
                    <option value="DISTRICT_ADMIN">District Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>

                {role === 'FACILITY_STAFF' && (
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Staff Subtype</label>
                    <select
                      value={staffSubType}
                      onChange={(e) => setStaffSubType(e.target.value as StaffSubType)}
                      className="flex min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                    >
                      <option value="REGISTRATION_CLERK">Registration Clerk</option>
                      <option value="PHARMACIST">Pharmacist</option>
                      <option value="LAB_TECHNICIAN">Lab Technician</option>
                      <option value="FACILITY_OPERATIONS">Operations Manager</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Assigned Facility</label>
                <Input
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  placeholder="Facility name"
                />
              </div>
            </DialogContent>

            <DialogFooter>
              <Button onClick={() => setShowAddModal(false)} type="button" variant="secondary" size="sm" className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="cursor-pointer">
                Create User
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}
    </div>
  );
};

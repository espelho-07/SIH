import { User } from '../../models/User';
import { AuditLog } from '../../models/AuditLog';

export class UserService {
  async getAllUsers(query: any) {
    const { role, search, page = 1, limit = 20 } = query;
    const filter: any = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const users = await User.find(filter).select('-password').skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await User.countDocuments(filter);
    return { users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
  }

  async getUserById(id: string) {
    return User.findById(id).select('-password');
  }

  async createUser(data: any) {
    const user = new User(data);
    await user.save();
    return User.findById(user._id).select('-password');
  }

  async updateUser(id: string, data: any) {
    return User.findByIdAndUpdate(id, data, { new: true }).select('-password');
  }

  async updateStatus(id: string, isActive: boolean) {
    return User.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');
  }

  async deleteUser(id: string) {
    return User.findByIdAndDelete(id);
  }

  async getRoles() {
    return [
      'PATIENT',
      'ASHA',
      'DOCTOR',
      'FACILITY_STAFF',
      'DISTRICT_ADMIN',
      'SUPER_ADMIN',
      'USER',
      'ADMIN',
    ];
  }

  async getUserActivity(userId: string) {
    return AuditLog.find({ actorId: userId }).sort({ timestamp: -1 }).limit(50);
  }
}

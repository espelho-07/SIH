import { Department } from '../../models/Department';

export class DepartmentService {
  async getAllDepartments() {
    let deps = await Department.find({ isActive: true }).sort({ name: 1 });
    if (deps.length === 0) {
      // Seed standard medical departments if empty
      const defaultDeps = [
        { name: 'General Medicine', code: 'GEN_MED', description: 'Internal & General Health' },
        { name: 'Cardiology', code: 'CARD', description: 'Heart & Cardiovascular Diseases' },
        { name: 'Gynecology & Obstetrics', code: 'GYN_OB', description: 'Maternal & Women Health' },
        { name: 'Pediatrics', code: 'PED', description: 'Child & Newborn Care' },
        { name: 'Orthopedics', code: 'ORTHO', description: 'Bones, Joints & Musculoskeletal' },
        { name: 'Emergency & Trauma', code: 'EMG_TRM', description: '24/7 Emergency Care' },
      ];
      await Department.insertMany(defaultDeps);
      deps = await Department.find({ isActive: true }).sort({ name: 1 });
    }
    return deps;
  }

  async getDepartmentById(id: string) {
    return Department.findById(id);
  }

  async createDepartment(data: any) {
    const dep = new Department(data);
    await dep.save();
    return dep;
  }

  async updateDepartment(id: string, data: any) {
    return Department.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteDepartment(id: string) {
    return Department.findByIdAndDelete(id);
  }

  async getSpecialties() {
    return [
      { id: '1', name: 'General Physician', category: 'Medicine' },
      { id: '2', name: 'Cardiologist', category: 'Cardiology' },
      { id: '3', name: 'Gynecologist', category: 'Obstetrics' },
      { id: '4', name: 'Pediatrician', category: 'Pediatrics' },
      { id: '5', name: 'Orthopedic Surgeon', category: 'Orthopedics' },
      { id: '6', name: 'Dermatologist', category: 'Dermatology' },
    ];
  }
}

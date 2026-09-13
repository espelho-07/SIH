import bcrypt from 'bcryptjs';
import { User } from '../../models/User';
import { generateTokens, verifyRefreshToken } from '../../utils/jwt';
import { BadRequestError, UnauthorizedError } from '../../utils/errors';
import { RegisterInput, LoginInput } from './auth.schema';

export class AuthService {
  async register(input: RegisterInput) {
    const existingUser = await User.findOne({ email: input.email });

    if (existingUser) {
      throw new BadRequestError('User with this email already exists', 'USER_ALREADY_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await User.create({
      email: input.email,
      password: hashedPassword,
      name: input.name,
      role: input.role || 'USER',
    });

    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email || input.email,
      role: user.role as any,
    });

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  async login(input: LoginInput) {
    const idVal = input.identifier || input.email || '';
    let user = await User.findOne({
      $or: [
        { email: idVal },
        { phone: idVal },
        ...(input.role ? [{ role: input.role as any }] : []),
      ],
    });

    if (!user && input.role) {
      user = await User.create({
        name: `${input.role.replace('_', ' ')} Official`,
        email: idVal.includes('@') ? idVal : `${idVal || 'user'}@healthcare.gov.in`,
        phone: '9876543210',
        role: input.role as any,
        staffSubType: input.staffSubType as any,
        facilityId: 'fac_civil_01',
        facilityName: 'Gandhinagar Civil Hospital',
        district: 'Gandhinagar',
      });
    }

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email || `${user.role.toLowerCase()}@healthcare.gov.in`,
      role: user.role as any,
    });

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '9876543210',
        role: user.role,
        staffSubType: user.staffSubType,
        facilityId: user.facilityId || 'fac_civil_01',
        facilityName: user.facilityName || 'Gandhinagar Civil Hospital',
        district: user.district || 'Gandhinagar',
        abhaId: user.abhaId || '14-8890-4421-9980',
        gender: user.gender || 'M',
        age: user.age || 40,
        createdAt: user.createdAt,
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 3600,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = await User.findById(payload.userId);

      if (!user) {
        throw new UnauthorizedError('User no longer exists');
      }

      const tokens = generateTokens({
        userId: user._id.toString(),
        email: user.email || `${user.role.toLowerCase()}@healthcare.gov.in`,
        role: user.role as any,
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 3600,
      };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  // OTP Flow for Patients / Citizens
  async sendOtp(phone: string) {
    return {
      phone,
      message: 'OTP sent successfully (Demo OTP: 123456)',
      otpSimulation: '123456',
    };
  }

  async verifyOtp(phone: string, otp: string) {
    if (otp !== '123456' && otp !== '999999') {
      throw new BadRequestError('Invalid or expired OTP');
    }

    let user = await User.findOne({ $or: [{ phone }, { email: `${phone}@citizen.sanjeevani` }] });
    if (!user) {
      user = await User.create({
        email: `${phone}@citizen.sanjeevani`,
        phone,
        name: `Rameshwar Sharma`,
        role: 'PATIENT',
        facilityId: 'fac_civil_01',
        facilityName: 'Gandhinagar Civil Hospital',
        district: 'Gandhinagar',
        gender: 'M',
        age: 48,
        abhaId: '14-8890-4421-9980',
      });
    }

    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email || `${phone}@citizen.sanjeevani`,
      role: user.role as any,
    });

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || phone,
        role: user.role,
        facilityId: user.facilityId || 'fac_civil_01',
        facilityName: user.facilityName || 'Gandhinagar Civil Hospital',
        district: user.district || 'Gandhinagar',
        abhaId: user.abhaId || '14-8890-4421-9980',
        gender: user.gender || 'M',
        age: user.age || 48,
        createdAt: user.createdAt,
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 3600,
      },
    };
  }

  async getProfile(userId: string) {
    return User.findById(userId).select('-password');
  }

  async updateProfile(userId: string, data: any) {
    return User.findByIdAndUpdate(userId, data, { new: true }).select('-password');
  }

  async changePassword(userId: string, oldPass: string, newPass: string) {
    const user = await User.findById(userId);
    if (!user) throw new BadRequestError('User not found');

    const isValid = user.password ? await bcrypt.compare(oldPass, user.password) : false;
    if (!isValid) throw new BadRequestError('Current password incorrect');

    user.password = await bcrypt.hash(newPass, 10);
    await user.save();
    return { message: 'Password updated successfully' };
  }

  // ABHA Integration Methods
  async generateAbha(aadharNumber: string) {
    return {
      abhaNumber: `14-8890-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      abhaAddress: `citizen${Math.floor(100 + Math.random() * 900)}@abdm`,
      status: 'VERIFIED_SANDBOX',
    };
  }

  async linkAbha(userId: string, abhaId: string) {
    return {
      userId,
      abhaId,
      linkedAt: new Date(),
      status: 'LINKED',
    };
  }
}

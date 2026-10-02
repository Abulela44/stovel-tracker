import type { GroupSecuritySettings, Stokvel, StokvelWorkspace } from './types';

// No sample data: new accounts start completely empty.
export const createEmptyStokvel = (name = 'My Stokvel'): Stokvel => ({
  id: 'stokvel-1', name, code: '', type: 'Savings', totalBalance: 0, monthlyContribution: 0, targetAmount: 0,
  cycleDay: 25, memberCount: 0, currency: 'ZAR', bankName: '', accountNumber: '', photoUrl: '',
  description: 'Add your members and record contributions to get started.', yieldRate: 0, createdDate: new Date().toISOString().slice(0, 10),
});

export const EMPTY_SECURITY_SETTINGS: GroupSecuritySettings = {
  groupName: 'My Stokvel', adminName: '', adminIdNumber: '', adminPhone: '', isIdVerified: false,
  multiSignThreshold: 1000, requiredApprovals: 2, constitutionAgreed: false, bankAccountVerified: false,
};

export const createEmptyWorkspace = (): StokvelWorkspace => ({
  stokvels: [createEmptyStokvel()], members: [], contributions: [], payouts: [], loans: [], proposals: [],
  transactions: [], notifications: [], securitySettings: EMPTY_SECURITY_SETTINGS,
});

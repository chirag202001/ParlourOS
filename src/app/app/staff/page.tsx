import { getStaffMembers, getAttendance, getBranches, getRoles } from './actions';
import { StaffClient } from './staff-client';

export default async function StaffPage() {
  const [staffMembers, attendance, branches, roles] = await Promise.all([
    getStaffMembers(),
    getAttendance(),
    getBranches(),
    getRoles(),
  ]);

  return (
    <StaffClient
      staffMembers={staffMembers}
      attendance={attendance}
      branches={branches}
      roles={roles}
    />
  );
}

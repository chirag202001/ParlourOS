import { getAllAppointments, getBranches, getStaff } from './actions';
import { AppointmentsList } from './appointments-list';

export default async function AppointmentsPage() {
  const [appointments, branches, staff] = await Promise.all([
    getAllAppointments(),
    getBranches(),
    getStaff(),
  ]);

  return (
    <AppointmentsList
      appointments={appointments}
      branches={branches}
      staff={staff}
    />
  );
}

import { getAppointments, ensureAiresBlockedDaysTable, getAiresBlockedDays } from "@/actions/appointments";
import AiresCalendarView from "@/components/AiresCalendarView";

export const revalidate = 0;

export default async function AiresCalendarPage() {
  await ensureAiresBlockedDaysTable();
  const { data: appointments } = await getAppointments();
  const { data: blockedDays } = await getAiresBlockedDays();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
       <AiresCalendarView appointments={appointments || []} blockedDays={blockedDays || []} />
    </div>
  );
}

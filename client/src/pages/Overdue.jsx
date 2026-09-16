import WorkRecordsPage from "../components/maintenance/WorkRecordsPage.jsx";

export default function Overdue() {
  return (
    <WorkRecordsPage
      title="Overdue"
      subtitle="Equipment with missed maintenance dates and the technicians assigned"
      status="overdue"
      dateLabel="Due"
      emptyMessage="No overdue maintenance right now."
    />
  );
}

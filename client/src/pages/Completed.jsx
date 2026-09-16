import WorkRecordsPage from "../components/maintenance/WorkRecordsPage.jsx";

export default function Completed() {
  return (
    <WorkRecordsPage
      title="Completed"
      subtitle="Finished maintenance jobs and the technicians who logged them"
      status="completed"
      dateLabel="Completed"
      emptyMessage="No completed maintenance yet."
    />
  );
}

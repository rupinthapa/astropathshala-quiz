export default function EventPage({ params }: { params: { eventId: string } }) {
  return (
    <div>
      <h2>Quiz Event #{params.eventId}</h2>
      <p>Select an option from above: Manage Questions or Manage Rounds.</p>
    </div>
  );
}

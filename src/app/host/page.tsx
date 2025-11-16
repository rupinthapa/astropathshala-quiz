import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function HostPage() {
  const events = await prisma.quizEvent.findMany({
    include: {
      school: true,
      _count: {
        select: {
          rounds: true,
          teams: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  if (!events || events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Quiz Events</h1>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 mb-4">No events found.</p>
            <Link 
              href="/admin/events/create" 
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Create New Event
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Quiz Events</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">{event.name}</h2>
                <p className="text-gray-600 mb-3">{event.school?.name || 'No school'}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span className="mr-3">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {event.level}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>{event._count.rounds} Rounds</span>
                  <span>{event._count.teams} Teams</span>
                </div>
                
                <Link 
                  href={`/host/${event.id}`}
                  className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  Manage Event
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

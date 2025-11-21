import AdminLayout from "../../../AdminLayout";
import { prisma } from "@/lib/prisma";

export default async function CreateQuestionPage({
  params,
}: {
  params: { eventId: string; roundId: string };
}) {
  const eventId = Number(params.eventId);
  const roundId = Number(params.roundId);

  return (
    <AdminLayout>
      <h1 className="quiz-title">Add New Question</h1>

      <div className="quiz-card">
        <form
          action="/api/admin/questions/create"
          method="POST"
          encType="multipart/form-data"
        >
          <input type="hidden" name="roundId" value={roundId} />

          <label className="quiz-label">Question Text</label>
          <textarea
            name="text"
            className="quiz-input"
            placeholder="Enter question..."
            required
          />

          <label className="quiz-label">Question Type</label>
          <select name="type" className="quiz-input">
            <option value="MCQ">MCQ</option>
            <option value="RIDDLE">Riddle</option>
            <option value="VISUAL">Image / Visual</option>
            <option value="AUDIO">Audio</option>
            <option value="VIDEO">Video</option>
            <option value="ORDER">Arrange in Order</option>
          </select>

          {/* OPTIONS: Only used for MCQ */}
          <h4 style={{ marginTop: 15 }}>MCQ Options</h4>

          <input
            type="text"
            name="optionA"
            className="quiz-input"
            placeholder="Option A"
          />
          <input
            type="text"
            name="optionB"
            className="quiz-input"
            placeholder="Option B"
          />
          <input
            type="text"
            name="optionC"
            className="quiz-input"
            placeholder="Option C"
          />
          <input
            type="text"
            name="optionD"
            className="quiz-input"
            placeholder="Option D"
          />

          <label className="quiz-label">Correct Option</label>
          <select name="correctOption" className="quiz-input">
            <option value="">None</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>

          {/* For images / audio / video */}
          <label className="quiz-label" style={{ marginTop: 20 }}>
            Upload File (Image / Audio / Video)
          </label>
          <input type="file" name="mediaFile" className="quiz-input" />

          <label className="quiz-label">Points</label>
          <input
            type="number"
            name="points"
            className="quiz-input"
            defaultValue={10}
          />

          <label className="quiz-label">Time Limit (sec)</label>
          <input
            type="number"
            name="timeLimitSec"
            className="quiz-input"
            defaultValue={30}
          />

          <button className="quiz-btn quiz-btn-primary" style={{ marginTop: 20 }}>
            Save Question
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}

import AdminLayout from "../../../AdminLayout";
import { prisma } from "@/lib/prisma";

export default async function EditQuestionPage({
  params,
}: {
  params: { eventId: string; roundId: string; questionId: string };
}) {
  const questionId = Number(params.questionId);
  const eventId = Number(params.eventId);
  const roundId = Number(params.roundId);

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question)
    return (
      <AdminLayout>
        <div>Question not found</div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <h1 className="quiz-title">Edit Question</h1>

      <div className="quiz-card">
        <form
          action="/api/admin/questions/update"
          method="POST"
          encType="multipart/form-data"
        >
          <input type="hidden" name="questionId" value={questionId} />

          <label className="quiz-label">Question Text</label>
          <textarea
            name="text"
            className="quiz-input"
            defaultValue={question.text}
            required
          />

          <label className="quiz-label">Type</label>
          <select name="type" className="quiz-input" defaultValue={question.type}>
            <option value="MCQ">MCQ</option>
            <option value="RIDDLE">Riddle</option>
            <option value="VISUAL">Visual</option>
            <option value="AUDIO">Audio</option>
            <option value="VIDEO">Video</option>
            <option value="ORDER">Arrange</option>
          </select>

          <h4 style={{ marginTop: 15 }}>MCQ Options</h4>

          <input
            className="quiz-input"
            name="optionA"
            defaultValue={question.optionA ?? ""}
            placeholder="Option A"
          />
          <input
            className="quiz-input"
            name="optionB"
            defaultValue={question.optionB ?? ""}
            placeholder="Option B"
          />
          <input
            className="quiz-input"
            name="optionC"
            defaultValue={question.optionC ?? ""}
            placeholder="Option C"
          />
          <input
            className="quiz-input"
            name="optionD"
            defaultValue={question.optionD ?? ""}
            placeholder="Option D"
          />

          <label className="quiz-label">Correct Option</label>
          <select
            name="correctOption"
            className="quiz-input"
            defaultValue={question.correctOption ?? ""}
          >
            <option value="">None</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>

          <label className="quiz-label" style={{ marginTop: 20 }}>
            Replace Media (optional)
          </label>
          <input type="file" name="mediaFile" className="quiz-input" />

          <label className="quiz-label">Points</label>
          <input
            type="number"
            name="points"
            className="quiz-input"
            defaultValue={question.points}
          />

          <label className="quiz-label">Time (sec)</label>
          <input
            type="number"
            name="timeLimitSec"
            className="quiz-input"
            defaultValue={question.timeLimitSec}
          />

          <button className="quiz-btn quiz-btn-primary" style={{ marginTop: 20 }}>
            Update Question
          </button>
        </form>

        {/* DELETE BUTTON */}
        <form
          action="/api/admin/questions/delete"
          method="POST"
          style={{ marginTop: 20 }}
        >
          <input type="hidden" name="questionId" value={questionId} />
          <button className="quiz-btn quiz-btn-danger">Delete Question</button>
        </form>
      </div>
    </AdminLayout>
  );
}

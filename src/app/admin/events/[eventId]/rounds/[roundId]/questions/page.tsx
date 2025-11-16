export default function CreateQuestionPage({ params }: any) {
  const { eventId, roundId } = params;

  return (
    <div>
      <h2>Add Question</h2>

      <form 
        action={`/admin/events/${eventId}/rounds/${roundId}/questions/create`}
        method="post"
      >
        <input name="text" placeholder="Question text" required />

        <input name="optionA" placeholder="Option A" required />
        <input name="optionB" placeholder="Option B" required />
        <input name="optionC" placeholder="Option C" required />
        <input name="optionD" placeholder="Option D" required />

        <select name="correctOption" required>
          <option value="">Correct Answer</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>

        <input
          type="number"
          name="points"
          placeholder="Points"
          defaultValue={10}
          required
        />

        <input
          type="number"
          name="timeLimitSec"
          placeholder="Time Limit (sec)"
          defaultValue={30}
          required
        />

        <input
          type="number"
          name="orderInRound"
          placeholder="Order"
          defaultValue={1}
          required
        />

        <button type="submit">Create Question</button>
      </form>
    </div>
  );
}

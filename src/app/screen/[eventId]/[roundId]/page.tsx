import ScreenClient from "./ScreenClient";

export default function Page({ params }: any) {
  const { eventId, roundId } = params;

  return (
    <ScreenClient channel={`screen-${roundId}`} />
  );
}

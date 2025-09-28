import { StudyTimer } from '../StudyTimer';

export default function StudyTimerExample() {
  return (
    <div className="max-w-md">
      <StudyTimer
        onSessionComplete={(duration) => console.log(`Session completed: ${duration} minutes`)}
        onSessionStart={() => console.log('Session started')}
        onSessionPause={() => console.log('Session paused')}
      />
    </div>
  );
}
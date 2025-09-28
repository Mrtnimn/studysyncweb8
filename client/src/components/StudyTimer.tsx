import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, RotateCcw, Timer, Coffee } from "lucide-react";

interface StudyTimerProps {
  onSessionComplete?: (duration: number) => void;
  onSessionStart?: () => void;
  onSessionPause?: () => void;
  focusTime?: number;
  shortBreak?: number;
  longBreak?: number;
  sessions?: number;
}

export function StudyTimer({ 
  onSessionComplete, 
  onSessionStart, 
  onSessionPause,
  focusTime = 25,
  shortBreak = 5,
  longBreak = 15,
  sessions = 4
}: StudyTimerProps) {
  const [timeLeft, setTimeLeft] = useState(focusTime * 60); // Use custom focus time
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [customTime, setCustomTime] = useState("");
  const [sessionType, setSessionType] = useState("pomodoro");

  const presets = {
    pomodoro: focusTime * 60,
    short: shortBreak * 60,
    long: longBreak * 60,
    break: shortBreak * 60,
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    onSessionStart?.();
    console.log("Study session started");
  };

  const handlePause = () => {
    setIsRunning(false);
    onSessionPause?.();
    console.log("Study session paused");
  };

  const handleStop = () => {
    setIsRunning(false);
    setTimeLeft(presets[sessionType as keyof typeof presets]);
    console.log("Study session stopped");
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(presets[sessionType as keyof typeof presets]);
    console.log("Timer reset");
  };

  const handleSessionComplete = () => {
    setIsRunning(false);
    const completedDuration = presets[sessionType as keyof typeof presets];
    onSessionComplete?.(completedDuration / 60);
    
    // Auto-switch to break if it was a study session
    if (!isBreak) {
      setIsBreak(true);
      setTimeLeft(presets.break);
      setSessionType("break");
    } else {
      setIsBreak(false);
      setTimeLeft(presets.pomodoro);
      setSessionType("pomodoro");
    }
    
    console.log("Session completed!");
  };

  const handlePresetChange = (value: string) => {
    setSessionType(value);
    setTimeLeft(presets[value as keyof typeof presets]);
    setIsRunning(false);
  };

  const handleCustomTime = () => {
    const minutes = parseInt(customTime);
    if (minutes && minutes > 0) {
      setTimeLeft(minutes * 60);
      setCustomTime("");
      setIsRunning(false);
      console.log(`Custom time set: ${minutes} minutes`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto" data-testid="study-timer">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {isBreak ? (
            <Coffee className="w-5 h-5 text-orange-500" />
          ) : (
            <Timer className="w-5 h-5 text-primary" />
          )}
          {isBreak ? "Break Time" : "Study Timer"}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-6xl font-mono font-bold text-primary mb-2">
            {formatTime(timeLeft)}
          </div>
          <Badge variant={isBreak ? "secondary" : "default"} className="text-sm">
            {isBreak ? "Break Mode" : "Study Mode"}
          </Badge>
        </div>
        
        {/* Timer Controls */}
        <div className="flex justify-center gap-2">
          {!isRunning ? (
            <Button onClick={handleStart} className="flex items-center gap-2" data-testid="button-start-timer">
              <Play className="w-4 h-4" />
              Start
            </Button>
          ) : (
            <Button onClick={handlePause} variant="secondary" className="flex items-center gap-2" data-testid="button-pause-timer">
              <Pause className="w-4 h-4" />
              Pause
            </Button>
          )}
          
          <Button onClick={handleStop} variant="outline" className="flex items-center gap-2" data-testid="button-stop-timer">
            <Square className="w-4 h-4" />
            Stop
          </Button>
          
          <Button onClick={handleReset} variant="ghost" size="icon" data-testid="button-reset-timer">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Preset Selection */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Quick Presets</label>
            <Select value={sessionType} onValueChange={handlePresetChange}>
              <SelectTrigger data-testid="select-timer-preset">
                <SelectValue placeholder="Select preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pomodoro">Pomodoro (25 min)</SelectItem>
                <SelectItem value="short">Short Session (15 min)</SelectItem>
                <SelectItem value="long">Long Session (45 min)</SelectItem>
                <SelectItem value="break">Break (5 min)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Custom Time Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">Custom Time (minutes)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="30"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="flex-1"
                min="1"
                max="180"
                data-testid="input-custom-time"
              />
              <Button onClick={handleCustomTime} variant="outline" data-testid="button-set-custom-time">
                Set
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: string;
  className?: string;
}

const CountdownTimer = ({ targetDate, className = "" }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime() - 60000; // minus 1 minute
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("LOCKED");
        setIsUrgent(false);
        return;
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
        setIsUrgent(false);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
        setIsUrgent(false);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
        setIsUrgent(minutes < 5);
      } else {
        setTimeLeft(`${seconds}s`);
        setIsUrgent(true);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft === "LOCKED") {
    return (
      <span className={`text-primary font-bold uppercase tracking-wider text-sm ${className}`}>
        Locked
      </span>
    );
  }

  return (
    <span
      className={`font-mono font-bold tabular-nums ${
        isUrgent ? "text-primary animate-pulse-red" : "text-foreground"
      } ${className}`}
    >
      {timeLeft}
    </span>
  );
};

export default CountdownTimer;

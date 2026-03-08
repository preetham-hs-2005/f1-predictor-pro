import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Poll } from "@/hooks/useDiscussions";

interface PollComponentProps {
  poll: Poll;
  onVote: (selectedOptions: number[]) => Promise<void>;
  hasVoted: boolean;
  isLoading?: boolean;
}

function PollComponent({
  poll,
  onVote,
  hasVoted,
  isLoading = false,
}: PollComponentProps) {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  const handleVote = async () => {
    if (selectedOptions.length === 0) return;
    await onVote(selectedOptions);
    setSelectedOptions([]);
  };

  const handleCheckboxChange = (index: number, checked: boolean) => {
    if (checked) {
      setSelectedOptions([...selectedOptions, index]);
    } else {
      setSelectedOptions(selectedOptions.filter((i) => i !== index));
    }
  };

  const handleRadioChange = (index: string) => {
    setSelectedOptions([parseInt(index)]);
  };

  const getTotalVotes = () => {
    return poll.voteCounts ? poll.voteCounts.reduce((a, b) => a + b, 0) : 0;
  };

  const getPercentage = (votes: number) => {
    const total = getTotalVotes();
    return total === 0 ? 0 : ((votes / total) * 100).toFixed(1);
  };

  return (
    <div className="border rounded-lg p-4 bg-card space-y-4">
      <div>
        <h3 className="font-semibold text-lg mb-1">{poll.question}</h3>
        {poll.description && (
          <p className="text-sm text-gray-600 mb-2">{poll.description}</p>
        )}
      </div>

      {poll.type === "multiple" ? (
        <div className="space-y-3">
          {poll.options.map((option, index) => {
            const votes = poll.voteCounts?.[index] || 0;
            const percentage = getPercentage(votes);

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`option-${index}`}
                    checked={selectedOptions.includes(index)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(index, checked as boolean)
                    }
                    disabled={hasVoted || poll.closed}
                  />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                  <span className="text-xs text-gray-600">
                    {votes} ({percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <RadioGroup value={selectedOptions[0]?.toString() || ""}>
          {poll.options.map((option, index) => {
            const votes = poll.voteCounts?.[index] || 0;
            const percentage = getPercentage(votes);

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value={index.toString()}
                    id={`option-${index}`}
                    disabled={hasVoted || poll.closed}
                    onClick={() => handleRadioChange(index.toString())}
                  />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                  <span className="text-xs text-gray-600">
                    {votes} ({percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </RadioGroup>
      )}

      {!hasVoted && !poll.closed && (
        <Button
          onClick={handleVote}
          disabled={selectedOptions.length === 0 || isLoading}
          className="w-full"
        >
          {isLoading ? "Voting..." : "Vote"}
        </Button>
      )}

      {hasVoted && (
        <div className="text-sm text-green-600 text-center">You voted on this poll</div>
      )}

      {poll.closed && (
        <div className="text-sm text-gray-600 text-center">This poll is closed</div>
      )}

      <div className="text-xs text-gray-500 text-center">
        Total votes: {getTotalVotes()}
      </div>
    </div>
  );
}

export default PollComponent;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Poll } from "@/lib/api/discussions";

interface PollComponentProps {
  poll: Poll;
  onVote: (selectedOptions: number[]) => Promise<void>;
  onDelete?: () => Promise<boolean>;
  hasVoted: boolean;
  isLoading?: boolean;
}

function PollComponent({
  poll,
  onVote,
  onDelete,
  hasVoted,
  isLoading = false,
}: PollComponentProps) {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!onDelete) return;
    if (window.confirm("Are you sure you want to delete this poll?")) {
      setIsDeleting(true);
      try {
        await onDelete();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getTotalVotes = () => {
    return poll.voteCounts ? poll.voteCounts.reduce((a, b) => a + b, 0) : 0;
  };

  const getPercentage = (votes: number) => {
    const total = getTotalVotes();
    return total === 0 ? 0 : ((votes / total) * 100).toFixed(1);
  };

  return (
    <div className="border border-gray-800 rounded-lg p-3 bg-gray-900 flex flex-col gap-3">
      {/* Top Header - Small single line */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-white truncate">{poll.question}</h3>
          {poll.description && (
            <p className="text-xs text-gray-400 truncate mt-0.5">{poll.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-gray-500">{getTotalVotes()} votes</span>

          {/* Voting Dialog - Only accessible if not voted and not closed */}
          {!hasVoted && !poll.closed ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white h-7 text-xs px-3" disabled={isLoading}>
                  VOTE
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-gray-900 border-gray-800 text-white">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">{poll.question}</DialogTitle>
                  {poll.description && (
                    <p className="text-sm text-gray-400 mt-2">{poll.description}</p>
                  )}
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {poll.type === "multiple" ? (
                    <div className="space-y-3">
                      {poll.options.map((option, index) => {
                        const votes = poll.voteCounts?.[index] || 0;
                        const percentage = getPercentage(votes);

                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`dialog-option-${poll._id}-${index}`}
                                checked={selectedOptions.includes(index)}
                                onCheckedChange={(checked) =>
                                  handleCheckboxChange(index, checked as boolean)
                                }
                                className="border-gray-500 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                              />
                              <Label htmlFor={`dialog-option-${poll._id}-${index}`} className="flex-1 cursor-pointer text-gray-200">
                                {option}
                              </Label>
                              <span className="text-xs text-gray-400">
                                {votes} ({percentage}%)
                              </span>
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
                                id={`dialog-option-${poll._id}-${index}`}
                                onClick={() => handleRadioChange(index.toString())}
                                className="border-gray-500 text-red-600"
                              />
                              <Label htmlFor={`dialog-option-${poll._id}-${index}`} className="flex-1 cursor-pointer text-gray-200">
                                {option}
                              </Label>
                              <span className="text-xs text-gray-400">
                                {votes} ({percentage}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  )}

                  <Button
                    onClick={() => {
                      handleVote();
                    }}
                    disabled={selectedOptions.length === 0 || isLoading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white mt-6"
                  >
                    {isLoading ? "Voting..." : "Submit Vote"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : null}

          {hasVoted && (
            <span className="text-xs text-green-500 font-medium border border-green-900/50 bg-green-900/20 px-2 py-0.5 rounded">✓ Voted</span>
          )}

          {poll.closed && !hasVoted && (
            <span className="text-xs text-gray-500 border border-gray-700 bg-gray-800 px-2 py-0.5 rounded">Closed</span>
          )}

          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 h-7 w-7 p-0 ml-1"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Results Section - Only visible if voted or closed */}
      {(hasVoted || poll.closed) && (
        <div className="space-y-3 pt-3 border-t border-gray-800">
          {poll.type === "multiple" ? (
            <div className="space-y-3">
              {poll.options.map((option, index) => {
                const votes = poll.voteCounts?.[index] || 0;
                const percentage = getPercentage(votes);

                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`option-${poll._id}-${index}`}
                        checked={selectedOptions.includes(index)}
                        disabled={true}
                        className="border-gray-500 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                      />
                      <Label htmlFor={`option-${poll._id}-${index}`} className="flex-1 cursor-pointer text-gray-200">
                        {option}
                      </Label>
                      <span className="text-xs text-gray-400">
                        {votes} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
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
                        id={`option-${poll._id}-${index}`}
                        disabled={true}
                        className="border-gray-500 text-red-600"
                      />
                      <Label htmlFor={`option-${poll._id}-${index}`} className="flex-1 cursor-pointer text-gray-200">
                        {option}
                      </Label>
                      <span className="text-xs text-gray-400">
                        {votes} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          )}
        </div>
      )}
    </div>
  );
}

export default PollComponent;

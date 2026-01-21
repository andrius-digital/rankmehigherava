import { Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Submission {
  id: string;
  company_name: string;
  business_email: string;
  created_at: string;
  form_data: any;
}

interface SubmissionsListProps {
  submissions: Submission[];
  selectedId: string | null;
  onSelect: (submission: Submission) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading: boolean;
}

export const SubmissionsList = ({
  submissions,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  isLoading,
}: SubmissionsListProps) => {
  const filteredSubmissions = submissions.filter(
    (s) =>
      s.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.business_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const selectedIndex = filteredSubmissions.findIndex(s => s.id === selectedId);

  return (
    <div className="flex flex-col h-full border-r border-border bg-card">
      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search submissions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Count */}
      <div className="px-4 py-2 text-sm text-muted-foreground border-b border-border flex items-center gap-2">
        {selectedIndex !== -1 && (
          <span className="text-foreground font-medium">
            {selectedIndex + 1} of{" "}
          </span>
        )}
        {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? "s" : ""}
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchQuery ? "No matching submissions" : "No submissions yet"}
          </div>
        ) : (
          <div>
            {filteredSubmissions.map((submission) => (
              <button
                key={submission.id}
                onClick={() => onSelect(submission)}
                className={cn(
                  "w-full text-left p-4 border-b border-border transition-colors hover:bg-muted/50",
                  selectedId === submission.id && "bg-primary/5 border-l-2 border-l-primary"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">
                      {submission.business_email}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {submission.company_name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(submission.created_at)}
                    </span>
                    <Star className="w-4 h-4 text-muted-foreground/50 hover:text-yellow-500 transition-colors" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

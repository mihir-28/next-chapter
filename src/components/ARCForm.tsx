import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  User, 
  Calendar as CalendarIcon, 
  Link as LinkIcon, 
  FileText, 
  Upload, 
  Trash2, 
  Star,
  ChevronLeft,
  Image as ImageIcon
} from "lucide-react";
import { ReadingStatus, ReviewStatus, NewARCData, ARC } from "@/context/DatabaseContext";
import BookCover from "./BookCover";
import { format, parseISO } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { showAppToast } from "@/lib/toasts";



interface ARCFormProps {
  initialData?: ARC;
  onSubmit: (data: NewARCData) => Promise<void>;
  onDelete?: () => Promise<void>;
  submitLabel: string;
  title: string;
}

const READING_STATUS_OPTIONS: ReadingStatus[] = ["To Read", "Currently Reading", "Finished", "DNF"];
const REVIEW_STATUS_OPTIONS: ReviewStatus[] = ["Not Started", "Drafted", "Submitted", "Published"];

export default function ARCForm({ 
  initialData, 
  onSubmit, 
  onDelete, 
  submitLabel,
  title
}: ARCFormProps) {
  const router = useRouter();
  
  // Fields State
  const [bookTitle, setBookTitle] = useState(initialData?.title || "");
  const [author, setAuthor] = useState(initialData?.author || "");
  const [deadline, setDeadline] = useState(initialData?.deadline || "");
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>(initialData?.readingStatus || "To Read");
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(initialData?.reviewStatus || "Not Started");
  
  const [coverUrl, setCoverUrl] = useState(initialData?.coverUrl || "");
  const [releaseDate, setReleaseDate] = useState(initialData?.releaseDate || "");
  const [dateReceived, setDateReceived] = useState(initialData?.dateReceived || "");
  const [progress, setProgress] = useState<number>(initialData?.progress || 0);
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [rating, setRating] = useState<number>(initialData?.rating || 0);
  const [dateFinished, setDateFinished] = useState(initialData?.dateFinished || "");
  const [reviewLink, setReviewLink] = useState(initialData?.reviewLink || "");
  const [goodreadsUrl, setGoodreadsUrl] = useState(initialData?.goodreadsUrl || "");
  const [storygraphUrl, setStorygraphUrl] = useState(initialData?.storygraphUrl || "");
  const [amazonUrl, setAmazonUrl] = useState(initialData?.amazonUrl || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setStatusAsFinished = () => {
    setReadingStatus("Finished");
    setProgress(100);
    if (!dateFinished) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      setDateFinished(`${yyyy}-${mm}-${dd}`);
    }
    if (reviewStatus === "Not Started") {
      setReviewStatus("Drafted");
    }
  };

  const handleDateChange = (date: Date | undefined, setter: (val: string) => void) => {
    if (!date) {
      setter("");
    } else {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      setter(`${yyyy}-${mm}-${dd}`);
    }
  };

  // Handle local file selection and convert to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      showAppToast({
        type: "warning",
        title: "Cover image is too large",
        description: "Choose an image under 800KB to keep syncing smooth.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!bookTitle.trim() || !author.trim() || !deadline) {
      setError("Please fill in all required fields (Title, Author, and Deadline).");
      setLoading(false);
      return;
    }

    const cleanedData: NewARCData = {
      title: bookTitle.trim(),
      author: author.trim(),
      deadline,
      readingStatus,
      reviewStatus,
      coverUrl: coverUrl.trim() || "",
      releaseDate: releaseDate || "",
      dateReceived: dateReceived || "",
      progress: readingStatus === "Currently Reading" || readingStatus === "Finished" ? progress : 0,
      notes: notes.trim() || "",
      rating: readingStatus === "Finished" && rating > 0 ? rating : 0,
      dateFinished: readingStatus === "Finished" ? dateFinished : "",
      reviewLink: reviewStatus === "Published" || reviewStatus === "Submitted" ? reviewLink.trim() : "",
      goodreadsUrl: (readingStatus === "Finished" || reviewStatus === "Published" || reviewStatus === "Submitted") ? goodreadsUrl.trim() : "",
      storygraphUrl: (readingStatus === "Finished" || reviewStatus === "Published" || reviewStatus === "Submitted") ? storygraphUrl.trim() : "",
      amazonUrl: (readingStatus === "Finished" || reviewStatus === "Published" || reviewStatus === "Submitted") ? amazonUrl.trim() : "",
    };

    try {
      await onSubmit(cleanedData);
      router.push("/");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An error occurred while saving the ARC.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-6">
      
      {/* Header back navigation */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/40 text-slate-400 hover:text-slate-200 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight text-white font-sans">{title}</h1>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-400 text-sm font-body flex items-center space-x-2">
          <Trash2 className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Split Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        
        {/* Left Side: Cover Preview & Cover Input */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider font-sans">Cover Artwork</h2>
          
          {/* Card preview layout */}
          <div className="aspect-5/8 w-48 mx-auto lg:w-full rounded-3xl overflow-hidden border border-white/5 shadow-xl relative bg-slate-900 group">
            <BookCover title={bookTitle || "Title Placeholder"} author={author || "Author"} coverUrl={coverUrl} size="lg" />
            {coverUrl && (
              <button
                type="button"
                onClick={() => setCoverUrl("")}
                className="absolute top-3 right-3 p-2.5 rounded-xl bg-slate-950/80 hover:bg-rose-950/90 border border-white/10 hover:border-rose-900/40 text-slate-400 hover:text-rose-400 transition-all cursor-pointer shadow-lg active:scale-90 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 z-20"
                title="Remove cover image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Upload and URL Inputs */}
          <div className="p-5 sm:p-6 glass-panel border border-slate-800/40 space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 font-sans cursor-pointer">
                Upload Cover File
              </label>
              <label className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-2xl bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-300 hover:text-slate-100 text-xs font-medium cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Select cover image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-[10px] text-slate-500 mt-1">PNG, JPG up to 800KB.</p>
            </div>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-slate-850"></div>
              <span className="shrink mx-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">or</span>
              <div className="grow border-t border-slate-850"></div>
            </div>

            {/* URL Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
                Cover Image URL
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="url"
                  placeholder="https://..."
                  value={coverUrl.startsWith("data:") ? "" : coverUrl} // Clear if base64 to allow URL typing
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-2xl bg-slate-900 border border-slate-850 focus:border-blue-500/30 outline-none text-slate-200 text-xs font-body"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Fields Input (2 cols size) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Basic Details */}
          <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800/40 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Core Details</h3>
            
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
                Book Title <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. The Midnight Library"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="w-full pl-11 pr-4.5 py-3.5 h-12 rounded-2xl bg-slate-950/20 border border-slate-850 focus:border-blue-500/30 focus:ring-2 focus:ring-blue-500/10 outline-none text-slate-100 text-sm font-body transition-all"
                />
              </div>
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
                Author Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Matt Haig"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full pl-11 pr-4.5 py-3.5 h-12 rounded-2xl bg-slate-950/20 border border-slate-850 focus:border-blue-500/30 focus:ring-2 focus:ring-blue-500/10 outline-none text-slate-100 text-sm font-body transition-all"
                />
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-xs font-semibold text-slate-350 mb-1.5 font-sans">
                Review Deadline <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "w-full text-left font-normal pl-11 pr-4 py-3 h-12 text-sm bg-slate-900 border border-slate-850 hover:border-slate-700/80 focus:border-blue-500/30 focus:ring-2 focus:ring-blue-500/10 outline-none text-slate-100 rounded-2xl transition-all flex items-center cursor-pointer select-none relative",
                        !deadline && "text-slate-500"
                      )}
                    >
                      <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                      {deadline ? (
                        format(parseISO(deadline), "PPP")
                      ) : (
                        <span className="text-slate-500">Pick a review deadline</span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-slate-800" align="start">
                    <Calendar
                      mode="single"
                      selected={deadline ? parseISO(deadline) : undefined}
                      onSelect={(date) => handleDateChange(date, setDeadline)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Section: Status & Pipeline */}
          <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800/40 space-y-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Reading Pipeline</h3>

            {/* Reading Status Pill Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-350 mb-2 font-sans">Reading Status</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {READING_STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      if (status === "Finished") {
                        setStatusAsFinished();
                      } else {
                        setReadingStatus(status);
                        if (status === "To Read") {
                          setProgress(0);
                        } else if (status === "Currently Reading" && progress === 0) {
                          setProgress(10);
                        }
                      }
                    }}
                    className={`flex items-center justify-center text-center px-2 py-1.5 min-h-11 h-auto rounded-2xl text-[10px] sm:text-xs font-bold border cursor-pointer transition-all duration-300 leading-tight ${
                      readingStatus === status
                        ? status === "To Read" ? "bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-md shadow-sky-500/5 scale-[1.01]" :
                          status === "Currently Reading" ? "bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-md shadow-blue-500/5 scale-[1.01]" :
                          status === "Finished" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-md shadow-emerald-500/5 scale-[1.01]" :
                          "bg-slate-700/20 text-slate-450 border-slate-700/30 shadow-md scale-[1.01]"
                        : "bg-slate-950/20 border-slate-850 text-slate-400 hover:text-slate-250 hover:bg-slate-900/30"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Review Status Pill Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-350 mb-2 font-sans">Review Status</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {REVIEW_STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setReviewStatus(status)}
                    className={`flex items-center justify-center text-center px-2 py-1.5 min-h-11 h-auto rounded-2xl text-[10px] sm:text-xs font-bold border cursor-pointer transition-all duration-300 leading-tight ${
                      reviewStatus === status
                        ? status === "Not Started" ? "bg-slate-700/20 text-slate-450 border-slate-700/30 shadow-md scale-[1.01]" :
                          status === "Drafted" ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-md shadow-amber-500/5 scale-[1.01]" :
                          status === "Submitted" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-md shadow-indigo-500/5 scale-[1.01]" :
                          "bg-teal-500/10 text-teal-400 border-teal-500/30 shadow-md shadow-teal-500/5 scale-[1.01]"
                        : "bg-slate-950/20 border-slate-850 text-slate-400 hover:text-slate-250 hover:bg-slate-900/30"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Reading Progress slider (shows for Currently Reading / Finished) */}
            {(readingStatus === "Currently Reading" || readingStatus === "Finished") && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-350 font-sans">
                  <span>Reading Progress</span>
                  <span className="text-blue-400 font-bold">{progress}%.</span>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    disabled={readingStatus === "Finished"}
                    value={progress}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setProgress(val);
                      if (val === 100 && readingStatus !== "Finished") {
                        setStatusAsFinished();
                      }
                    }}
                    className="flex-1 accent-blue-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    disabled={readingStatus === "Finished"}
                    value={progress}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, Number(e.target.value)));
                      setProgress(val);
                      if (val === 100 && readingStatus !== "Finished") {
                        setStatusAsFinished();
                      }
                    }}
                    className="w-16 bg-slate-900 border border-slate-850 rounded-2xl px-2 py-1 text-center text-xs font-bold text-slate-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section: Optional Meta Data (Release, Notes, Rating, Link) */}
          <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800/40 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Additional Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Release Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-350 mb-1.5 font-sans">Release Date</label>
                <div className="relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "w-full text-left font-normal pl-9 pr-3 py-2.5 h-10 text-xs bg-slate-900 border border-slate-850 hover:border-slate-700/80 focus:border-blue-500/30 focus:ring-2 focus:ring-blue-500/10 outline-none text-slate-200 rounded-2xl transition-all flex items-center cursor-pointer select-none relative",
                          !releaseDate && "text-slate-500"
                        )}
                      >
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        {releaseDate ? (
                          format(parseISO(releaseDate), "PPP")
                        ) : (
                          <span className="text-slate-500">Pick release date</span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-slate-800" align="start">
                      <Calendar
                        mode="single"
                        selected={releaseDate ? parseISO(releaseDate) : undefined}
                        onSelect={(date) => handleDateChange(date, setReleaseDate)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Date Received */}
              <div>
                <label className="block text-xs font-semibold text-slate-350 mb-1.5 font-sans">Date Received</label>
                <div className="relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "w-full text-left font-normal pl-9 pr-3 py-2.5 h-10 text-xs bg-slate-900 border border-slate-850 hover:border-slate-700/80 focus:border-blue-500/30 focus:ring-2 focus:ring-blue-500/10 outline-none text-slate-205 rounded-2xl transition-all flex items-center cursor-pointer select-none relative",
                          !dateReceived && "text-slate-500"
                        )}
                      >
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        {dateReceived ? (
                          format(parseISO(dateReceived), "PPP")
                        ) : (
                          <span className="text-slate-550">Pick date received</span>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-slate-800" align="start">
                      <Calendar
                        mode="single"
                        selected={dateReceived ? parseISO(dateReceived) : undefined}
                        onSelect={(date) => handleDateChange(date, setDateReceived)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Star Rating Widget & Date Finished (Finished books only) */}
            {readingStatus === "Finished" && (
              <div className="pt-2 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-350 mb-1.5 font-sans">Book Rating</label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-slate-600 hover:text-amber-400 active:scale-90 transition-all cursor-pointer"
                      >
                        <Star 
                          className={`w-6 h-6 ${
                            star <= rating 
                              ? "fill-amber-400 text-amber-400" 
                              : "text-slate-700 hover:text-slate-500"
                          }`} 
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="text-xs text-amber-400 font-bold ml-2">({rating} Stars)</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-350 mb-1.5 font-sans">Date Finished</label>
                  <div className="relative">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "w-full text-left font-normal pl-9 pr-3 py-2.5 h-10 text-xs bg-slate-900 border border-slate-850 hover:border-slate-700/80 focus:border-blue-500/30 focus:ring-2 focus:ring-blue-500/10 outline-none text-slate-200 rounded-2xl transition-all flex items-center cursor-pointer select-none relative",
                            !dateFinished && "text-slate-500"
                          )}
                        >
                          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          {dateFinished ? (
                            format(parseISO(dateFinished), "PPP")
                          ) : (
                            <span className="text-slate-500">Pick date finished</span>
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-slate-800" align="start">
                        <Calendar
                          mode="single"
                          selected={dateFinished ? parseISO(dateFinished) : undefined}
                          onSelect={(date) => handleDateChange(date, setDateFinished)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            )}

            {/* Review Link (Submitted or Published reviews only) */}
            {(reviewStatus === "Published" || reviewStatus === "Submitted") && (
              <div>
                <label className="block text-xs font-semibold text-slate-350 mb-1.5 font-sans">
                  Published Review URL
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="url"
                    placeholder="https://myblog.com/review"
                    value={reviewLink}
                    onChange={(e) => setReviewLink(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-900 border border-slate-850 focus:border-blue-500/35 outline-none text-slate-200 text-xs font-body"
                  />
                </div>
              </div>
            )}

            {/* Platform Review Links (Shown when book is Finished or Review is Submitted/Published) */}
            {(readingStatus === "Finished" || reviewStatus === "Published" || reviewStatus === "Submitted") && (
              <div className="space-y-4 pt-3 border-t border-slate-800/40">
                <div className="flex items-center space-x-2">
                  <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Review Platform URLs</h4>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {/* Goodreads URL */}
                  <div>
                    <label className="flex items-center text-xs font-semibold text-slate-355 mb-1.5 font-sans">
                      <img src="/assets/goodreads.png" alt="Goodreads" className="w-4.5 h-4.5 mr-2 shrink-0 object-contain rounded-lg" />
                      <span>Goodreads Review URL</span>
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="url"
                        placeholder="https://www.goodreads.com/review/show/..."
                        value={goodreadsUrl}
                        onChange={(e) => setGoodreadsUrl(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-900 border border-slate-850 focus:border-blue-500/35 outline-none text-slate-200 text-xs font-body"
                      />
                    </div>
                  </div>

                  {/* StoryGraph URL */}
                  <div>
                    <label className="flex items-center text-xs font-semibold text-slate-355 mb-1.5 font-sans">
                      <div className="w-4.5 h-4.5 mr-2 shrink-0 bg-white rounded-lg flex items-center justify-center overflow-hidden p-0.5">
                        <img src="/assets/storygraph.png" alt="StoryGraph" className="w-full h-full object-contain" />
                      </div>
                      <span>StoryGraph Review URL</span>
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="url"
                        placeholder="https://app.thestorygraph.com/reviews/..."
                        value={storygraphUrl}
                        onChange={(e) => setStorygraphUrl(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-900 border border-slate-850 focus:border-blue-500/35 outline-none text-slate-200 text-xs font-body"
                      />
                    </div>
                  </div>

                  {/* Amazon URL */}
                  <div>
                    <label className="flex items-center text-xs font-semibold text-slate-355 mb-1.5 font-sans">
                      <div className="w-4.5 h-4.5 mr-2 shrink-0 bg-white rounded-lg flex items-center justify-center overflow-hidden p-0.5">
                        <img src="/assets/amazon.png" alt="Amazon" className="w-full h-full object-contain" />
                      </div>
                      <span>Amazon Review URL</span>
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="url"
                        placeholder="https://www.amazon.com/review/..."
                        value={amazonUrl}
                        onChange={(e) => setAmazonUrl(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-900 border border-slate-850 focus:border-blue-500/35 outline-none text-slate-200 text-xs font-body"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-350 mb-1.5 font-sans">Personal Notes</label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <textarea
                  placeholder="Thoughts, review outline, quotes, character names..."
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-900 border border-slate-850 focus:border-blue-500/30 outline-none text-slate-205 text-xs font-body resize-y"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons (Submit, Delete, Cancel) */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            
            {/* Delete button (only in Edit mode) */}
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="w-full sm:w-auto py-3 px-6 rounded-full border border-rose-900/40 hover:bg-rose-950/10 text-rose-400 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete ARC</span>
              </button>
            ) : (
              <div></div> /* Placeholder for layout spacing */
            )}

            <div className="flex flex-row gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="py-3 px-6 rounded-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-semibold text-xs cursor-pointer flex-1 sm:flex-none h-12 flex items-center justify-center transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="py-3 px-8 rounded-full bg-linear-to-r from-[#2e0854] via-[#5b1b9e] to-[#7c3aed] bg-clip-padding border border-[#e5b842]/30 hover:border-[#fbdf93]/80 text-[#fbdf93] font-semibold text-xs tracking-wide shadow-lg shadow-purple-950/50 hover:shadow-[0_0_22px_rgba(124,58,237,0.3)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 cursor-pointer flex-1 sm:flex-none h-12 flex items-center justify-center disabled:opacity-50 disabled:scale-100"
              >
                {loading ? "Saving..." : submitLabel}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}

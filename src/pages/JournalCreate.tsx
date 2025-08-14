import { Component, createSignal, createEffect, onMount } from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";

const API_URL = "https://mindmate-be-production.up.railway.app/api/journals";

// Helper function to convert YYYY-MM-DD to MM-DD-YYYY
function convertToMMDDYYYY(dateStr: string) {
  if (!dateStr) return "";
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [yyyy, mm, dd] = parts;
    return `${mm}-${dd}-${yyyy}`;
  }
  return dateStr;
}

// Helper function to convert MM-DD-YYYY to YYYY-MM-DD
function convertToYYYYMMDD(dateStr: string) {
  if (!dateStr) return "";
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[2].length === 4) {
    const [mm, dd, yyyy] = parts;
    return `${yyyy}-${mm}-${dd}`;
  }
  return dateStr;
}

// Helper function to get initial date value
function getInitialDate(editingJournal: any, stateDate: string | null): string {
  if (editingJournal) {
    // For editing: get the date from created_at field
    const createdAt = editingJournal.created_at;
    if (createdAt.includes('T')) {
      // ISO format: extract date part and keep as YYYY-MM-DD
      return createdAt.split('T')[0];
    } else if (createdAt.length === 10 && createdAt.includes('-')) {
      // Could be YYYY-MM-DD or MM-DD-YYYY
      const parts = createdAt.split('-');
      if (parts[0].length === 4) {
        // Already YYYY-MM-DD
        return createdAt;
      } else {
        // MM-DD-YYYY, convert to YYYY-MM-DD
        return convertToYYYYMMDD(createdAt);
      }
    }
    return createdAt;
  } else if (stateDate) {
    // From calendar: MM-DD-YYYY format, convert to YYYY-MM-DD for input
    return convertToYYYYMMDD(stateDate);
  } else {
    // Default to today
    return new Date().toISOString().split('T')[0];
  }
}

const JournalCreate: Component = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingJournal = (location.state && (location.state as { journal?: any }).journal) ? (location.state as { journal: any }).journal : null;
  const stateDate = (location.state && (location.state as { date?: string }).date) ? (location.state as { date: string }).date : null;

  const [title, setTitle] = createSignal(editingJournal?.title || "");
  const [content, setContent] = createSignal(editingJournal?.content || "");
  const [date, setDate] = createSignal(getInitialDate(editingJournal, stateDate));
  
  const [error, setError] = createSignal("");
  const [isVisible, setIsVisible] = createSignal(false);
  const [loading, setLoading] = createSignal(false);

  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  });

  const handleSubmit = async () => {
    setError("");
    if (!title().trim()) {
      setError("Title is required.");
      return;
    }
    if (!content().trim()) {
      setError("Content is required.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Belum login. Silakan login ulang.");
      setLoading(false);
      return;
    }

    try {
      // Convert YYYY-MM-DD to MM-DD-YYYY for backend
      const formattedDate = convertToMMDDYYYY(date());
      
      let res;
      if (editingJournal) {
        // Update - use created_at field
        res = await fetch(`${API_URL}/${editingJournal.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title().trim(),
            content: content().trim(),
            created_at: formattedDate, // Use created_at and MM-DD-YYYY format
          }),
        });
      } else {
        // Create - use created_at field (not date)
        res = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title().trim(),
            content: content().trim(),
            created_at: formattedDate, // Use created_at and MM-DD-YYYY format
          }),
        });
      }
      
      if (!res.ok) {
        const result = await res.json();
        setError(result.message || "Gagal menyimpan journal.");
        setLoading(false);
        return;
      }
      
      setLoading(false);
      navigate('/journal');
    } catch {
      setError("Gagal menyimpan journal. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class={`transition-all duration-1000 ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 class="text-3xl md:text-4xl font-bold text-rose-700 mb-6">
            {editingJournal ? "Edit Journal Entry" : "Create New Journal Entry"}
          </h1>
          {error() && (
            <div class="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200" role="alert">
              <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
              </svg>
              <span class="sr-only">Error</span>
              <div>{error()}</div>
            </div>
          )}
          <div class="max-w-full p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
            <div class="space-y-6">
              <div>
                <label for="title" class="block mb-2 text-sm font-medium text-gray-900">Title</label>
                <input
                  type="text"
                  id="title"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-rose-200 focus:border-rose-600"
                  placeholder="Enter journal title..."
                  value={title()}
                  onInput={(e) => setTitle(e.currentTarget.value)}
                />
              </div>
              <div>
                <label for="content" class="block mb-2 text-sm font-medium text-gray-900">Content</label>
                <textarea
                  id="content"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-rose-200 focus:border-rose-600"
                  rows={8}
                  placeholder="Write your thoughts here..."
                  value={content()}
                  onInput={(e) => setContent(e.currentTarget.value)}
                />
              </div>
              <div>
                <label for="date" class="block mb-2 text-sm font-medium text-gray-900">Date</label>
                <input
                  type="date"
                  id="date"
                  class="w-full sm:w-48 p-3 border border-gray-300 rounded-lg focus:ring-rose-200 focus:border-rose-600"
                  value={date()}
                  onInput={(e) => setDate(e.currentTarget.value)}
                />
              </div>
              <div class="flex space-x-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading()}
                  class="text-white bg-rose-700 hover:bg-rose-800 font-medium rounded-lg text-sm px-5 py-2.5"
                >
                  {loading()
                    ? (editingJournal ? "Updating..." : "Saving...")
                    : (editingJournal ? "Update Entry" : "Save Entry")}
                </button>
                <button
                  onClick={() => navigate('/journal')}
                  class="text-rose-700 border border-rose-700 hover:bg-rose-100 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalCreate;
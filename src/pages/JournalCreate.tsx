import { Component, createSignal, createEffect, onMount } from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";

const API_URL = "https://mindmate-be-production.up.railway.app/api/journals";


const JournalCreate: Component = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingJournal = (location.state && (location.state as { journal?: any }).journal) ? (location.state as { journal: any }).journal : null;

  const [title, setTitle] = createSignal(editingJournal?.title || "");
  const [content, setContent] = createSignal(editingJournal?.content || "");
  const [date, setDate] = createSignal(
    editingJournal
      ? (editingJournal.created_at.length === 10 && editingJournal.created_at.includes('-')
          ? (() => {
              // MM-DD-YYYY or YYYY-MM-DD
              const parts = editingJournal.created_at.split("-");
              if (parts[0].length === 4) {
                // YYYY-MM-DD
                return editingJournal.created_at;
              } else {
                // MM-DD-YYYY
                return `${parts[2]}-${parts[0]}-${parts[1]}`;
              }
            })()
          : editingJournal.created_at)
      : new Date().toISOString().split('T')[0]
  );
  const [error, setError] = createSignal("");
  const [isVisible, setIsVisible] = createSignal(false);
  const [loading, setLoading] = createSignal(false);

  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  });

  // If editing, update fields if location.state changes
  onMount(() => {
    if (editingJournal) {
      setTitle(editingJournal.title);
      setContent(editingJournal.content);
      // Already set above
    }
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
      let res;
      if (editingJournal) {
        // Update
        res = await fetch(`${API_URL}/${editingJournal.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title().trim(),
            content: content().trim(),
            created_at: date(),
          }),
        });
      } else {
        // Create
        res = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title().trim(),
            content: content().trim(),
            date: date(),
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
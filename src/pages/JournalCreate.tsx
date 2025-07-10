import { Component, createSignal, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";

// Temporary in-memory store for journal entries (shared with Journal page)
const journalStore = {
  entries: [
    { id: 1, title: 'A Productive Monday', date: '2025-06-24', preview: 'Today I managed to finish all my tasks and felt really accomplished...', mood: 4, content: 'Today I managed to finish all my tasks and felt really accomplished. The project deadline was met, and I even had time for a short walk in the evening.' },
    { id: 2, title: 'Weekend Reflections', date: '2025-06-23', preview: 'Spent time with family and friends. It was refreshing and helped me recharge...', mood: 5, content: 'Spent time with family and friends. It was refreshing and helped me recharge. We had a great barbecue and watched a movie together.' },
    { id: 3, title: 'Overcoming Challenges', date: '2025-06-22', preview: 'Had some difficulties at work but managed to find solutions...', mood: 3, content: 'Had some difficulties at work but managed to find solutions. The team collaborated well, and we resolved the issue before the end of the day.' }
  ],
  addEntry(entry: { id: number; title: string; date: string; preview: string; mood: number; content: string }) {
    this.entries.unshift(entry);
  }
};

const JournalCreate: Component = () => {
  const navigate = useNavigate();
  const [title, setTitle] = createSignal("");
  const [content, setContent] = createSignal("");
  const [mood, setMood] = createSignal<number | null>(null);
  const [date, setDate] = createSignal(new Date().toISOString().split('T')[0]);
  const [error, setError] = createSignal("");
  const [isVisible, setIsVisible] = createSignal(false);

  // Mood options matching Dashboard
  const moodOptions = [
    { emoji: '😢', label: 'Very Sad', color: 'bg-blue-500', value: 1 },
    { emoji: '😔', label: 'Sad', color: 'bg-blue-400', value: 2 },
    { emoji: '😐', label: 'Neutral', color: 'bg-gray-400', value: 3 },
    { emoji: '😊', label: 'Happy', color: 'bg-green-400', value: 4 },
    { emoji: '😄', label: 'Very Happy', color: 'bg-green-500', value: 5 }
  ];

  // Initialize visibility effect
  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  });

  // Handle form submission
  const handleSubmit = () => {
    if (!title().trim()) {
      setError("Title is required.");
      return;
    }
    if (!content().trim()) {
      setError("Content is required.");
      return;
    }
    if (mood() === null) {
      setError("Please select a mood.");
      return;
    }

    // Generate new journal entry
    const newEntry = {
      id: journalStore.entries.length + 1,
      title: title().trim(),
      date: date(),
      preview: content().trim().substring(0, 50) + (content().length > 50 ? '...' : ''),
      mood: mood()!,
      content: content().trim()
    };

    // Save to store
    journalStore.addEntry(newEntry);
    navigate('/journal');
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      {/* Main Content */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class={`transition-all duration-1000 ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 class="text-3xl md:text-4xl font-bold text-rose-700 mb-6">Create New Journal Entry</h1>

          {/* Error Alert */}
          {error() && (
            <div class="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200" role="alert">
              <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
              </svg>
              <span class="sr-only">Error</span>
              <div>{error()}</div>
            </div>
          )}

          {/* Journal Form */}
          <div class="max-w-full p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
            <div class="space-y-6">
              {/* Title Input */}
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

              {/* Content Textarea */}
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

              {/* Mood Selection */}
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-900">Mood</label>
                <div class="flex justify-between mb-4">
                  {moodOptions.map((moodOption) => (
                    <button
                      onClick={() => setMood(moodOption.value)}
                      class={`w-12 h-12 rounded-full hover:scale-110 transition-transform duration-200 flex items-center justify-center text-2xl hover:shadow-lg focus:ring-4 focus:ring-rose-200 ${mood() === moodOption.value ? moodOption.color : ''}`}
                      title={moodOption.label}
                    >
                      {moodOption.emoji}
                    </button>
                  ))}
                </div>
                {mood() !== null && (
                  <p class="text-green-600 font-medium">Selected: {moodOptions[mood()! - 1]?.label}</p>
                )}
              </div>

              {/* Date Input */}
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

              {/* Form Actions */}
              <div class="flex space-x-4">
                <button
                  onClick={handleSubmit}
                  class="text-white bg-rose-700 hover:bg-rose-800 font-medium rounded-lg text-sm px-5 py-2.5"
                >
                  Save Entry
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
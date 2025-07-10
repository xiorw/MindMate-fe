import { Component, createSignal, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";

const Journal: Component = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = createSignal("");
  const [filterMood, setFilterMood] = createSignal<number | null>(null);
  const [isVisible, setIsVisible] = createSignal(false);
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  const [selectedJournal, setSelectedJournal] = createSignal<any>(null);
  const [isPopupOpen, setIsPopupOpen] = createSignal(false);

  // Sample journal data with full content
  const [journalEntries, setJournalEntries] = createSignal([
    { 
      id: 1, 
      title: 'A Productive Monday', 
      date: '2025-06-24', 
      preview: 'Today I managed to finish all my tasks and felt really accomplished...', 
      mood: 4,
      content: `Today I managed to finish all my tasks and felt really accomplished. I started the day with a clear plan and managed to stick to it throughout the day. The morning was particularly productive as I tackled the most challenging tasks first while my energy was at its peak.

I completed the quarterly report that had been pending for weeks, finally organized my workspace which had been cluttered, and even had time to help a colleague with their project. The feeling of checking off items from my to-do list was incredibly satisfying.

What made today special was not just the productivity but the sense of control I felt over my day. I realized that proper planning and prioritization can make such a huge difference in how accomplished I feel at the end of the day.

I'm grateful for this productive start to the week and hope to carry this momentum forward into the rest of the week.`
    },
    { 
      id: 2, 
      title: 'Weekend Reflections', 
      date: '2025-06-23', 
      preview: 'Spent time with family and friends. It was refreshing and helped me recharge...', 
      mood: 5,
      content: `Spent time with family and friends this weekend. It was refreshing and helped me recharge after a busy week at work. We had a lovely barbecue in the backyard, and the weather was perfect for outdoor activities.

My siblings and I played some old board games that brought back so many childhood memories. We laughed until our stomachs hurt, and it reminded me how important it is to maintain these connections with the people who matter most.

Sunday was quieter but equally fulfilling. I took a long walk in the park, read a few chapters of a book I'd been meaning to finish, and just enjoyed the peaceful moments. There's something magical about slowing down and being present in the moment.

These weekends remind me that life isn't just about work and productivity - it's about relationships, joy, and taking time to appreciate the simple pleasures. I feel recharged and ready to tackle whatever the new week brings.`
    },
    { 
      id: 3, 
      title: 'Overcoming Challenges', 
      date: '2025-06-22', 
      preview: 'Had some difficulties at work but managed to find solutions...', 
      mood: 3,
      content: `Had some difficulties at work today but managed to find solutions through persistence and collaboration. The day started with a technical issue that seemed insurmountable at first, but breaking it down into smaller parts made it manageable.

I reached out to my team members for help, and their different perspectives were invaluable. Sometimes we get so focused on our own approach that we miss obvious solutions that are right in front of us. This experience reminded me of the importance of asking for help when needed.

The afternoon brought another challenge with a client meeting that didn't go as planned. However, I was able to turn it around by actively listening to their concerns and proposing alternative solutions. It wasn't perfect, but it was a learning experience.

By the end of the day, I felt proud of how I handled the challenges. Instead of getting frustrated or giving up, I persevered and found ways to move forward. These difficult days often teach us the most about ourselves and our capabilities.`
    }
  ]);

  // Mood options matching Dashboard
  const moodOptions = [
    { emoji: '😢', label: 'Very Sad', color: 'bg-blue-500', value: 1 },
    { emoji: '😔', label: 'Sad', color: 'bg-blue-400', value: 2 },
    { emoji: '😐', label: 'Neutral', color: 'bg-gray-400', value: 3 },
    { emoji: '😊', label: 'Happy', color: 'bg-green-400', value: 4 },
    { emoji: '😄', label: 'Very Happy', color: 'bg-green-500', value: 5 }
  ];

  // Filtered journal entries based on search and mood
  const filteredEntries = () => {
    return journalEntries().filter(entry => 
      entry.title.toLowerCase().includes(searchQuery().toLowerCase()) &&
      (filterMood() === null || entry.mood === filterMood())
    );
  };

  // Initialize visibility effect
  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  });

  // Handle body scroll lock when popup is open
  createEffect(() => {
    if (isPopupOpen()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  });

  // Function to open popup with selected journal
  const openJournalPopup = (journal: any) => {
    setSelectedJournal(journal);
    setIsPopupOpen(true);
  };

  // Function to close popup
  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedJournal(null);
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <style>
        {`
          .dropdown-icon {
            transition: transform 0.3s ease, color 0.3s ease;
          }
          .dropdown-icon.open {
            transform: rotate(180deg);
            color: #be123c; /* Tailwind's rose-700 */
          }
          .popup-overlay {
            backdrop-filter: blur(8px);
            transition: opacity 0.4s ease-in-out;
            opacity: 0;
          }
          .popup-overlay.open {
            opacity: 1;
          }
          .popup-content {
            max-height: 80vh;
            overflow-y: auto;
            transform: scale(0.8) translateY(20px);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .popup-content.open {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
          .popup-content::-webkit-scrollbar {
            width: 8px;
          }
          .popup-content::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .popup-content::-webkit-scrollbar-thumb {
            background: #be123c;
            border-radius: 10px;
          }
          .popup-content::-webkit-scrollbar-thumb:hover {
            background: #9f1239;
          }
        `}
      </style>
      
      {/* Main Content */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class={`transition-all duration-1000 ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 class="text-3xl md:text-4xl font-bold text-rose-700 mb-6">Journal Entries</h1>

          {/* Search and Filter Controls */}
          <div class="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
            <div class="w-full sm:w-auto">
              <input
                type="text"
                class="w-full sm:w-64 p-2 border border-gray-300 rounded-lg focus:ring-rose-200 focus:border-rose-700 focus:outline-none"
                placeholder="Search by title..."
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
              />
            </div>
            <div class="flex space-x-4">
              <div class="relative">
                <select
                  class="w-full sm:w-48 p-2 border border-gray-300 rounded-lg focus:ring-rose-200 focus:border-rose-700 focus:outline-none appearance-none pr-10 text-gray-500 focus:text-rose-700"
                  value={filterMood() || ''}
                  onChange={(e) => setFilterMood(e.currentTarget.value ? parseInt(e.currentTarget.value) : null)}
                  onFocus={() => setIsDropdownOpen(true)}
                  onBlur={() => setIsDropdownOpen(false)}
                >
                  <option value="">All Moods</option>
                  {moodOptions.map((mood) => (
                    <option value={mood.value}>{mood.label}</option>
                  ))}
                </select>
                <svg
                  class={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dropdown-icon ${isDropdownOpen() ? 'open' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <button
                onClick={() => navigate('/journal/create')}
                class="text-white bg-rose-700 hover:bg-rose-800 font-medium rounded-lg text-sm px-5 py-2.5"
              >
                New Entry
              </button>
            </div>
          </div>

          {/* Journal Entries Table */}
          <div class="max-w-full p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
            <h5 class="text-xl font-medium text-gray-900 mb-6">Your Journals</h5>
            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
              <table class="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3">Title</th>
                    <th scope="col" class="px-6 py-3">Date</th>
                    <th scope="col" class="px-6 py-3">Mood</th>
                    <th scope="col" class="px-6 py-3">Preview</th>
                    <th scope="col" class="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries().length > 0 ? (
                    filteredEntries().map((journal) => (
                      <tr class="bg-white/50 border-b hover:bg-gray-50 transition-colors">
                        <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {journal.title}
                        </th>
                        <td class="px-6 py-4">
                          {new Date(journal.date).toLocaleDateString()}
                        </td>
                        <td class="px-6 py-4">
                          <span class="text-lg">{moodOptions[journal.mood - 1]?.emoji}</span>
                          <span class="ml-2">{moodOptions[journal.mood - 1]?.label}</span>
                        </td>
                        <td class="px-6 py-4 max-w-xs truncate">
                          {journal.preview}
                        </td>
                        <td class="px-6 py-4">
                          <button
                            onClick={() => openJournalPopup(journal)}
                            class="font-medium text-rose-700 hover:underline hover:text-rose-900 transition-colors"
                          >
                            Read
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} class="px-6 py-4 text-center text-gray-500">
                        No journal entries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Journal Popup Modal */}
      {isPopupOpen() && selectedJournal() && (
        <div class={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 popup-overlay ${isPopupOpen() ? 'open' : ''}`}>
          <div class={`bg-white rounded-lg shadow-2xl max-w-4xl w-full popup-content ${isPopupOpen() ? 'open' : ''}`}>
            <div class="flex justify-between items-center p-6 border-b border-gray-200">
              <div class="flex items-center space-x-4">
                <h2 class="text-2xl font-bold text-gray-900">{selectedJournal().title}</h2>
                <div class="flex items-center space-x-2">
                  <span class="text-xl">{moodOptions[selectedJournal().mood - 1]?.emoji}</span>
                  <span class="text-sm text-gray-600">{moodOptions[selectedJournal().mood - 1]?.label}</span>
                </div>
              </div>
            </div>
            <div class="p-6">
              <div class="mb-4">
                <p class="text-sm text-gray-500 mb-2">Date: {new Date(selectedJournal().date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
              <div class="prose max-w-none">
                <div class="text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedJournal().content}
                </div>
              </div>
            </div>
            <div class="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closePopup}
                class="px-6 py-2 bg-rose-700 text-white rounded-lg hover:bg-rose-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Journal;
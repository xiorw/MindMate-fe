import { Component, createSignal, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";

// In-memory stores (shared with other components)
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

const moodStore = {
  entries: [
    { date: '2025-06-24', mood: 4, notes: 'Felt accomplished after a productive day.' },
    { date: '2025-06-23', mood: 5, notes: 'Really enjoyed the weekend with family.' },
    { date: '2025-06-22', mood: 3, notes: 'Challenging day but got through it.' }
  ],
  addEntry(entry: { date: string; mood: number; notes: string }) {
    this.entries.unshift(entry);
  }
};

const Calendar: Component = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = createSignal(new Date(2025, 5, 1)); // June 2025
  const [selectedDate, setSelectedDate] = createSignal<string | null>(null);
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

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate());
    const firstDay = getFirstDayOfMonth(currentDate());
    const days = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  // Get mood and journal entries for a specific date
  const getDayData = (dateStr: string) => {
    const mood = moodStore.entries.find(entry => entry.date === dateStr);
    const journals = journalStore.entries.filter(entry => entry.date === dateStr);
    return { mood, journals };
  };

  // Check if a day has data
  const hasData = (day: number) => {
    const dateStr = `${currentDate().getFullYear()}-${String(currentDate().getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return moodStore.entries.some(entry => entry.date === dateStr) || journalStore.entries.some(entry => entry.date === dateStr);
  };

  // Handle month navigation
  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate());
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      {/* Main Content */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class={`transition-all duration-1000 ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 class="text-3xl md:text-4xl font-bold text-rose-700 mb-6">Calendar</h1>

          {/* Calendar Controls */}
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-medium text-gray-900">
              {currentDate().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div class="flex space-x-4">
              <button
                onClick={() => changeMonth(-1)}
                class="text-gray-500 hover:text-rose-700 focus:ring-4 focus:outline-none focus:ring-rose-200 rounded-lg p-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <button
                onClick={() => changeMonth(1)}
                class="text-gray-500 hover:text-rose-700 focus:ring-4 focus:outline-none focus:ring-rose-200 rounded-lg p-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div class="max-w-full p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md mb-8">
            <div class="grid grid-cols-7 gap-2 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div class="text-sm font-medium text-gray-600">{day}</div>
              ))}
              {generateCalendarDays().map((day, index) => (
                <button
                  class={`p-2 rounded-full text-sm ${day ? (hasData(day) ? 'bg-rose-100 hover:bg-rose-200' : 'hover:bg-gray-100') : 'invisible'} ${selectedDate() === `${currentDate().getFullYear()}-${String(currentDate().getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` ? 'bg-rose-700 hover:bg-rose-800 text-white' : ''}`}
                  onClick={() => day && setSelectedDate(`${currentDate().getFullYear()}-${String(currentDate().getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
                  disabled={!day}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Date Details */}
          {selectedDate() && (
            <div class="max-w-full p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
              <h5 class="text-xl font-medium text-gray-900 mb-4">
                Details for {new Date(selectedDate()!).toLocaleDateString()}
              </h5>
              <div class="space-y-6">
                {/* Mood Details */}
                <div>
                  <h6 class="text-lg font-medium text-gray-800 mb-2">Mood</h6>
                  {getDayData(selectedDate()!).mood ? (
                    <div class="flex items-center space-x-3">
                      <span class="text-2xl">{moodOptions[getDayData(selectedDate()!).mood!.mood - 1]?.emoji}</span>
                      <span>{moodOptions[getDayData(selectedDate()!).mood!.mood - 1]?.label}</span>
                      <p class="text-sm text-gray-600">{getDayData(selectedDate()!).mood!.notes || 'No notes'}</p>
                    </div>
                  ) : (
                    <p class="text-sm text-gray-600">No mood recorded for this day.</p>
                  )}
                  <button
                    onClick={() => navigate('/mood-tracker')}
                    class="mt-2 text-sm text-rose-700 hover:underline"
                  >
                    Update Mood
                  </button>
                </div>

                {/* Journal Details */}
                <div>
                  <h6 class="text-lg font-medium text-gray-800 mb-2">Journal Entries</h6>
                  {getDayData(selectedDate()!).journals.length > 0 ? (
                    <div class="space-y-4">
                      {getDayData(selectedDate()!).journals.map(journal => (
                        <div class="p-4 bg-rose-50 rounded-lg">
                          <h6 class="font-medium text-gray-800">{journal.title}</h6>
                          <p class="text-sm text-gray-600">{journal.preview}</p>
                          <button
                            onClick={() => navigate(`/journal/${journal.id}`)}
                            class="mt-2 text-sm text-rose-700 hover:underline"
                          >
                            Read
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p class="text-sm text-gray-600">No journal entries for this day.</p>
                  )}
                  <button
                    onClick={() => navigate('/journal/create')}
                    class="mt-2 text-sm text-rose-700 hover:underline"
                  >
                    Add Journal Entry
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
import { Component, createSignal, createEffect } from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";

// Define types for navigation state
interface NavigationState {
  isEditing: boolean;
  editingMood: {
    id: number;
    date: string;
    mood: string;
    emoji: string;
    notes: string;
  };
  date: string;
}

const MOOD_API_URL = "http://127.0.0.1:8080/api/moods";
const JOURNAL_API_URL = "http://127.0.0.1:8080/api/journals";

const moodOptions = [
  { emoji: '😢', label: 'Very Sad', value: 1, stringValue: 'very sad', textColor: 'text-red-600' },
  { emoji: '😔', label: 'Sad', value: 2, stringValue: 'sad', textColor: 'text-orange-600' },
  { emoji: '😐', label: 'Neutral', value: 3, stringValue: 'neutral', textColor: 'text-yellow-600' },
  { emoji: '😊', label: 'Happy', value: 4, stringValue: 'happy', textColor: 'text-lime-600' },
  { emoji: '😄', label: 'Very Happy', value: 5, stringValue: 'very happy', textColor: 'text-green-600' }
];

function formatDateMMDDYYYY(date: Date) {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

function formatDateYYYYMMDD(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getMoodOptionByValue(moodValue: any) {
  // Handle both numeric and string mood values
  if (typeof moodValue === 'number') {
    return moodOptions.find(option => option.value === moodValue);
  } else if (typeof moodValue === 'string') {
    return moodOptions.find(option => option.stringValue === moodValue);
  }
  return null;
}

function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const Calendar: Component = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const today = new Date();
  const [currentDate, setCurrentDate] = createSignal(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = createSignal<string | null>(formatDateYYYYMMDD(today));
  const [isVisible, setIsVisible] = createSignal(false);
  const [moodMap, setMoodMap] = createSignal<Record<string, any>>({});
  const [journalMap, setJournalMap] = createSignal<Record<string, any[]>>({});
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  const fetchMonthData = async (date: Date) => {
    const startDate = formatDateMMDDYYYY(new Date(date.getFullYear(), date.getMonth(), 1));
    const endDate = formatDateMMDDYYYY(new Date(date.getFullYear(), date.getMonth() + 1, 0));

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const moodsRes = await fetch(`${MOOD_API_URL}/range?start_date=${startDate}&end_date=${endDate}`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const journalsRes = await fetch(`${JOURNAL_API_URL}/range?start_date=${startDate}&end_date=${endDate}`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!moodsRes.ok || !journalsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const moods = await moodsRes.json();
      const journals = await journalsRes.json();

      const moodByDate: Record<string, any> = {};
      (Array.isArray(moods) ? moods : []).forEach((mood: any) => {
        const d = new Date(mood.created_at);
        const dateKey = formatDateYYYYMMDD(d);
        moodByDate[dateKey] = mood;
      });

      const journalByDate: Record<string, any[]> = {};
      (Array.isArray(journals) ? journals : []).forEach((journal: any) => {
        const d = new Date(journal.created_at);
        const dateKey = formatDateYYYYMMDD(d);
        if (!journalByDate[dateKey]) journalByDate[dateKey] = [];
        journalByDate[dateKey].push(journal);
      });

      setMoodMap(moodByDate);
      setJournalMap(journalByDate);
      setError(null);
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    fetchMonthData(currentDate());
  });

  createEffect(() => {
    const cd = currentDate();
    const todayStr = formatDateYYYYMMDD(today);
    if (cd.getFullYear() === today.getFullYear() && cd.getMonth() === today.getMonth()) {
      setSelectedDate(todayStr);
    } else {
      setSelectedDate(formatDateYYYYMMDD(new Date(cd.getFullYear(), cd.getMonth(), 1)));
    }
  });

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate());
    const firstDay = getFirstDayOfMonth(currentDate());
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const getDayData = (dateStr: string) => ({
    mood: moodMap()[dateStr],
    journals: journalMap()[dateStr] || []
  });

  const hasData = (day: number) => {
    const date = new Date(currentDate().getFullYear(), currentDate().getMonth(), day);
    const dateStr = formatDateYYYYMMDD(date);
    return !!(moodMap()[dateStr] || (journalMap()[dateStr]?.length ?? 0) > 0);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate());
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const handleEditMood = (mood: any) => {
    // Navigate to mood page with editing state
    // Convert YYYY-MM-DD format to MM-DD-YYYY format expected by mood component
    const createdAtDate = new Date(mood.created_at);
    const formattedDate = formatDateMMDDYYYY(createdAtDate);
    
    // Create mood entry object with proper format for mood component
    const moodEntry = {
      id: mood.id,
      date: formatDateYYYYMMDD(createdAtDate), // YYYY-MM-DD format for date input
      mood: mood.mood,
      emoji: mood.emoji,
      notes: mood.notes || ""
    };
    
    navigate('/mood', { 
      state: { 
        isEditing: true,
        editingMood: moodEntry,
        date: formattedDate
      } as Partial<NavigationState>
    });
  };

  const handleAddMood = (dateStr: string) => {
    const [yyyy, mm, dd] = dateStr.split("-");
    navigate('/mood', { 
      state: { 
        date: `${mm}-${dd}-${yyyy}`
      } as Partial<NavigationState>
    });
  };

  const handleEditJournal = (journal: any) => {
    navigate('/journal/create', { 
      state: { 
        journal,
        date: formatDateMMDDYYYY(new Date(journal.created_at))
      } as any
    });
  };

  const handleAddJournal = (dateStr: string) => {
    const [yyyy, mm, dd] = dateStr.split("-");
    navigate('/journal/create', { 
      state: { 
        date: `${mm}-${dd}-${yyyy}`
      } as any
    });
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class={`transition-all duration-1000 ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl md:text-4xl font-bold text-rose-700">Calendar</h1>
            <div class="flex space-x-4">
              <button
                onClick={() => changeMonth(-1)}
                class="text-gray-500 hover:text-rose-700 focus:ring-4 focus:outline-none focus:ring-rose-200 rounded-lg p-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span class="text-xl font-medium text-gray-900">
                {currentDate().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => changeMonth(1)}
                class="text-gray-500 hover:text-rose-700 focus:ring-4 focus:outline-none focus:ring-rose-200 rounded-lg p-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {error() && (
            <div class="mb-4 p-4 text-sm text-red-800 bg-red-100 rounded-lg">
              {error()}
            </div>
          )}

          <div class="max-w-full p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md mb-8">
            <div class="grid grid-cols-7 gap-2 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div class="text-sm font-medium text-gray-600">{day}</div>
              ))}
              {generateCalendarDays().map((day) => {
                if (!day) return <div class="invisible p-2" />;
                
                const date = new Date(currentDate().getFullYear(), currentDate().getMonth(), day);
                const dateStr = formatDateYYYYMMDD(date);
                const isSelected = selectedDate() === dateStr;
                const hasDataForDay = hasData(day);

                return (
                  <button
                    class={`p-2 rounded-full text-sm transition-colors duration-150
                      ${hasDataForDay ? 'bg-rose-200 hover:bg-rose-300' : 'hover:bg-gray-100'}
                      ${isSelected ? 'bg-rose-700 hover:bg-rose-800 text-white' : ''}
                    `}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDate() && (
            <div class="max-w-full p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
              <h2 class="text-xl font-medium text-gray-900 mb-6 pl-4">
                Details for {new Date(selectedDate()!).toLocaleDateString()}
              </h2>
              
              {loading() ? (
                <div class="text-gray-600 pl-4">Loading...</div>
              ) : (
                <div class="space-y-6">
                  <div class="text-left pl-4">
                    <h3 class="text-lg font-medium text-gray-800 mb-3">Mood</h3>
                    {getDayData(selectedDate()!).mood ? (
                      <div>
                        <div class="p-4 bg-white border border-rose-700 rounded-lg mb-2">
                          <div class="flex items-start gap-3">
                            <div>
                              {(() => {
                                const mood = getDayData(selectedDate()!).mood;
                                // Get emoji from backend if available, otherwise use from moodOptions
                                const emoji = mood.emoji || getMoodOptionByValue(mood.mood)?.emoji || '😐';
                                // Get mood option for styling
                                const moodOption = getMoodOptionByValue(mood.mood);
                                // Format mood string: capitalize first letter
                                const moodString = typeof mood.mood === 'string' 
                                  ? capitalizeFirst(mood.mood)
                                  : moodOption?.label || 'Unknown';
                                const textColor = moodOption?.textColor || 'text-gray-600';
                                
                                return (
                                  <>
                                    <p class="text-sm text-gray-600 mb-2">
                                      <span class="font-medium">Mood:</span> <span class={textColor}>
                                        {emoji} {moodString}
                                      </span>
                                    </p>
                                    <p class="text-sm text-gray-600">
                                      <span class="font-medium">Notes:</span> {mood.notes || 'No notes'}
                                    </p>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleEditMood(getDayData(selectedDate()!).mood)}
                          class="text-sm text-rose-700 underline hover:text-rose-900 ml-4"
                        >
                          Update Mood
                        </button>
                      </div>
                    ) : (
                      <>
                        <p class="text-sm text-gray-600 mb-2 ml-4">No mood recorded for this day.</p>
                        <button
                          onClick={() => handleAddMood(selectedDate()!)}
                          class="text-sm text-rose-700 underline hover:text-rose-900 ml-4"
                        >
                          Add Mood
                        </button>
                      </>
                    )}
                  </div>

                  <div class="text-left pl-4">
                    <h3 class="text-lg font-medium text-gray-800 mb-3">Journal Entries</h3>
                    {getDayData(selectedDate()!).journals.length > 0 ? (
                      <div class="space-y-4 mb-3">
                        {getDayData(selectedDate()!).journals.map(journal => (
                          <div class="p-4 bg-white border border-rose-700 rounded-lg">
                            <h4 class="font-medium text-gray-800">{journal.title}</h4>
                            <p class="text-sm text-gray-600">
                              {journal.content.length > 80 
                                ? journal.content.slice(0, 80) + "..." 
                                : journal.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p class="text-sm text-gray-600 mb-3 ml-4">No journal entries for this day.</p>
                    )}
                    <div class="flex gap-4 ml-4">
                      <button
                        onClick={() => handleAddJournal(selectedDate()!)}
                        class="text-sm text-rose-700 underline hover:text-rose-900"
                      >
                        Add Journal
                      </button>
                      {getDayData(selectedDate()!).journals.length > 0 && (
                        <button
                          onClick={() => handleEditJournal(getDayData(selectedDate()!).journals[0])}
                          class="text-sm text-rose-700 underline hover:text-rose-900"
                        >
                          Update Journal
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
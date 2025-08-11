import { Component, createSignal, createEffect } from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";

// Define types for location state
interface LocationState {
  isEditing?: boolean;
  editingMood?: {
    id: number;
    date: string;
    mood: string;
    emoji: string;
    notes: string;
  };
  date?: string;
}

const API_URL = "http://127.0.0.1:8080/api/moods";

const moodOptions = [
  { emoji: '😢', label: 'Very Sad', value: 'very sad', textColor: 'text-red-600' },
  { emoji: '😔', label: 'Sad', value: 'sad', textColor: 'text-orange-600' },
  { emoji: '😐', label: 'Neutral', value: 'neutral', textColor: 'text-yellow-600' },
  { emoji: '😊', label: 'Happy', value: 'happy', textColor: 'text-lime-600' },
  { emoji: '😄', label: 'Very Happy', value: 'very happy', textColor: 'text-green-600' }
];

type MoodEntry = {
  id: number;
  date: string;
  mood: string;
  emoji: string;
  notes: string;
};

const Mood: Component = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentMood, setCurrentMood] = createSignal<string | null>(null);
  const [currentEmoji, setCurrentEmoji] = createSignal<string | null>(null);
  const [moodNotes, setMoodNotes] = createSignal("");
  const [moodDate, setMoodDate] = createSignal<string>(new Date().toISOString().slice(0, 10));
  const [moodHistory, setMoodHistory] = createSignal<MoodEntry[]>([]);
  const [isVisible, setIsVisible] = createSignal(false);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [popupMood, setPopupMood] = createSignal<MoodEntry | null>(null);
  const [editId, setEditId] = createSignal<number | null>(null);

  // Check if we're in editing mode from calendar navigation
  createEffect(() => {
    const state = location.state as LocationState | undefined;
    if (state?.isEditing && state?.editingMood) {
      const moodEntry = state.editingMood;
      setCurrentMood(moodEntry.mood);
      setCurrentEmoji(moodEntry.emoji);
      setMoodNotes(moodEntry.notes || "");
      setMoodDate(moodEntry.date); // Should be in YYYY-MM-DD format
      setEditId(moodEntry.id);
    } else if (state?.date) {
      // If just setting date from calendar (add mode)
      const [mm, dd, yyyy] = state.date.split("-");
      setMoodDate(`${yyyy}-${mm}-${dd}`);
    }
  });

  // Fetch mood history on mount
  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Belum login. Silakan login ulang.");
      setLoading(false);
      return;
    }

    fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch mood history");
        return res.json();
      })
      .then((data) => {
        setMoodHistory(Array.isArray(data) ? data : data.moods || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal mengambil data mood. Silakan login ulang.");
        setLoading(false);
      });
  });

  // Handle mood submission (create or update)
  const handleSubmitMood = async () => {
    if (currentMood() && currentEmoji()) {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Belum login. Silakan login ulang.");
        return;
      }
      try {
        let res;
        if (editId()) {
          // Update
          res = await fetch(`${API_URL}/${editId()}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
              date: moodDate(),
              mood: currentMood(),
              emoji: currentEmoji(),
              notes: moodNotes(),
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
              date: moodDate(),
              mood: currentMood(),
              emoji: currentEmoji(),
              notes: moodNotes(),
            }),
          });
        }
        if (!res.ok) {
          const result = await res.json();
          setError(result.message || "You can only submit one mood entry per day. Please try again tomorrow.");
          return;
        }
        const newEntry = await res.json();
        if (editId()) {
          setMoodHistory(moodHistory().map((entry) => entry.id === editId() ? newEntry : entry));
        } else {
          setMoodHistory([newEntry, ...moodHistory()]);
        }
        setCurrentMood(null);
        setCurrentEmoji(null);
        setMoodNotes("");
        setMoodDate(new Date().toISOString().slice(0, 10));
        setEditId(null);
        setError(null);
        
        // If we came from calendar, navigate back
        const state = location.state as LocationState | undefined;
        if (state?.isEditing) {
          navigate('/calendar');
        }
      } catch {
        setError("Gagal menyimpan mood. Silakan coba lagi.");
      }
    }
  };

  // Handle delete mood
  const handleDeleteMood = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Belum login. Silakan login ulang.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this mood entry?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        setError("Gagal menghapus mood.");
        return;
      }
      setMoodHistory(moodHistory().filter((entry) => entry.id !== id));
    } catch {
      setError("Gagal menghapus mood. Silakan coba lagi.");
    }
  };

  // Handle read more (show popup)
  const handleReadMore = (entry: MoodEntry) => {
    setPopupMood(entry);
  };

  // Handle close popup
  const handleClosePopup = () => {
    setPopupMood(null);
  };

  // Handle edit mood
  const handleEditMood = (entry: MoodEntry) => {
    setCurrentMood(entry.mood);
    setCurrentEmoji(entry.emoji);
    setMoodNotes(entry.notes);
    setMoodDate(entry.date);
    setEditId(entry.id);
    setPopupMood(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    setCurrentMood(null);
    setCurrentEmoji(null);
    setMoodNotes("");
    setMoodDate(new Date().toISOString().slice(0, 10));
    setEditId(null);
    
    // If we came from calendar, navigate back
    const state = location.state as LocationState | undefined;
    if (state?.isEditing) {
      navigate('/calendar');
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class={`transition-all duration-1000 ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl md:text-4xl font-bold text-rose-700">Mood Tracker</h1>
            {/* Back button when editing from calendar */}
            {(location.state as LocationState | undefined)?.isEditing && (
              <button
                onClick={() => navigate('/calendar')}
                class="text-gray-500 hover:text-rose-700 focus:ring-4 focus:outline-none focus:ring-rose-200 rounded-lg p-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span class="ml-2 text-sm">Back to Calendar</span>
              </button>
            )}
          </div>

          {/* Mood Selection Card */}
          <div class="max-w-full p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md mb-8">
            <h5 class="text-xl font-medium text-gray-900 mb-4">
              {editId() ? "Update your mood" : "How are you feeling today?"}
            </h5>
            {error() && <div class="text-rose-700 mb-2">{error()}</div>}
            {!currentMood() ? (
              <div class="space-y-4">
                <div class="flex justify-between">
                  {moodOptions.map((mood) => (
                    <button
                      onClick={() => { setCurrentMood(mood.value); setCurrentEmoji(mood.emoji); }}
                      class="w-12 h-12 rounded-full hover:scale-110 transition-transform duration-200 flex items-center justify-center text-2xl hover:shadow-lg focus:ring-4 focus:ring-rose-200"
                      title={mood.label}
                    >
                      {mood.emoji}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div class="space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label class="font-medium">Date:</label>
                  <input
                    type="date"
                    value={moodDate()}
                    max={new Date().toISOString().slice(0, 10)}
                    onInput={(e) => setMoodDate(e.currentTarget.value)}
                    class="border border-gray-300 rounded px-3 py-1 focus:ring-rose-700 focus:border-rose-700"
                  />
                </div>
                <p class={`font-medium ${moodOptions.find(m => m.value === currentMood())?.textColor}`}>
                  {currentEmoji()} Feeling {moodOptions.find(m => m.value === currentMood())?.label}
                </p>
                <textarea
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-rose-700 focus:border-rose-700 focus:outline-none"
                  rows={4}
                  placeholder="Add notes about your mood..."
                  value={moodNotes()}
                  onInput={(e) => setMoodNotes(e.currentTarget.value)}
                />
                <div class="flex space-x-3">
                  <button
                    onClick={handleSubmitMood}
                    class="text-white bg-rose-700 hover:bg-rose-800 font-medium rounded-lg text-sm px-5 py-2.5"
                  >
                    {editId() ? "Update Mood" : "Save Mood"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    class="text-rose-700 border border-rose-700 hover:bg-rose-100 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mood History */}
          <div class="max-w-full p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
            <h5 class="text-xl font-medium text-gray-900 mb-6">Mood History</h5>
            {loading() ? (
              <div class="text-gray-600">Loading...</div>
            ) : (
              <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table class="w-full text-sm text-left rtl:text-right text-gray-500">
                  <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-center">Date</th>
                      <th scope="col" class="px-6 py-3 text-center">Mood</th>
                      <th scope="col" class="px-6 py-3 text-center">Notes</th>
                      <th scope="col" class="px-6 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moodHistory().length > 0 ? (
                      moodHistory().map((entry) => (
                        <tr class="bg-white/50 border-b hover:bg-gray-50 transition-colors">
                          <td class="px-6 py-4 text-center">{entry.date}</td>
                          <td class="px-6 py-4 text-center">
                            <span class="text-lg">{entry.emoji}</span>
                            <span class={`ml-2 ${moodOptions.find(m => m.value === entry.mood)?.textColor}`}>
                              {moodOptions.find(m => m.value === entry.mood)?.label}
                            </span>
                          </td>
                          <td class="px-6 py-4 text-center max-w-xs truncate">
                            {entry.notes && entry.notes.length > 30
                              ? (
                                <>
                                  {entry.notes.slice(0, 30)}...
                                </>
                              )
                              : entry.notes
                            }
                          </td>
                          <td class="px-6 py-4 text-center flex justify-center gap-2">
                            <button
                              onClick={() => handleReadMore(entry)}
                              class="text-rose-700 border border-rose-700 hover:bg-rose-100 font-medium rounded-lg text-xs px-3 py-1.5 transition-colors"
                            >
                              Read More
                            </button>
                            <button
                              onClick={() => handleEditMood(entry)}
                              class="text-rose-700 border border-rose-700 hover:bg-rose-100 font-medium rounded-lg text-xs px-3 py-1.5 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMood(entry.id)}
                              class="text-white bg-rose-700 hover:bg-rose-800 font-medium rounded-lg text-xs px-3 py-1.5 transition-colors ml-2"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} class="px-6 py-4 text-center text-gray-500">
                          No mood entries found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popup for mood detail */}
      {popupMood() && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div class="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative">
            <button
              onClick={handleClosePopup}
              class="absolute top-3 right-3 text-gray-400 hover:text-rose-700"
              title="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div class="mb-4 flex items-center gap-3">
              <span class="text-3xl">{popupMood()!.emoji}</span>
              <span class={`text-lg font-semibold ${moodOptions.find(m => m.value === popupMood()!.mood)?.textColor}`}>
                {moodOptions.find(m => m.value === popupMood()!.mood)?.label}
              </span>
            </div>
            <div class="mb-2">
              <span class="font-medium">Date:</span> {popupMood()!.date}
            </div>
            <div class="mb-2">
              <span class="font-medium">Notes:</span>
              <div class="mt-1 whitespace-pre-line break-words">{popupMood()!.notes || '-'}</div>
            </div>
            <div class="flex justify-end mt-6 gap-2">
              <button
                onClick={() => handleEditMood(popupMood()!)}
                class="text-rose-700 border border-rose-700 hover:bg-rose-100 font-medium rounded-lg text-xs px-4 py-2 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mood;
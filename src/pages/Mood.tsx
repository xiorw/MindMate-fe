import { Component, createSignal, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";

const Mood: Component = () => {
  const navigate = useNavigate();
  const [currentMood, setCurrentMood] = createSignal<number | null>(null);
  const [moodNotes, setMoodNotes] = createSignal("");
  const [moodHistory, setMoodHistory] = createSignal<{ date: string; mood: number; notes: string }[]>([]);
  const [isVisible, setIsVisible] = createSignal(false);

  // Mood options matching Dashboard with added text color
  const moodOptions = [
    { emoji: '😢', label: 'Very Sad', color: 'bg-blue-500', textColor: 'text-red-600', value: 1 },
    { emoji: '😔', label: 'Sad', color: 'bg-blue-400', textColor: 'text-orange-600', value: 2 },
    { emoji: '😐', label: 'Neutral', color: 'bg-gray-400', textColor: 'text-yellow-600', value: 3 },
    { emoji: '😊', label: 'Happy', color: 'bg-green-400', textColor: 'text-lime-600', value: 4 },
    { emoji: '😄', label: 'Very Happy', color: 'bg-green-500', textColor: 'text-green-600', value: 5 }
  ];

  // Initialize visibility effect
  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  });

  // Handle mood submission
  const handleSubmitMood = () => {
    if (currentMood() !== null) {
      const newEntry = {
        date: new Date().toISOString(),
        mood: currentMood()!,
        notes: moodNotes()
      };
      setMoodHistory([newEntry, ...moodHistory()]);
      setCurrentMood(null);
      setMoodNotes("");
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      {/* Main Content */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class={`transition-all duration-1000 ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 class="text-3xl md:text-4xl font-bold text-rose-700 mb-6">Mood Tracker</h1>

          {/* Mood Selection Card */}
          <div class="max-w-full p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md mb-8">
            <h5 class="text-xl font-medium text-gray-900 mb-4">How are you feeling today?</h5>
            {!currentMood() ? (
              <div class="space-y-4">
                <div class="flex justify-between">
                  {moodOptions.map((mood) => (
                    <button
                      onClick={() => setCurrentMood(mood.value)}
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
                <p class={`font-medium ${moodOptions[currentMood()! - 1]?.textColor}`}>
                  Feeling {moodOptions[currentMood()! - 1]?.label}
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
                    Save Mood
                  </button>
                  <button
                    onClick={() => { setCurrentMood(null); setMoodNotes(""); }}
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
            
            {/* Mood History Table */}
            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
              <table class="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3">Date</th>
                    <th scope="col" class="px-6 py-3">Mood</th>
                    <th scope="col" class="px-6 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {moodHistory().length > 0 ? (
                    moodHistory().map((entry) => (
                      <tr class="bg-white/50 border-b hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-4">{new Date(entry.date).toLocaleDateString()}</td>
                        <td class="px-6 py-4">
                          <span class="text-lg">{moodOptions[entry.mood - 1]?.emoji}</span>
                          <span class={`ml-2 ${moodOptions[entry.mood - 1]?.textColor}`}>
                            {moodOptions[entry.mood - 1]?.label}
                          </span>
                        </td>
                        <td class="px-6 py-4 max-w-xs truncate">{entry.notes || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} class="px-6 py-4 text-center text-gray-500">
                        No mood entries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mood;
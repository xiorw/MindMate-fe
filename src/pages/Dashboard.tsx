import { Component, createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { useNavigate } from "@solidjs/router";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { userStore } from "../components/userStore";

const Dashboard: Component = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = createSignal(new Date());
  const [todayMood, setTodayMood] = createSignal<number | null>(null);
  const [isLoadingMood, setIsLoadingMood] = createSignal(false);
  const [isVisible, setIsVisible] = createSignal(false);
  let chartDiv: HTMLDivElement | undefined;
  let intervalId: number | undefined;

  // Initialize visibility effect
  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  });

  // Time update interval
  onMount(() => {
    intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
  });

  // Initialize AmCharts 5 for mood chart
  onMount(() => {
    if (chartDiv) {
      try {
        const root = am5.Root.new(chartDiv);
        root.setThemes([am5themes_Animated.default.new(root)]);

        const chart = root.container.children.push(
          am5xy.XYChart.new(root, {
            panX: false,
            panY: false,
            wheelX: "none",
            wheelY: "none",
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            paddingBottom: 0,
          })
        );

        const xAxis = chart.xAxes.push(
          am5xy.CategoryAxis.new(root, {
            categoryField: "day",
            renderer: am5xy.AxisRendererX.new(root, {
              minGridDistance: 30,
              cellStartLocation: 0.1,
              cellEndLocation: 0.9,
            }),
          })
        );

        const yAxis = chart.yAxes.push(
          am5xy.ValueAxis.new(root, {
            min: 0,
            max: 5,
            renderer: am5xy.AxisRendererY.new(root, {}),
          })
        );

        const series = chart.series.push(
          am5xy.ColumnSeries.new(root, {
            name: "Mood",
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: "mood",
            categoryXField: "day",
          })
        );

        const data = [
          { day: "Mon", mood: 4 },
          { day: "Tue", mood: 3 },
          { day: "Wed", mood: 5 },
          { day: "Thu", mood: 4 },
          { day: "Fri", mood: 2 },
          { day: "Sat", mood: 5 },
          { day: "Sun", mood: 4 },
        ];

        xAxis.data.setAll(data);
        series.data.setAll(data);

        series.set("fill", am5.color("#BE123C")); // rose-700
        series.columns.template.set("fill", am5.color("#BE123C")); // rose-700

        onCleanup(() => {
          if (root) root.dispose();
        });
      } catch (error) {
        console.error("Failed to initialize AmCharts:", error);
      }
    }
  });

  onCleanup(() => {
    if (intervalId) clearInterval(intervalId);
  });

  const moodOptions = [
    { emoji: '😢', label: 'Very Sad', color: 'bg-rose-400', value: 1, textColor: 'text-red-600' },
    { emoji: '😔', label: 'Sad', color: 'bg-rose-300', value: 2, textColor: 'text-orange-600' },
    { emoji: '😐', label: 'Neutral', color: 'bg-gray-400', value: 3, textColor: 'text-yellow-600' },
    { emoji: '😊', label: 'Happy', color: 'bg-rose-300', value: 4, textColor: 'text-lime-600' },
    { emoji: '😄', label: 'Very Happy', color: 'bg-rose-400', value: 5, textColor: 'text-green-600' }
  ];

  const recentJournals = [
    { id: 1, title: `${userStore.user.name}'s Productive Monday`, date: '2025-06-24', preview: `Today ${userStore.user.name} managed to finish all tasks and felt really accomplished...`, mood: 4 },
    { id: 2, title: `${userStore.user.name}'s Weekend Reflections`, date: '2025-06-23', preview: `${userStore.user.name} spent time with family and friends. It was refreshing...`, mood: 5 },
    { id: 3, title: `${userStore.user.name}'s Challenges`, date: '2025-06-22', preview: `${userStore.user.name} had some difficulties but found solutions...`, mood: 3 }
  ];

  const recommendations = [
    { icon: '🧘', title: 'Morning Meditation', description: '10-minute guided meditation to start your day', category: 'Mindfulness' },
    { icon: '🚶', title: 'Evening Walk', description: 'Take a peaceful walk in nature', category: 'Physical' },
    { icon: '📖', title: 'Gratitude Writing', description: 'Write down 3 things you\'re grateful for', category: 'Reflection' },
    { icon: '🎵', title: 'Calming Music', description: 'Listen to relaxing instrumental music', category: 'Relaxation' }
  ];

  const handleMoodSelect = (value: number) => {
    setIsLoadingMood(true);
    setTimeout(() => {
      setTodayMood(value);
      setIsLoadingMood(false);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div class="min-h-screen min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex flex-col">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div class={`transition-all duration-1000 ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div class="mb-8">
            <h1 class="text-3xl md:text-4xl font-bold text-rose-700 mb-2">
              Good Morning, {userStore.user.name}! 👋
            </h1>
            <p class="text-gray-600 text-lg">
              {formatDate(currentTime())} • {formatTime(currentTime())}
            </p>
            <p class="text-rose-800 font-medium mt-2">
              How are you feeling today?
            </p>
          </div>

          <div class="flex items-center p-4 mb-4 text-sm text-gray-800 rounded-lg bg-yellow-200 border border-gray-200" role="alert">
            <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
            </svg>
            <span class="sr-only">Info</span>
            <div>
              <span class="font-medium">Daily Tip:</span> Taking just 5 minutes for deep breathing can significantly improve your mood and reduce stress levels.
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="max-w-sm p-6 bg-white/80 border border-gray-200 rounded-lg shadow-lg backdrop-blur-xl hover:shadow-xl transition-all duration-300">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                  <div class="inline-flex items-center justify-center w-10 h-10 text-white bg-gradient-to-r from-green-400 to-green-500 rounded-lg">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h5 class="mb-1 text-lg font-medium text-gray-800">Today's Mood</h5>
                    <p class="text-sm text-gray-600">Track your feelings</p>
                  </div>
                </div>
                {todayMood() && <span class="text-3xl">{moodOptions[todayMood()! - 1]?.emoji}</span>}
              </div>

              {!todayMood() ? (
                <div class="space-y-3">
                  <p class="text-sm text-gray-600 mb-3">How do you feel right now?</p>
                  <div class="flex justify-between">
                    {moodOptions.map((mood) => (
                      <button
                        onClick={() => handleMoodSelect(mood.value)}
                        disabled={isLoadingMood()}
                        class={`w-10 h-10 rounded-full hover:scale-110 transition-transform duration-200 flex items-center justify-center text-xl hover:shadow-lg focus:ring-4 focus:ring-rose-200 ${
                          isLoadingMood() ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title={mood.label}
                      >
                        {isLoadingMood() ? (
                          <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="8" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          mood.emoji
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div class="space-y-3">
                  <p class={`${moodOptions[todayMood()! - 1]?.textColor} font-medium`}>
                    Feeling {moodOptions[todayMood()! - 1]?.label}
                  </p>
                  <button 
                    onClick={() => setTodayMood(null)}
                    class="text-sm text-gray-600 hover:text-rose-900 transition-colors"
                  >
                    Change mood
                  </button>
                </div>
              )}
            </div>

            <div class="max-w-sm p-6 bg-white/80 border border-gray-200 rounded-lg shadow-lg backdrop-blur-xl hover:shadow-xl transition-all duration-300">
              <div class="flex items-center mb-4">
                <div class="inline-flex items-center justify-center w-10 h-10 text-white bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1.293-5.707a1 1 0 011.414 0L8 8.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div class="ml-3">
                  <h5 class="mb-1 text-lg font-medium text-gray-800">Journal Streak</h5>
                  <p class="text-sm text-gray-600">Keep writing!</p>
                </div>
              </div>
              <div class="space-y-2">
                <div class="text-3xl font-bold text-orange-600">7 days</div>
                <p class="text-sm text-gray-600">You're on fire! 🔥</p>
              </div>
            </div>

            <div class="max-w-sm p-6 bg-white/80 border border-gray-200 rounded-lg shadow-lg backdrop-blur-xl hover:shadow-xl transition-all duration-300">
              <div class="flex items-center mb-4">
                <div class="inline-flex items-center justify-center w-10 h-10 text-white bg-gradient-to-r from-purple-400 to-purple-500 rounded-lg">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div class="ml-3">
                  <h5 class="mb-1 text-lg font-medium text-gray-800">Weekly Goal</h5>
                  <p class="text-sm text-gray-600">Progress tracking</p>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Mood tracking</span>
                  <span class="text-sm font-medium text-purple-700">6/7 days</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div class="bg-gradient-to-r from-purple-400 to-purple-500 h-2.5 rounded-full transition-all duration-500" style="width: 86%"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-8">
              <div class="max-w-full p-6 bg-white/80 border border-gray-200 rounded-lg shadow-lg backdrop-blur-xl">
                <div class="flex items-center justify-between mb-6">
                  <h5 class="text-xl font-medium text-gray-800">This Week's Mood</h5>
                  <button 
                    onClick={() => navigate('/statistics')}
                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-rose-700 hover:text-rose-900 focus:ring-4 focus:outline-none focus:ring-rose-200 rounded-lg"
                  >
                    View Details
                    <svg class="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                    </svg>
                  </button>
                </div>
                
                <div 
                  ref={chartDiv} 
                  class="w-full h-64 bg-gradient-to-br from-rose-100 to-rose-100 rounded-lg"
                ></div>
              </div>

              <div class="max-w-full p-6 bg-white/80 border border-gray-200 rounded-lg shadow-lg backdrop-blur-xl">
                <div class="flex items-center justify-between mb-6">
                  <h5 class="text-xl font-medium text-gray-800">Recent Journal Entries</h5>
                  <button 
                    onClick={() => navigate('/journal/create')}
                    class="text-white bg-rose-700 hover:shadow-lg hover:scale-105 focus:ring-4 focus:outline-none focus:ring-rose-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 transition-all duration-300"
                  >
                    New Entry
                  </button>
                </div>

                <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                  <table class="w-full text-sm text-left rtl:text-right text-gray-600">
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
                      {recentJournals.map((journal) => (
                        <tr class="bg-white/50 border-b hover:bg-gray-50 transition-colors">
                          <th scope="row" class="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">
                            {journal.title}
                          </th>
                          <td class="px-6 py-4">
                            {new Date(journal.date).toLocaleDateString()}
                          </td>
                          <td class="px-6 py-4">
                            <span class="text-lg">{moodOptions[journal.mood - 1]?.emoji}</span>
                          </td>
                          <td class="px-6 py-4 max-w-xs truncate">
                            {journal.preview}
                          </td>
                          <td class="px-6 py-4">
                            <button 
                              onClick={() => navigate(`/journal/${journal.id}`)}
                              class="font-medium text-rose-700 hover:text-rose-900 hover:underline"
                            >
                              Read
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="space-y-8">
              <div class="max-w-sm p-6 bg-white/80 border border-gray-200 rounded-lg shadow-lg backdrop-blur-xl">
                <h5 class="mb-6 text-xl font-medium text-gray-800">Recommended for You</h5>
                
                <div class="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div class="p-4 bg-gradient-to-r from-rose-100 to-rose-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer">
                      <div class="flex items-start space-x-3">
                        <div class="text-2xl">{rec.icon}</div>
                        <div class="flex-1">
                          <h6 class="font-medium text-gray-800 mb-1">{rec.title}</h6>
                          <p class="text-sm text-gray-600 mb-2">{rec.description}</p>
                          <span class="inline-flex items-center px-2 py-1 text-xs font-medium text-rose-700 bg-rose-100 rounded-full">
                            {rec.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div class="max-w-sm p-6 bg-white/80 border border-gray-200 rounded-lg shadow-lg backdrop-blur-xl">
                <h5 class="mb-6 text-xl font-medium text-gray-800">Quick Actions</h5>
                
                <div class="space-y-3">
                  <button 
                    onClick={() => navigate('/journal/create')}
                    class="w-full text-white bg-rose-700 hover:shadow-lg hover:scale-105 focus:ring-4 focus:outline-none focus:ring-rose-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-all duration-300"
                  >
                    Add Journal Entry
                  </button>
                  
                  <button 
                    onClick={() => navigate('/mood')}
                    class="w-full py-2.5 px-5 text-sm font-medium text-rose-700 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-rose-100 hover:text-rose-900 focus:z-10 focus:ring-4 focus:ring-rose-200"
                  >
                    Update Mood
                  </button>
                  
                  <button 
                    onClick={() => navigate('/statistics')}
                    class="w-full py-2.5 px-5 text-sm font-medium text-rose-700 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-rose-100 hover:text-rose-900 focus:z-10 focus:ring-4 focus:ring-rose-200"
                  >
                    View Statistics
                  </button>
                </div>
              </div>

              <div class="max-w-sm p-6 bg-gradient-to-r from-rose-700 to-rose-800 rounded-lg shadow-lg text-white">
                <div class="text-center">
                  <div class="text-4xl mb-4">💪</div>
                  <h5 class="mb-2 text-lg font-medium">Daily Motivation</h5>
                  <p class="text-rose-100 italic text-sm leading-relaxed">
                    "Every small step you take towards better mental health is a victory worth celebrating."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import { Component, createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const API_URL_MOODS = "http://127.0.0.1:8080/api/moods";
const API_URL_JOURNALS = "http://127.0.0.1:8080/api/journals";
const API_URL_PROFILE = "http://127.0.0.1:8080/api/user/profile";

type MoodEntry = {
  id: number;
  date: string;
  mood: string;
  emoji: string;
  notes: string;
};

type JournalEntry = {
  id: number;
  title: string;
  content: string;
  created_at: string;
};

type UserProfile = {
  username: string;
  email: string;
};

// Daily motivational quotes that rotate based on day of year
const dailyQuotes = [
  {
    text: "You don't have to control your thoughts. You just have to stop letting them control you.",
    author: "Dan Millman"
  },
  {
    text: "Take your time healing, as long as you want. Nobody else knows what you've been through.",
    author: "Abertoli"
  },
  {
    text: "One small crack does not mean that you are broken, it means that you were put to the test and you didn't fall apart.",
    author: "Linda Poindexter"
  },
  {
    text: "There is hope, even when your brain tells you there isn't.",
    author: "John Green"
  },
  {
    text: "Recovery is not one and done. It is a lifelong journey that takes place one day, one step at a time.",
    author: "Unknown"
  },
  {
    text: "Self-care is how you take your power back.",
    author: "Lalah Delia"
  },
  {
    text: "My dark days made me strong. Or maybe I already was strong, and they made me prove it.",
    author: "Emery Lord"
  },
  {
    text: "You can't control everything. Sometimes you just need to relax and have faith that things will work out.",
    author: "Kody Keplinger"
  },
  {
    text: "Your illness is not your identity. Your chemistry is not your character.",
    author: "Rick Warren"
  },
  {
    text: "Happiness can be found even in the darkest of times, if one only remembers to turn on the light.",
    author: "Albus Dumbledore"
  },
  {
    text: "You, yourself, as much as anybody in the entire universe, deserve your love and affection.",
    author: "Buddha"
  },
  {
    text: "Emotional pain is not something that should be hidden away and never spoken about.",
    author: "Steven Aitchison"
  },
  {
    text: "Out of suffering have emerged the strongest souls; the most massive characters are seared with scars.",
    author: "Kahlil Gibran"
  },
  {
    text: "Let your story go. Allow yourself to be present with who you are right now.",
    author: "Russ Kyle"
  },
  {
    text: "Sometimes you climb out of bed in the morning and you think, I'm not going to make it, but you laugh inside.",
    author: "Charles Bukowski"
  },
  {
    text: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.",
    author: "Noam Shpancer"
  },
  {
    text: "Healing isn't about erasing your scars or forgetting painful memories. It's about no longer allowing them to control your life.",
    author: "Kiana Azizian"
  },
  {
    text: "You are braver than you believe, stronger than you seem, and smarter than you think.",
    author: "A.A. Milne"
  },
  {
    text: "The strongest people are not those who show strength in front of us, but those who win battles we know nothing about.",
    author: "Unknown"
  },
  {
    text: "Your present circumstances don't determine where you can go; they merely determine where you start.",
    author: "Nido Qubein"
  }
];

const Dashboard: Component = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = createSignal(new Date());
  const [todayMood, setTodayMood] = createSignal<MoodEntry | null>(null);
  const [isLoadingMood, setIsLoadingMood] = createSignal(false);
  const [isVisible, setIsVisible] = createSignal(false);
  const [moodHistory, setMoodHistory] = createSignal<MoodEntry[]>([]);
  const [recentJournals, setRecentJournals] = createSignal<JournalEntry[]>([]);
  const [journalStreak, setJournalStreak] = createSignal(0);
  const [weeklyProgress, setWeeklyProgress] = createSignal(0);
  const [weeklyDaysCount, setWeeklyDaysCount] = createSignal(0);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [user, setUser] = createSignal<UserProfile | null>(null);
  
  let chartDiv: HTMLDivElement | undefined;
  let intervalId: number | undefined;

  // Handle token dari URL parameter (hasil redirect Google OAuth)
  onMount(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get("token");
    const welcome = urlParams.get("welcome");
    
    if (token) {
      // Simpan token ke localStorage
      localStorage.setItem("token", token);
      
      // Clean up URL tanpa reload page
      const cleanUrl = welcome === "1" 
        ? "/dashboard?welcome=1" 
        : "/dashboard";
      window.history.replaceState({}, document.title, cleanUrl);
    } else {
      // Cek apakah ada token di localStorage
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        // Redirect ke login jika tidak ada token
        navigate("/login");
        return;
      }
    }
  });

  // Helper function to get Monday of current week
  const getMondayOfCurrentWeek = (date: Date = new Date()) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(date);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  // Helper function to get Sunday of current week
  const getSundayOfCurrentWeek = (date: Date = new Date()) => {
    const monday = getMondayOfCurrentWeek(date);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return sunday;
  };

  // Helper function to check if a date is in current week (Monday-Sunday)
  const isInCurrentWeek = (dateStr: string) => {
    let checkDate: Date;
    
    // Handle mm-dd-yyyy format
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [mm, dd, yyyy] = dateStr.split('-');
      checkDate = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
    } else {
      checkDate = new Date(dateStr);
    }
    
    const mondayOfWeek = getMondayOfCurrentWeek();
    const sundayOfWeek = getSundayOfCurrentWeek();
    
    return checkDate >= mondayOfWeek && checkDate <= sundayOfWeek;
  };

  // Calculate weekly progress for current week (Monday-Sunday)
  const calculateWeeklyProgress = (moods: MoodEntry[]) => {
    const currentWeekMoods = moods.filter(mood => isInCurrentWeek(mood.date));
    setWeeklyDaysCount(currentWeekMoods.length);
    setWeeklyProgress(Math.round((currentWeekMoods.length / 7) * 100));
  };

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

  // Fetch data from backend
  createEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Belum login. Silakan login ulang.");
      setLoading(false);
      navigate("/login");
      return;
    }

    // Fetch user profile data
    fetch(API_URL_PROFILE, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      }
    })
    .then(async (res) => {
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch user profile");
      }
      return res.json();
    })
    .then((data) => {
      if (data) {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      }
    })
    .catch((err) => {
      console.error("Failed to fetch user profile:", err);
      setError("Gagal mengambil data user.");
    });

    // Fetch mood data
    fetch(API_URL_MOODS, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      }
    })
    .then(async (res) => {
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch moods");
      }
      return res.json();
    })
    .then((data) => {
      if (data) {
        const moods = Array.isArray(data) ? data : data.moods || [];
        setMoodHistory(moods);
        
        // Check for today's mood - format as mm-dd-yyyy
        const today = new Date();
        const todayFormatted = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}-${today.getFullYear()}`;
        const todaysMood = moods.find((mood: MoodEntry) => mood.date === todayFormatted);
        if (todaysMood) {
          setTodayMood(todaysMood);
        }

        // Calculate weekly progress for current week (Monday-Sunday)
        calculateWeeklyProgress(moods);
      }
    })
    .catch((err) => {
      console.error("Failed to fetch moods:", err);
      setError("Gagal mengambil data mood.");
    });

    // Fetch journal data
    fetch(API_URL_JOURNALS, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      }
    })
    .then(async (res) => {
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch journals");
      }
      return res.json();
    })
    .then((data) => {
      if (data) {
        const journals = Array.isArray(data) ? data : data.journals || [];
        setRecentJournals(journals.slice(0, 3)); // Get latest 3 journals
        
        // Calculate journal streak
        calculateJournalStreak(journals);
        setLoading(false);
      }
    })
    .catch((err) => {
      console.error("Failed to fetch journals:", err);
      setError("Gagal mengambil data journal.");
      setLoading(false);
    });
  });

  // Calculate journal writing streak
  const calculateJournalStreak = (journals: JournalEntry[]) => {
    if (journals.length === 0) {
      setJournalStreak(0);
      return;
    }

    // Sort journals by date (newest first)
    const sortedJournals = journals.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const journal of sortedJournals) {
      const journalDate = new Date(journal.created_at);
      journalDate.setHours(0, 0, 0, 0);

      const diffTime = currentDate.getTime() - journalDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === streak || (streak === 0 && diffDays === 0)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    setJournalStreak(streak);
  };

  // Chart variables
  let chartRoot: am5.Root | undefined;
  let chartSeries: am5xy.ColumnSeries | undefined;
  let xAxis: am5xy.CategoryAxis<am5xy.AxisRenderer> | undefined;

  // Generate chart data for the last 7 days
  const generateWeekChartData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      // Format as mm-dd-yyyy
      const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${date.getFullYear()}`;
      const dayName = days[date.getDay()];

      const moodEntry = moodHistory().find(mood => mood.date === dateStr);
      const moodValue = moodEntry ? getMoodValue(moodEntry.mood) : null; // Use null for missing data

      data.push({
        day: dayName,
        mood: moodValue
      });
    }

    return data;
  };

  // Convert mood string to numeric value for chart
  const getMoodValue = (mood: string) => {
    const moodMap: { [key: string]: number } = {
      'very sad': 1,
      'sad': 2,
      'neutral': 3,
      'happy': 4,
      'very happy': 5
    };
    return moodMap[mood] || 0;
  };

  // Initialize AmCharts 5 for mood chart
  const initializeMoodChart = () => {
    if (!chartDiv) {
      console.log("chartDiv not found");
      return;
    }

    try {
      // Dispose existing chart
      if (chartRoot) {
        chartRoot.dispose();
        chartRoot = undefined;
        chartSeries = undefined;
        xAxis = undefined;
      }

      console.log("Initializing mood chart...");
      
      chartRoot = am5.Root.new(chartDiv);
      chartRoot.setThemes([am5themes_Animated.default.new(chartRoot)]);

      const chart = chartRoot.container.children.push(
        am5xy.XYChart.new(chartRoot, {
          panX: false,
          panY: false,
          wheelX: "none",
          wheelY: "none",
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 20,
          paddingBottom: 20,
        })
      );

      // Create renderers
      const xRenderer = am5xy.AxisRendererX.new(chartRoot, {
        minGridDistance: 30,
        cellStartLocation: 0.1,
        cellEndLocation: 0.9,
      });
      
      const yRenderer = am5xy.AxisRendererY.new(chartRoot, {});
      
      // Configure grid appearance
      xRenderer.grid.template.setAll({
        strokeOpacity: 0.1
      });
      
      yRenderer.grid.template.setAll({
        strokeOpacity: 0.1
      });

      // Create axes
      xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(chartRoot, {
          categoryField: "day",
          renderer: xRenderer
        })
      );

      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(chartRoot, {
          min: 1,
          max: 5,
          strictMinMax: true,
          renderer: yRenderer
        })
      );

      // Create series
      chartSeries = chart.series.push(
        am5xy.ColumnSeries.new(chartRoot, {
          name: "Mood",
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "mood",
          categoryXField: "day",
        })
      );

      chartSeries.set("fill", am5.color("#BE123C")); // rose-700
      chartSeries.columns.template.set("fill", am5.color("#BE123C")); // rose-700

      // Add tooltips
      chartSeries.set("tooltip", am5.Tooltip.new(chartRoot, {
        labelText: "Mood: {valueY}\nDay: {categoryX}"
      }));

      console.log("Mood chart initialized successfully");
      
      // Update with current data if available
      updateMoodChart();
      
    } catch (error) {
      console.error("Failed to initialize Mood Chart:", error);
    }
  };

  // Update mood chart with data from backend
  const updateMoodChart = () => {
    if (!chartSeries || !xAxis) {
      console.log("Chart not initialized yet");
      return;
    }

    try {
      console.log("Updating mood chart with mood history:", moodHistory().length, "entries");
      
      const weekData = generateWeekChartData();
      console.log("Generated week data:", weekData);
      
      xAxis.data.setAll(weekData);
      chartSeries.data.setAll(weekData);
      
    } catch (error) {
      console.error("Failed to update mood chart:", error);
    }
  };

  // Initialize chart when component mounts
  onMount(() => {
    setTimeout(() => {
      initializeMoodChart();
    }, 200);
  });

  // Update chart when mood history changes
  createEffect(() => {
    const moods = moodHistory();
    if (moods.length >= 0) { // Update even with 0 length to show empty chart
      updateMoodChart();
      // Recalculate weekly progress when mood history changes
      calculateWeeklyProgress(moods);
    }
  });

  onCleanup(() => {
    if (intervalId) clearInterval(intervalId);
  });

  const moodOptions = [
    { emoji: '😢', label: 'Very Sad', color: 'bg-rose-400', value: 'very sad', textColor: 'text-red-600' },
    { emoji: '😔', label: 'Sad', color: 'bg-rose-300', value: 'sad', textColor: 'text-orange-600' },
    { emoji: '😐', label: 'Neutral', color: 'bg-gray-400', value: 'neutral', textColor: 'text-yellow-600' },
    { emoji: '😊', label: 'Happy', color: 'bg-rose-300', value: 'happy', textColor: 'text-lime-600' },
    { emoji: '😄', label: 'Very Happy', color: 'bg-rose-400', value: 'very happy', textColor: 'text-green-600' }
  ];

  const handleMoodSelect = async (moodData: typeof moodOptions[0]) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Belum login. Silakan login ulang.");
      navigate("/login");
      return;
    }

    setIsLoadingMood(true);
    try {
      const res = await fetch(API_URL_MOODS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: (() => {
            const today = new Date();
            return `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}-${today.getFullYear()}`;
          })(),
          mood: moodData.value,
          emoji: moodData.emoji,
          notes: "",
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }
        const result = await res.json();
        setError(result.message || "You can only submit one mood entry per day.");
        setIsLoadingMood(false);
        return;
      }

      const newMood = await res.json();
      setTodayMood(newMood);
      const updatedMoodHistory = [newMood, ...moodHistory().filter(m => m.date !== newMood.date)];
      setMoodHistory(updatedMoodHistory);
      // Recalculate weekly progress with new mood
      calculateWeeklyProgress(updatedMoodHistory);
      setError(null);
    } catch {
      setError("Gagal menyimpan mood. Silakan coba lagi.");
    }
    setIsLoadingMood(false);
  };

  // Clean up chart on unmount
  onCleanup(() => {
    if (chartRoot) {
      chartRoot.dispose();
    }
    if (intervalId) clearInterval(intervalId);
  });

  // Get daily quote based on day of year
  const getDailyQuote = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return dailyQuotes[dayOfYear % dailyQuotes.length];
  };

  // Get dynamic streak message based on streak count
  const getStreakMessage = () => {
    const streak = journalStreak();
    if (streak === 0) return "Start your journey! ✨";
    if (streak === 1) return "Great start! 🌱";
    if (streak <= 3) return "Building momentum! 💪";
    if (streak <= 7) return "You're doing great! 🌟";
    if (streak <= 14) return "Two weeks strong! 🔥";
    if (streak <= 30) return "Incredible consistency! 🚀";
    if (streak <= 60) return "Absolutely amazing! 🏆";
    return "You're a legend! 👑";
  };

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = currentTime().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Get current week range display
  const getCurrentWeekRange = () => {
    const monday = getMondayOfCurrentWeek();
    const sunday = getSundayOfCurrentWeek();
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const mondayStr = monday.toLocaleDateString('en-US', options);
    const sundayStr = sunday.toLocaleDateString('en-US', options);
    
    return `${mondayStr} - ${sundayStr}`;
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

  const formatJournalDate = (dateStr: string) => {
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [mm, dd, yyyy] = dateStr.split('-');
      return `${mm}/${dd}/${yyyy}`;
    }
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex flex-col">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div class={`transition-all duration-1000 ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div class="mb-8">
            <h1 class="text-3xl md:text-4xl font-bold text-rose-700 mb-2">
              {getTimeBasedGreeting()}, {user()?.username || 'User'}! 👋
            </h1>
            <p class="text-gray-600 text-lg">
              {formatDate(currentTime())} • {formatTime(currentTime())}
            </p>
            <p class="text-rose-800 font-medium mt-2">
              How are you feeling today?
            </p>
          </div>

          {new URLSearchParams(location.search).get("welcome") === "1" && (
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              Welcome to MindMate! Your account has been created successfully.
            </div>
          )}

          {error() && (
            <div class="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200" role="alert">
              <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
              </svg>
              <span class="sr-only">Error</span>
              <div>{error()}</div>
            </div>
          )}

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Today's Mood Card */}
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
                {todayMood() && <span class="text-3xl">{todayMood()!.emoji}</span>}
              </div>

              {!todayMood() ? (
                <div class="space-y-3">
                  <div class="text-center py-4">
                    <p class="text-gray-600 mb-3">You haven't added your mood today</p>
                  </div>
                </div>
              ) : (
                <div class="space-y-3">
                  <p class={`${moodOptions.find(m => m.value === todayMood()!.mood)?.textColor} font-medium`}>
                    Feeling {moodOptions.find(m => m.value === todayMood()!.mood)?.label}
                  </p>
                  {todayMood()!.notes && (
                    <p class="text-sm text-gray-600 italic">"{todayMood()!.notes}"</p>
                  )}
                </div>
              )}
            </div>

            {/* Journal Streak Card */}
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
                <div class="text-3xl font-bold text-orange-600">{journalStreak()} days</div>
                <p class="text-sm text-gray-600">
                  {getStreakMessage()}
                </p>
              </div>
            </div>

            {/* Weekly Goal Card */}
            <div class="max-w-sm p-6 bg-white/80 border border-gray-200 rounded-lg shadow-lg backdrop-blur-xl hover:shadow-xl transition-all duration-300">
              <div class="flex items-center mb-4">
                <div class="inline-flex items-center justify-center w-10 h-10 text-white bg-gradient-to-r from-purple-400 to-purple-500 rounded-lg">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div class="ml-3">
                  <h5 class="mb-1 text-lg font-medium text-gray-800">Weekly Goal</h5>
                  <p class="text-sm text-gray-600">{getCurrentWeekRange()}</p>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Mood tracking</span>
                  <span class="text-sm font-medium text-purple-700">{weeklyDaysCount()}/7 days</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div class="bg-gradient-to-r from-purple-400 to-purple-500 h-2.5 rounded-full transition-all duration-500" style={`width: ${weeklyProgress()}%`}></div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-8">
              {/* Mood Chart */}
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

              {/* Recent Journal Entries */}
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

                {loading() ? (
                  <div class="text-gray-600">Loading...</div>
                ) : (
                  <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table class="w-full text-sm text-left rtl:text-right text-gray-600">
                      <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" class="px-6 py-3">Title</th>
                          <th scope="col" class="px-6 py-3">Date</th>
                          <th scope="col" class="px-6 py-3">Preview</th>
                          <th scope="col" class="px-6 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentJournals().length > 0 ? (
                          recentJournals().map((journal) => (
                            <tr class="bg-white/50 border-b hover:bg-gray-50 transition-colors">
                              <th scope="row" class="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">
                                {journal.title}
                              </th>
                              <td class="px-6 py-4">
                                {formatJournalDate(journal.created_at)}
                              </td>
                              <td class="px-6 py-4 max-w-xs truncate">
                                {journal.content.length > 50 ? journal.content.slice(0, 50) + "..." : journal.content}
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
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} class="px-6 py-4 text-center text-gray-500">
                              No journal entries found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div class="space-y-8">
              {/* Quick Actions */}
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
                    Add Mood
                  </button>
                  
                  <button 
                    onClick={() => navigate('/statistics')}
                    class="w-full py-2.5 px-5 text-sm font-medium text-rose-700 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-rose-100 hover:text-rose-900 focus:z-10 focus:ring-4 focus:ring-rose-200"
                  >
                    View Statistics
                  </button>

                  <button 
                    onClick={() => navigate('/calendar')}
                    class="w-full py-2.5 px-5 text-sm font-medium text-rose-700 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-rose-100 hover:text-rose-900 focus:z-10 focus:ring-4 focus:ring-rose-200"
                  >
                    View Calendar
                  </button>
                </div>
              </div>

              {/* Daily Motivation */}
              <div class="max-w-sm p-6 bg-gradient-to-r from-rose-700 to-rose-800 rounded-lg shadow-lg text-white">
                <div class="text-center">
                  <div class="text-4xl mb-4">💪</div>
                  <h5 class="mb-4 text-lg font-medium">Daily Motivation</h5>
                  <blockquote class="text-rose-100 italic text-sm leading-relaxed mb-3">
                    "{getDailyQuote().text}"
                  </blockquote>
                  <cite class="text-rose-200 text-xs font-medium">
                    — {getDailyQuote().author}
                  </cite>
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
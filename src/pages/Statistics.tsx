import { Component, createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { useNavigate } from "@solidjs/router";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5pie from "@amcharts/amcharts5/percent";
import * as am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

// API URLs
const MOOD_API_URL = "http://127.0.0.1:8080/api/moods";
const JOURNAL_API_URL = "http://127.0.0.1:8080/api/journals";

// Types
interface MoodEntry {
  id: number;
  mood: string | number;
  emoji: string;
  notes: string;
  created_at: string;
}

interface JournalEntry {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

const Statistics: Component = () => {
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = createSignal("30d"); // Default: last 30 days
  const [isVisible, setIsVisible] = createSignal(false);
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  const [hasMoodData, setHasMoodData] = createSignal(true); // Track if mood data exists
  const [allMoodEntries, setAllMoodEntries] = createSignal<MoodEntry[]>([]);
  const [allJournalEntries, setAllJournalEntries] = createSignal<JournalEntry[]>([]);
  const [moodEntries, setMoodEntries] = createSignal<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = createSignal<JournalEntry[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  
  // Chart references
  let moodTrendChartDiv: HTMLDivElement | undefined;
  let moodDistributionChartDiv: HTMLDivElement | undefined;
  let moodTrendRoot: am5.Root | undefined;
  let moodDistributionRoot: am5.Root | undefined;
  let moodTrendSeries: am5xy.LineSeries | undefined;
  let moodDistributionSeries: am5pie.PieSeries | undefined;

  // Mood options matching Dashboard with distinct rose colors from rose-400 to rose-900
  const moodOptions = [
    { emoji: '😢', label: 'Very Sad', color: '#9f1239', value: 1, stringValue: 'very sad' }, // rose-800
    { emoji: '😔', label: 'Sad', color: '#be123c', value: 2, stringValue: 'sad' }, // rose-700
    { emoji: '😐', label: 'Neutral', color: '#e11d48', value: 3, stringValue: 'neutral' }, // rose-600
    { emoji: '😊', label: 'Happy', color: '#f43f5e', value: 4, stringValue: 'happy' }, // rose-500
    { emoji: '😄', label: 'Very Happy', color: '#fb7185', value: 5, stringValue: 'very happy' } // rose-400
  ];

  // Helper functions
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

  function getMoodValue(moodValue: any): number {
    if (typeof moodValue === 'number') {
      return moodValue;
    } else if (typeof moodValue === 'string') {
      const option = moodOptions.find(option => option.stringValue === moodValue);
      return option?.value || 3;
    }
    return 3;
  }

  // Function to filter data based on time period
  const filterDataByTimePeriod = (data: any[]) => {
    const today = new Date();
    const currentPeriod = timePeriod();
    
    if (currentPeriod === "all") {
      return data; // Return all data
    }

    let cutoffDate: Date;
    if (currentPeriod === "7d") {
      cutoffDate = new Date();
      cutoffDate.setDate(today.getDate() - 7);
    } else if (currentPeriod === "30d") {
      cutoffDate = new Date();
      cutoffDate.setDate(today.getDate() - 30);
    } else {
      return data; // Fallback to all data
    }

    return data.filter(entry => {
      const entryDate = new Date(entry.created_at);
      return entryDate >= cutoffDate;
    });
  };

  // Fetch data from backend with improved error handling
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required");
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data once for better performance
      const today = new Date();
      const yearAgo = new Date();
      yearAgo.setFullYear(today.getFullYear() - 1);
      
      const startDate = formatDateMMDDYYYY(yearAgo);
      const endDate = formatDateMMDDYYYY(today);

      // Fetch moods and journals concurrently
      const [moodsRes, journalsRes] = await Promise.all([
        fetch(`${MOOD_API_URL}/range?start_date=${startDate}&end_date=${endDate}`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }),
        fetch(`${JOURNAL_API_URL}/range?start_date=${startDate}&end_date=${endDate}`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })
      ]);

      // Check for authentication errors
      if (moodsRes.status === 401 || journalsRes.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!moodsRes.ok || !journalsRes.ok) {
        throw new Error(`Failed to fetch data: ${moodsRes.status} ${journalsRes.status}`);
      }

      const [moods, journals] = await Promise.all([
        moodsRes.json(),
        journalsRes.json()
      ]);

      // Validate and set all data
      const validMoods = Array.isArray(moods) ? moods : [];
      const validJournals = Array.isArray(journals) ? journals : [];

      setAllMoodEntries(validMoods);
      setAllJournalEntries(validJournals);
      
      console.log("Fetched all data:", { 
        totalMoods: validMoods.length, 
        totalJournals: validJournals.length 
      });

      // Filter data immediately
      filterAndSetData();

    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Failed to fetch data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setAllMoodEntries([]);
      setAllJournalEntries([]);
      setMoodEntries([]);
      setJournalEntries([]);
      setHasMoodData(false);
    } finally {
      setLoading(false);
    }
  };

  // Filter and set data based on current time period
  const filterAndSetData = () => {
    const allMoods = allMoodEntries();
    const allJournals = allJournalEntries();

    const filteredMoods = filterDataByTimePeriod(allMoods);
    const filteredJournals = filterDataByTimePeriod(allJournals);

    setMoodEntries(filteredMoods);
    setJournalEntries(filteredJournals);
    setHasMoodData(filteredMoods.length > 0);
    
    console.log("Filtered data:", { 
      moods: filteredMoods.length, 
      journals: filteredJournals.length,
      period: timePeriod()
    });
  };

  // Initialize mood trend chart
  const initializeMoodTrendChart = () => {
    if (!moodTrendChartDiv) {
      console.log("moodTrendChartDiv not found");
      return;
    }

    try {
      // Dispose existing chart
      if (moodTrendRoot) {
        moodTrendRoot.dispose();
        moodTrendRoot = undefined;
        moodTrendSeries = undefined;
      }

      console.log("Initializing mood trend chart...");
      
      moodTrendRoot = am5.Root.new(moodTrendChartDiv);
      moodTrendRoot.setThemes([am5themes_Animated.default.new(moodTrendRoot)]);

      const chart = moodTrendRoot.container.children.push(
        am5xy.XYChart.new(moodTrendRoot, {
          panX: false,
          panY: false,
          wheelX: "none",
          wheelY: "none",
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 20,
          paddingBottom: 20
        })
      );

      // Create renderers
      const xRenderer = am5xy.AxisRendererX.new(moodTrendRoot, { 
        minGridDistance: 50
      });
      
      const yRenderer = am5xy.AxisRendererY.new(moodTrendRoot, {});
      
      // Configure grid appearance
      xRenderer.grid.template.setAll({
        strokeOpacity: 0.1
      });
      
      yRenderer.grid.template.setAll({
        strokeOpacity: 0.1
      });

      // Create axes
      const xAxis = chart.xAxes.push(
        am5xy.DateAxis.new(moodTrendRoot, {
          baseInterval: { timeUnit: "day", count: 1 },
          renderer: xRenderer
        })
      );

      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(moodTrendRoot, {
          min: 1,
          max: 5,
          strictMinMax: true,
          renderer: yRenderer
        })
      );

      // Add Y-axis labels for mood levels
      yAxis.set("numberFormatter", am5.NumberFormatter.new(moodTrendRoot, {
        numberFormat: "#"
      }));

      // Create series
      moodTrendSeries = chart.series.push(
        am5xy.LineSeries.new(moodTrendRoot, {
          name: "Mood",
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "mood",
          valueXField: "date",
          stroke: am5.color("#f43f5e"),
          fill: am5.color("#f43f5e")
        })
      );

      // Add circle bullets to data points
      moodTrendSeries.bullets.push(() => {
        return am5.Bullet.new(moodTrendRoot!, {
          sprite: am5.Circle.new(moodTrendRoot!, {
            radius: 4,
            fill: am5.color("#f43f5e"),
            stroke: am5.color("#ffffff"),
            strokeWidth: 2
          })
        });
      });

      // Add tooltips
      moodTrendSeries.set("tooltip", am5.Tooltip.new(moodTrendRoot, {
        labelText: "Mood: {valueY}\nDate: {valueX.formatDate('MMM dd, yyyy')}"
      }));

      console.log("Mood trend chart initialized successfully");
      
      // Update with current data if available
      updateMoodTrendChart();
      
    } catch (error) {
      console.error("Failed to initialize Mood Trend Chart:", error);
      setError("Failed to initialize mood trend chart");
    }
  };

  // Initialize mood distribution chart
  const initializeMoodDistributionChart = () => {
    if (!moodDistributionChartDiv) {
      console.log("moodDistributionChartDiv not found");
      return;
    }

    try {
      // Dispose existing chart
      if (moodDistributionRoot) {
        moodDistributionRoot.dispose();
        moodDistributionRoot = undefined;
        moodDistributionSeries = undefined;
      }

      console.log("Initializing mood distribution chart...");

      moodDistributionRoot = am5.Root.new(moodDistributionChartDiv);
      moodDistributionRoot.setThemes([am5themes_Animated.default.new(moodDistributionRoot)]);

      const chart = moodDistributionRoot.container.children.push(
        am5pie.PieChart.new(moodDistributionRoot, {
          layout: moodDistributionRoot.verticalLayout,
          innerRadius: am5.percent(20)
        })
      );

      moodDistributionSeries = chart.series.push(
        am5pie.PieSeries.new(moodDistributionRoot, {
          valueField: "count",
          categoryField: "mood",
          fillField: "color"
        })
      );

      // Configure labels
      moodDistributionSeries.labels.template.setAll({
        textType: "circular",
        fontSize: 12,
        radius: 10
      });

      // Add tooltips
      moodDistributionSeries.set("tooltip", am5.Tooltip.new(moodDistributionRoot, {
        labelText: "{category}: {value} entries ({valuePercentTotal.formatNumber('#.0')}%)"
      }));

      console.log("Mood distribution chart initialized successfully");
      
      // Update with current data if available
      updateMoodDistributionChart();
      
    } catch (error) {
      console.error("Failed to initialize Mood Distribution Chart:", error);
      setError("Failed to initialize mood distribution chart");
    }
  };

  // Update mood trend chart with data from backend
  const updateMoodTrendChart = () => {
    if (!moodTrendSeries) {
      console.log("moodTrendSeries not initialized yet");
      return;
    }

    try {
      const moods = moodEntries();
      console.log("Updating mood trend with:", moods.length, "entries");

      if (moods.length === 0) {
        moodTrendSeries.data.setAll([]);
        return;
      }

      const data = moods
        .map(entry => {
          const date = new Date(entry.created_at);
          const moodValue = getMoodValue(entry.mood);
          
          return {
            date: date.getTime(),
            mood: moodValue,
            notes: entry.notes || ""
          };
        })
        .filter(item => !isNaN(item.date) && item.mood > 0 && item.mood <= 5)
        .sort((a, b) => a.date - b.date);

      console.log("Final processed mood trend data:", data);
      moodTrendSeries.data.setAll(data);
    } catch (error) {
      console.error("Failed to update mood trend chart:", error);
    }
  };

  // Update mood distribution chart with data from backend
  const updateMoodDistributionChart = () => {
    if (!moodDistributionSeries) {
      console.log("moodDistributionSeries not initialized yet");
      return;
    }

    try {
      const moods = moodEntries();
      console.log("Updating mood distribution with:", moods.length, "entries");

      if (moods.length === 0) {
        moodDistributionSeries.data.setAll([]);
        setHasMoodData(false);
        return;
      }

      const moodCounts = moodOptions.map(option => ({
        mood: option.label,
        emoji: option.emoji,
        count: moods.filter(entry => {
          const moodValue = getMoodValue(entry.mood);
          return moodValue === option.value;
        }).length,
        color: am5.color(option.color)
      })).filter(item => item.count > 0);

      console.log("Final processed mood distribution data:", moodCounts);
      
      setHasMoodData(moodCounts.length > 0);
      moodDistributionSeries.data.setAll(moodCounts);
    } catch (error) {
      console.error("Failed to update mood distribution chart:", error);
    }
  };

  // Handle time period change
  const handleTimePeriodChange = (newPeriod: string) => {
    console.log("Time period changed to:", newPeriod);
    setTimePeriod(newPeriod);
    setIsDropdownOpen(false);
  };

  // Handle dropdown open/close
  const handleDropdownFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleDropdownBlur = () => {
    setTimeout(() => setIsDropdownOpen(false), 150);
  };

  // Initialize visibility effect
  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  });

  // Fetch data when component mounts
  createEffect(() => {
    fetchData();
  });

  // Filter data when time period changes
  createEffect(() => {
    const period = timePeriod();
    if (allMoodEntries().length > 0 || allJournalEntries().length > 0) {
      filterAndSetData();
    }
  });

  // Update charts when filtered data changes
  createEffect(() => {
    const moods = moodEntries();
    if (moods.length >= 0) { // Update even with 0 length to clear charts
      updateMoodTrendChart();
      updateMoodDistributionChart();
    }
  });

  // Calculate statistics
  const getStats = () => {
    const moods = moodEntries();
    const journals = journalEntries();

    // Total journal entries
    const totalJournals = journals.length;

    // Journal streak (consecutive days with journal entries)
    let streak = 0;
    const journalDates = [...new Set(journals.map(j => {
      const date = new Date(j.created_at);
      return formatDateYYYYMMDD(date);
    }))].sort().reverse();

    const today = new Date();
    let current = new Date(today);
    
    while (journalDates.includes(formatDateYYYYMMDD(current))) {
      streak++;
      current.setDate(current.getDate() - 1);
    }

    // Average mood
    const validMoods = moods.filter(entry => {
      const value = getMoodValue(entry.mood);
      return value > 0 && value <= 5;
    });

    const avgMood = validMoods.length > 0
      ? validMoods.reduce((sum, entry) => sum + getMoodValue(entry.mood), 0) / validMoods.length
      : 0;

    return { totalJournals, streak, avgMood };
  };

  // Get period label
  const getPeriodLabel = () => {
    switch (timePeriod()) {
      case "7d": return "Last 7 days";
      case "30d": return "Last 30 days";
      case "all": return "All time";
      default: return "All time";
    }
  };

  // Initialize charts on mount
  onMount(() => {
    console.log("Statistics component mounted");
    
    // Initialize charts with delay to ensure DOM is ready
    setTimeout(() => {
      console.log("Initializing charts after timeout");
      initializeMoodTrendChart();
      initializeMoodDistributionChart();
    }, 200);
  });

  // Cleanup charts on unmount
  onCleanup(() => {
    console.log("Cleaning up charts");
    if (moodTrendRoot) {
      moodTrendRoot.dispose();
    }
    if (moodDistributionRoot) {
      moodDistributionRoot.dispose();
    }
  });

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <style>
        {`
          .dropdown-container {
            position: relative;
          }
          
          .dropdown-select {
            appearance: none;
            background-image: none;
            padding-right: 2.5rem;
            cursor: pointer;
          }
          
          .dropdown-arrow {
            position: absolute;
            right: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            width: 1.25rem;
            height: 1.25rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
            color: #9ca3af;
          }
          
          .dropdown-container:hover .dropdown-arrow {
            color: #be123c;
          }
          
          .dropdown-arrow.open {
            color: #be123c;
            transform: translateY(-50%) rotate(180deg);
          }
          
          .dropdown-select:focus {
            color: #be123c;
            border-color: #be123c;
            box-shadow: 0 0 0 3px rgba(251, 113, 133, 0.1);
            outline: none;
          }
        `}
      </style>
      
      {/* Main Content */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class={`transition-all duration-1000 ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 class="text-3xl md:text-4xl font-bold text-rose-700 mb-6">Statistics</h1>

          {error() && (
            <div class="mb-4 p-4 text-sm text-red-800 bg-red-100 rounded-lg border border-red-200">
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                {error()}
              </div>
            </div>
          )}

          {/* Time Period Filter with Animated Arrow */}
          <div class="mb-6">
            <div class="dropdown-container w-full sm:w-48">
              <select
                class="dropdown-select w-full p-2 border border-gray-300 rounded-lg text-gray-500 transition-all duration-200"
                value={timePeriod()}
                onChange={(e) => handleTimePeriodChange(e.currentTarget.value)}
                onFocus={handleDropdownFocus}
                onBlur={handleDropdownBlur}
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
              <svg
                class={`dropdown-arrow ${isDropdownOpen() ? 'open' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {loading() ? (
            <div class="text-gray-600 text-center py-8">
              <div class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-rose-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading statistics...
              </div>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div class="p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
                  <h6 class="text-lg font-medium text-gray-800 mb-2">Total Journal Entries</h6>
                  <p class="text-3xl font-bold text-rose-600">{getStats().totalJournals}</p>
                  <p class="text-sm text-gray-500 mt-1">{getPeriodLabel()}</p>
                </div>
                <div class="p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
                  <h6 class="text-lg font-medium text-gray-800 mb-2">Journal Streak</h6>
                  <p class="text-3xl font-bold text-rose-600">{getStats().streak} days</p>
                  <p class="text-sm text-gray-500 mt-1">Consecutive days</p>
                </div>
                <div class="p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
                  <h6 class="text-lg font-medium text-gray-800 mb-2">Average Mood</h6>
                  <p class="text-3xl font-bold text-rose-600">
                    {getStats().avgMood > 0 ? getStats().avgMood.toFixed(1) : 'N/A'}
                  </p>
                  <p class="text-sm text-gray-500 mt-1">{getPeriodLabel()}</p>
                </div>
              </div>

              {/* Mood Trend Chart */}
              <div class="max-w-full p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md mb-8">
                <h5 class="text-xl font-medium text-gray-900 mb-6">
                  Mood Trend Over Time
                  <span class="text-sm text-gray-500 ml-2 font-normal">({getPeriodLabel()})</span>
                </h5>
                {moodEntries().length > 0 ? (
                  <div ref={moodTrendChartDiv} class="w-full h-80 bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg"></div>
                ) : (
                  <div class="w-full h-80 flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg">
                    <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p class="text-gray-500 text-lg">No mood data available for this period.</p>
                    <p class="text-gray-400 text-sm mt-2">Start tracking your mood to see trends!</p>
                  </div>
                )}
              </div>

              {/* Mood Distribution Chart */}
              <div class="max-w-full p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
                <h5 class="text-xl font-medium text-gray-900 mb-6">
                  Mood Distribution
                  <span class="text-sm text-gray-500 ml-2 font-normal">({getPeriodLabel()})</span>
                </h5>
                {hasMoodData() && moodEntries().length > 0 ? (
                  <div ref={moodDistributionChartDiv} class="w-full h-80 bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg"></div>
                ) : (
                  <div class="w-full h-80 flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg">
                    <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    <p class="text-gray-500 text-lg">No mood data available for this period.</p>
                    <p class="text-gray-400 text-sm mt-2">Start tracking your mood to see distribution!</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
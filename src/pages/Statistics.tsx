import { Component, createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { useNavigate } from "@solidjs/router";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5pie from "@amcharts/amcharts5/percent";
import * as am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

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
    { date: '2025-06-22', mood: 3, notes: 'Challenging day but got through it.' },
    { date: '2025-06-21', mood: 4, notes: 'Another good day at work.' },
    { date: '2025-06-20', mood: 5, notes: 'Had a great time at the park.' },
    { date: '2025-06-19', mood: 2, notes: 'Feeling a bit down today.' },
    { date: '2025-06-18', mood: 4, notes: 'Productive meeting with the team.' },
    { date: '2025-06-17', mood: 3, notes: 'Neutral day, nothing special.' },
    { date: '2025-06-16', mood: 5, notes: 'Celebrated a small win with friends.' },
    { date: '2025-06-15', mood: 2, notes: 'Tough day emotionally.' },
    { date: '2025-06-14', mood: 4, notes: 'Got a lot done today.' },
    { date: '2025-06-13', mood: 1, notes: 'Really tough day, feeling very sad.' }
  ],
  addEntry(entry: { date: string; mood: number; notes: string }) {
    this.entries.unshift(entry);
  }
};

const Statistics: Component = () => {
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = createSignal("30d"); // Default: last 30 days
  const [isVisible, setIsVisible] = createSignal(false);
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  const [hasMoodData, setHasMoodData] = createSignal(true); // Track if mood data exists
  let moodTrendChartDiv: HTMLDivElement | undefined;
  let moodDistributionChartDiv: HTMLDivElement | undefined;

  // Mood options matching Dashboard with distinct rose colors from rose-400 to rose-900
  const moodOptions = [
    { emoji: '😢', label: 'Very Sad', color: '#9f1239', value: 1 }, // rose-800
    { emoji: '😔', label: 'Sad', color: '#be123c', value: 2 }, // rose-700
    { emoji: '😐', label: 'Neutral', color: '#e11d48', value: 3 }, // rose-600
    { emoji: '😊', label: 'Happy', color: '#f43f5e', value: 4 }, // rose-500
    { emoji: '😄', label: 'Very Happy', color: '#fb7185', value: 5 } // rose-400
  ];

  // Initialize visibility effect
  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  });

  // Filter data by time period
  const filterData = (entries: any[], days: number | null) => {
    if (days === null) return entries; // All time
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return entries.filter(entry => new Date(entry.date) >= cutoff);
  };

  // Calculate statistics
  const getStats = () => {
    const days = timePeriod() === "7d" ? 7 : timePeriod() === "30d" ? 30 : null;
    const filteredMoods = filterData(moodStore.entries, days);
    const filteredJournals = filterData(journalStore.entries, days);

    // Total journal entries
    const totalJournals = filteredJournals.length;

    // Journal streak
    let streak = 0;
    const journalDates = [...new Set(filteredJournals.map(j => j.date))].sort().reverse();
    const today = new Date(2025, 5, 25); // June 25, 2025
    let current = new Date(today);
    while (journalDates.includes(current.toISOString().split('T')[0])) {
      streak++;
      current.setDate(current.getDate() - 1);
    }

    // Average mood
    const avgMood = filteredMoods.length > 0
      ? filteredMoods.reduce((sum, entry) => sum + entry.mood, 0) / filteredMoods.length
      : 0;

    return { totalJournals, streak, avgMood, filteredMoods, filteredJournals };
  };

  // Initialize AmCharts 5 charts
  onMount(() => {
    // Mood Trend Chart
    if (moodTrendChartDiv) {
      try {
        const root = am5.Root.new(moodTrendChartDiv);
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
            paddingBottom: 0
          })
        );

        const xAxis = chart.xAxes.push(
          am5xy.DateAxis.new(root, {
            baseInterval: { timeUnit: "day", count: 1 },
            renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 50 })
          })
        );

        const yAxis = chart.yAxes.push(
          am5xy.ValueAxis.new(root, {
            min: 0,
            max: 5,
            renderer: am5xy.AxisRendererY.new(root, {})
          })
        );

        const series = chart.series.push(
          am5xy.LineSeries.new(root, {
            name: "Mood",
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: "mood",
            valueXField: "date",
            stroke: am5.color("#f43f5e"),
            fill: am5.color("#f43f5e")
          })
        );

        // Update chart data
        createEffect(() => {
          const data = getStats().filteredMoods.map(entry => ({
            date: new Date(entry.date).getTime(),
            mood: entry.mood
          }));
          series.data.setAll(data);
        });

        onCleanup(() => {
          if (root) root.dispose();
        });
      } catch (error) {
        console.error("Failed to initialize Mood Trend Chart:", error);
      }
    }

    // Mood Distribution Chart
    if (moodDistributionChartDiv) {
      try {
        const root = am5.Root.new(moodDistributionChartDiv);
        root.setThemes([am5themes_Animated.default.new(root)]);

        const chart = root.container.children.push(
          am5pie.PieChart.new(root, {
            layout: root.verticalLayout
          })
        );

        const series = chart.series.push(
          am5pie.PieSeries.new(root, {
            valueField: "count",
            categoryField: "mood",
            fillField: "color" // Use the color field for slice colors
          })
        );

        // Update ≤ Update chart data and check for empty data
        createEffect(() => {
          const moodCounts = moodOptions.map(option => ({
            mood: option.label,
            count: getStats().filteredMoods.filter(entry => entry.mood === option.value).length,
            color: am5.color(option.color) // Map the color from moodOptions
          })).filter(item => item.count > 0);
          setHasMoodData(moodCounts.length > 0); // Update hasMoodData based on whether moodCounts is empty
          series.data.setAll(moodCounts);
        });

        onCleanup(() => {
          if (root) root.dispose();
        });
      } catch (error) {
        console.error("Failed to initialize Mood Distribution Chart:", error);
      }
    }
  });

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
        `}
      </style>
      {/* Main Content */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class={`transition-all duration-1000 ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 class="text-3xl md:text-4xl font-bold text-rose-700 mb-6">Statistics</h1>

          {/* Time Period Filter */}
          <div class="relative mb-6">
            <select
              class="w-full sm:w-48 p-2 bordering-gray-300 rounded-lg focus:ring-rose-200 focus:border-rose-700 focus:outline-none appearance-none pr-10 text-gray-500 focus:text-rose-700"
              value={timePeriod()}
              onChange={(e) => setTimePeriod(e.currentTarget.value)}
              onFocus={() => setIsDropdownOpen(true)}
              onBlur={() => setIsDropdownOpen(false)}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
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

          {/* Summary Cards */}
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div class="p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
              <h6 class="text-lg font-medium text-gray-800 mb-2">Total Journal Entries</h6>
              <p class="text-3xl font-bold text-rose-600">{getStats().totalJournals}</p>
            </div>
            <div class="p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
              <h6 class="text-lg font-medium text-gray-800 mb-2">Journal Streak</h6>
              <p class="text-3xl font-bold text-rose-600">{getStats().streak} days</p>
            </div>
            <div class="p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
              <h6 class="text-lg font-medium text-gray-800 mb-2">Average Mood</h6>
              <p class="text-3xl font-bold text-rose-600">{getStats().avgMood.toFixed(1)}</p>
            </div>
          </div>

          {/* Mood Trend Chart */}
          <div class="max-w-full p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md mb-8">
            <h5 class="text-xl font-medium text-gray-900 mb-6">Mood Trend</h5>
            <div ref={moodTrendChartDiv} class="w-full h-64 bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg"></div>
          </div>

          {/* Mood Distribution Chart */}
          <div class="max-w-full p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
            <h5 class="text-xl font-medium text-gray-900 mb-6">Mood Distribution</h5>
            {hasMoodData() ? (
              <div ref={moodDistributionChartDiv} class="w-full h-64 bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg"></div>
            ) : (
              <div class="w-full h-64 flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg">
                <p class="text-gray-500 text-lg">No mood data available for this period.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
import { Component, createSignal, createEffect, onMount } from "solid-js";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const MOOD_API_URL = "https://mindmate-be-production.up.railway.app/api/moods";
const JOURNAL_API_URL = "https://mindmate-be-production.up.railway.app/api/journals";

const moodOptions = [
  { emoji: '😢', label: 'Very Sad', value: 1, stringValue: 'very sad', textColor: 'text-red-600' },
  { emoji: '😔', label: 'Sad', value: 2, stringValue: 'sad', textColor: 'text-orange-600' },
  { emoji: '😐', label: 'Neutral', value: 3, stringValue: 'neutral', textColor: 'text-yellow-600' },
  { emoji: '😊', label: 'Happy', value: 4, stringValue: 'happy', textColor: 'text-lime-600' },
  { emoji: '😄', label: 'Very Happy', value: 5, stringValue: 'very happy', textColor: 'text-green-600' }
];

// Helper function to parse date from backend (handles multiple formats)
function parseDateFromBackend(dateStr: string): string {
  if (!dateStr) return "";
  
  // If it's ISO format (contains T), extract date part
  if (dateStr.includes('T')) {
    return dateStr.split('T')[0]; // Returns YYYY-MM-DD
  }
  
  // If it's already YYYY-MM-DD format
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr;
  }
  
  // If it's MM-DD-YYYY format, convert to YYYY-MM-DD
  if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
    const [mm, dd, yyyy] = dateStr.split('-');
    return `${yyyy}-${mm}-${dd}`;
  }
  
  return dateStr;
}

// Helper function specifically for mood data (uses 'date' field)
function parseMoodDate(mood: any): string {
  // Mood backend sends date in MM-DD-YYYY format via serialize_date function
  if (mood.date) {
    return parseDateFromBackend(mood.date);
  }
  return "";
}

// Helper function specifically for journal data (uses 'created_at' field) 
function parseJournalDate(journal: any): string {
  // Journal uses created_at field which can be ISO format or MM-DD-YYYY
  if (journal.created_at) {
    return parseDateFromBackend(journal.created_at);
  }
  return "";
}

// Helper function to get mood value as number
function getMoodValueAsNumber(mood: any): number {
  if (typeof mood.mood === 'number') {
    return mood.mood;
  } else if (typeof mood.mood === 'string') {
    const moodOption = moodOptions.find(option => option.stringValue === mood.mood);
    return moodOption ? moodOption.value : 3; // Default to neutral
  }
  return 3; // Default to neutral
}

function formatDateForDisplay(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateMMDDYYYY(date: Date) {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

const Statistics: Component = () => {
  const [isVisible, setIsVisible] = createSignal(false);
  const [moodData, setMoodData] = createSignal<any[]>([]);
  const [journalData, setJournalData] = createSignal<any[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = createSignal('last_30_days');
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  
  let moodChartDiv: HTMLDivElement | undefined;
  let journalChartDiv: HTMLDivElement | undefined;
  let moodRoot: am5.Root | undefined;
  let journalRoot: am5.Root | undefined;

  const periodOptions = [
    { value: 'recent', label: 'Recent', days: 1 },
    { value: 'last_3_days', label: 'Last 3 days', days: 3 },
    { value: 'last_7_days', label: 'Last 7 days', days: 7 },
    { value: 'last_30_days', label: 'Last 30 days', days: 30 },
    { value: 'all_time', label: 'All Time', days: 365 }
  ];

  // Get date range based on selected period
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date(endDate);
    
    const period = periodOptions.find(p => p.value === selectedPeriod());
    const daysToSubtract = period ? period.days : 30;
    
    startDate.setDate(startDate.getDate() - daysToSubtract);
    
    return {
      start: formatDateMMDDYYYY(startDate),
      end: formatDateMMDDYYYY(endDate)
    };
  };

  const fetchStatisticsData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const dateRange = getDateRange();
      
      console.log('Fetching data for date range:', dateRange); // Debug log

      // Fetch mood data
      const moodsRes = await fetch(
        `${MOOD_API_URL}/range?start_date=${dateRange.start}&end_date=${dateRange.end}`,
        {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      // Fetch journal data
      const journalsRes = await fetch(
        `${JOURNAL_API_URL}/range?start_date=${dateRange.start}&end_date=${dateRange.end}`,
        {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!moodsRes.ok || !journalsRes.ok) {
        throw new Error("Failed to fetch statistics data");
      }

      const moods = await moodsRes.json();
      const journals = await journalsRes.json();

      console.log('Raw moods data:', moods); // Debug log
      console.log('Raw journals data:', journals); // Debug log

      // Process mood data - group by actual date from the data
      const moodsByDate: Record<string, number[]> = {};
      (Array.isArray(moods) ? moods : []).forEach((mood: any) => {
        const normalizedDate = parseMoodDate(mood);
        console.log(`Processing mood: original date=${mood.date}, normalized=${normalizedDate}`); // Debug log
        if (normalizedDate) {
          if (!moodsByDate[normalizedDate]) {
            moodsByDate[normalizedDate] = [];
          }
          moodsByDate[normalizedDate].push(getMoodValueAsNumber(mood));
        }
      });

      // Process journal data - group by actual date from the data
      const journalsByDate: Record<string, number> = {};
      (Array.isArray(journals) ? journals : []).forEach((journal: any) => {
        const normalizedDate = parseJournalDate(journal);
        console.log(`Processing journal: original date=${journal.created_at}, normalized=${normalizedDate}`); // Debug log
        if (normalizedDate) {
          journalsByDate[normalizedDate] = (journalsByDate[normalizedDate] || 0) + 1;
        }
      });

      console.log('Processed moodsByDate:', moodsByDate); // Debug log
      console.log('Processed journalsByDate:', journalsByDate); // Debug log

      // Create chart data based on selected period
      const chartData: any[] = [];
      const endDate = new Date();
      const period = periodOptions.find(p => p.value === selectedPeriod());
      const daysToShow = period ? period.days : 30;
      
      for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Calculate average mood for the day
        const dayMoods = moodsByDate[dateStr] || [];
        const avgMood = dayMoods.length > 0 
          ? dayMoods.reduce((sum, mood) => sum + mood, 0) / dayMoods.length 
          : null;

        const journalCount = journalsByDate[dateStr] || 0;

        chartData.push({
          date: formatDateForDisplay(dateStr),
          fullDate: dateStr,
          dateValue: date.getTime(),
          mood: avgMood,
          journals: journalCount
        });
      }

      console.log('Final chart data:', chartData); // Debug log

      setMoodData(chartData.filter(d => d.mood !== null));
      setJournalData(chartData);
      setError(null);
      
      // Update charts after data is loaded
      setTimeout(() => updateCharts(), 100);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError("Failed to fetch statistics data");
    } finally {
      setLoading(false);
    }
  };

  const updateCharts = () => {
    // Dispose existing charts
    if (moodRoot) {
      moodRoot.dispose();
      moodRoot = undefined;
    }
    if (journalRoot) {
      journalRoot.dispose();
      journalRoot = undefined;
    }

    // Create mood chart
    if (moodChartDiv && moodData().length > 0) {
      const newMoodRoot = am5.Root.new(moodChartDiv);
      moodRoot = newMoodRoot;
      
      // Set themes
      newMoodRoot.setThemes([
        am5themes_Animated.new(newMoodRoot)
      ]);

      // Create chart
      let moodChart = newMoodRoot.container.children.push(am5xy.XYChart.new(newMoodRoot, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        paddingLeft: 0,
        paddingRight: 1
      }));

      // Add cursor
      let cursor = moodChart.set("cursor", am5xy.XYCursor.new(newMoodRoot, {}));
      cursor.lineY.set("visible", false);

      // Create axes
      let xRenderer = am5xy.AxisRendererX.new(newMoodRoot, { 
        minGridDistance: 30,
        minorGridEnabled: true
      });

      xRenderer.labels.template.setAll({
        rotation: -90,
        centerY: am5.p50,
        centerX: am5.p100,
        paddingRight: 15
      });

      xRenderer.grid.template.setAll({
        location: 1
      })

      let xAxis = moodChart.xAxes.push(am5xy.CategoryAxis.new(newMoodRoot, {
        maxZoomCount: 30,
        categoryField: "date",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(newMoodRoot, {})
      }));

      let yRenderer = am5xy.AxisRendererY.new(newMoodRoot, {
        strokeOpacity: 0.1
      })

      let yAxis = moodChart.yAxes.push(am5xy.ValueAxis.new(newMoodRoot, {
        min: 1,
        max: 5,
        strictMinMax: true,
        renderer: yRenderer
      }));

      // Create series
      let series = moodChart.series.push(am5xy.LineSeries.new(newMoodRoot, {
        name: "Mood Level",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "mood",
        categoryXField: "date",
        tooltip: am5.Tooltip.new(newMoodRoot, {
          labelText: "Date: {fullDate}\nMood: {valueY} ({moodLabel})"
        }),
        stroke: am5.color("#be185d"),
        fill: am5.color("#be185d")
      }));

      // Configure series
      series.strokes.template.setAll({
        strokeWidth: 2
      });

      series.fills.template.setAll({
        fillOpacity: 0.1,
        visible: true
      });

      series.bullets.push(function () {
        return am5.Bullet.new(newMoodRoot, {
          locationY: 0,
          sprite: am5.Circle.new(newMoodRoot, {
            radius: 4,
            stroke: am5.color("#be185d"),
            strokeWidth: 2,
            fill: am5.color("#ffffff")
          })
        });
      });

      // Add data with mood labels
      const moodDataWithLabels = moodData().map(d => ({
        ...d,
        moodLabel: getMoodLabel(d.mood)
      }));

      xAxis.data.setAll(moodDataWithLabels);
      series.data.setAll(moodDataWithLabels);

      // Make stuff animate on load
      series.appear(1000);
      moodChart.appear(1000, 100);
    }

    // Create journal chart
    if (journalChartDiv) {
      const newJournalRoot = am5.Root.new(journalChartDiv);
      journalRoot = newJournalRoot;
      
      // Set themes
      newJournalRoot.setThemes([
        am5themes_Animated.new(newJournalRoot)
      ]);

      // Create chart
      let journalChart = newJournalRoot.container.children.push(am5xy.XYChart.new(newJournalRoot, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        paddingLeft: 0,
        paddingRight: 1
      }));

      // Add cursor
      let cursor = journalChart.set("cursor", am5xy.XYCursor.new(newJournalRoot, {}));
      cursor.lineY.set("visible", false);

      // Create axes
      let xRenderer = am5xy.AxisRendererX.new(newJournalRoot, { 
        minGridDistance: 30,
        minorGridEnabled: true
      });

      xRenderer.labels.template.setAll({
        rotation: -90,
        centerY: am5.p50,
        centerX: am5.p100,
        paddingRight: 15
      });

      xRenderer.grid.template.setAll({
        location: 1
      })

      let xAxis = journalChart.xAxes.push(am5xy.CategoryAxis.new(newJournalRoot, {
        maxZoomCount: 30,
        categoryField: "date",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(newJournalRoot, {})
      }));

      let yRenderer = am5xy.AxisRendererY.new(newJournalRoot, {
        strokeOpacity: 0.1
      })

      let yAxis = journalChart.yAxes.push(am5xy.ValueAxis.new(newJournalRoot, {
        min: 0,
        renderer: yRenderer
      }));

      // Create series
      let series = journalChart.series.push(am5xy.LineSeries.new(newJournalRoot, {
        name: "Journal Entries",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "journals",
        categoryXField: "date",
        tooltip: am5.Tooltip.new(newJournalRoot, {
          labelText: "Date: {fullDate}\nJournal Entries: {valueY}"
        }),
        stroke: am5.color("#059669"),
        fill: am5.color("#059669")
      }));

      // Configure series
      series.strokes.template.setAll({
        strokeWidth: 2
      });

      series.fills.template.setAll({
        fillOpacity: 0.1,
        visible: true
      });

      series.bullets.push(function () {
        return am5.Bullet.new(newJournalRoot, {
          locationY: 0,
          sprite: am5.Circle.new(newJournalRoot, {
            radius: 4,
            stroke: am5.color("#059669"),
            strokeWidth: 2,
            fill: am5.color("#ffffff")
          })
        });
      });

      // Add data
      xAxis.data.setAll(journalData());
      series.data.setAll(journalData());

      // Make stuff animate on load
      series.appear(1000);
      journalChart.appear(1000, 100);
    }
  };

  // Re-fetch data when period changes
  createEffect(() => {
    if (selectedPeriod()) {
      fetchStatisticsData();
    }
  });

  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    fetchStatisticsData();
  });

  onMount(() => {
    return () => {
      if (moodRoot) moodRoot.dispose();
      if (journalRoot) journalRoot.dispose();
    };
  });

  const getMoodStats = () => {
    const moods = moodData().filter(d => d.mood !== null);
    if (moods.length === 0) return null;

    const totalMood = moods.reduce((sum, d) => sum + d.mood, 0);
    const avgMood = totalMood / moods.length;
    const maxMood = Math.max(...moods.map(d => d.mood));
    const minMood = Math.min(...moods.map(d => d.mood));

    return { avg: avgMood, max: maxMood, min: minMood, count: moods.length };
  };

  const getJournalStats = () => {
    const totalJournals = journalData().reduce((sum, d) => sum + d.journals, 0);
    const daysWithJournals = journalData().filter(d => d.journals > 0).length;
    
    return { total: totalJournals, activeDays: daysWithJournals };
  };

  const getMoodLabel = (value: number) => {
    const option = moodOptions.find(opt => opt.value === Math.round(value));
    return option ? option.label : 'Unknown';
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class={`transition-all duration-1000 ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl md:text-4xl font-bold text-rose-700">Statistics</h1>
            
            {/* Time Period Selector */}
            <div class="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen())}
                class="flex items-center justify-between w-48 p-2 border border-gray-300 rounded-lg focus:ring-rose-200 focus:border-rose-700 focus:outline-none bg-white text-gray-700 hover:border-rose-400 transition-colors"
              >
                <span>{periodOptions.find(p => p.value === selectedPeriod())?.label}</span>
                <svg 
                  class={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen() ? 'rotate-180' : 'rotate-0'}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {isDropdownOpen() && (
                <div class="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  {periodOptions.map((option) => (
                    <button
                      onClick={() => {
                        setSelectedPeriod(option.value);
                        setIsDropdownOpen(false);
                      }}
                      class={`w-full text-left px-3 py-2 hover:bg-rose-50 hover:text-rose-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        selectedPeriod() === option.value ? 'bg-rose-50 text-rose-700' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error() && (
            <div class="mb-4 p-4 text-sm text-red-800 bg-red-100 rounded-lg">
              {error()}
            </div>
          )}

          {loading() ? (
            <div class="text-gray-600">Loading statistics...</div>
          ) : (
            <div class="space-y-8">
              {/* Summary Cards */}
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(() => {
                  const moodStats = getMoodStats();
                  const journalStats = getJournalStats();
                  
                  return (
                    <>
                      {moodStats && (
                        <>
                          <div class="p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
                            <h3 class="text-lg font-medium text-gray-900 mb-2">Average Mood</h3>
                            <p class="text-3xl font-bold text-rose-700">
                              {moodStats.avg.toFixed(1)}/5
                            </p>
                            <p class="text-sm text-gray-600">
                              {getMoodLabel(moodStats.avg)}
                            </p>
                          </div>
                          <div class="p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
                            <h3 class="text-lg font-medium text-gray-900 mb-2">Mood Entries</h3>
                            <p class="text-3xl font-bold text-rose-700">{moodStats.count}</p>
                            <p class="text-sm text-gray-600">
                              Last {periodOptions.find(p => p.value === selectedPeriod())?.days} days
                            </p>
                          </div>
                        </>
                      )}
                      <div class="p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Journal Entries</h3>
                        <p class="text-3xl font-bold text-rose-700">{journalStats.total}</p>
                        <p class="text-sm text-gray-600">Last {periodOptions.find(p => p.value === selectedPeriod())?.days} days</p>
                      </div>
                      <div class="p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Active Days</h3>
                        <p class="text-3xl font-bold text-rose-700">{journalStats.activeDays}</p>
                        <p class="text-sm text-gray-600">Days with journals</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Mood Chart */}
              {moodData().length > 0 && (
                <div class="p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
                  <h2 class="text-xl font-medium text-gray-900 mb-4">Mood Trend Over Time (Last {periodOptions.find(p => p.value === selectedPeriod())?.days} days)</h2>
                  <div class="h-80">
                    <div ref={moodChartDiv} class="w-full h-full"></div>
                  </div>
                </div>
              )}

              {/* Journal Chart */}
              <div class="p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
                <h2 class="text-xl font-medium text-gray-900 mb-4">Journal Activity Over Time (Last {periodOptions.find(p => p.value === selectedPeriod())?.days} days)</h2>
                <div class="h-80">
                  <div ref={journalChartDiv} class="w-full h-full"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
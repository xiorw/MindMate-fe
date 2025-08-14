import { Component, createSignal, createEffect, onMount } from "solid-js";

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
  
  let moodChartRef: HTMLCanvasElement | undefined;
  let journalChartRef: HTMLCanvasElement | undefined;
  let moodChart: any;
  let journalChart: any;

  // Get date range for last 30 days
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);
    
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

      // Create chart data for last 30 days
      const chartData: any[] = [];
      const endDate = new Date();
      
      for (let i = 29; i >= 0; i--) {
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

  const updateCharts = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      // Import Chart.js from CDN
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
      
      if (!window.Chart) {
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const Chart = window.Chart;
      
      // Destroy existing charts
      if (moodChart) {
        moodChart.destroy();
      }
      if (journalChart) {
        journalChart.destroy();
      }

      // Create mood chart
      if (moodChartRef && moodData().length > 0) {
        moodChart = new Chart(moodChartRef, {
          type: 'line',
          data: {
            labels: moodData().map(d => d.date),
            datasets: [{
              label: 'Mood Level',
              data: moodData().map(d => d.mood),
              borderColor: '#be185d',
              backgroundColor: 'rgba(190, 24, 93, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.3,
              pointRadius: 4,
              pointHoverRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: false,
                min: 1,
                max: 5,
                ticks: {
                  stepSize: 1,
                  callback: function(value: any) {
                    const option = moodOptions.find(opt => opt.value === value);
                    return option ? option.label : value;
                  }
                }
              }
            },
            plugins: {
              tooltip: {
                callbacks: {
                  title: function(context: any) {
                    const index = context[0].dataIndex;
                    return `Date: ${moodData()[index].fullDate}`;
                  },
                  label: function(context: any) {
                    const value = context.parsed.y;
                    const option = moodOptions.find(opt => opt.value === Math.round(value));
                    return `Mood: ${option ? option.label : 'Unknown'} (${value.toFixed(1)})`;
                  }
                }
              }
            }
          }
        });
      }

      // Create journal chart
      if (journalChartRef) {
        journalChart = new Chart(journalChartRef, {
          type: 'line',
          data: {
            labels: journalData().map(d => d.date),
            datasets: [{
              label: 'Journal Entries',
              data: journalData().map(d => d.journals),
              borderColor: '#059669',
              backgroundColor: 'rgba(5, 150, 105, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.3,
              pointRadius: 4,
              pointHoverRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            },
            plugins: {
              tooltip: {
                callbacks: {
                  title: function(context: any) {
                    const index = context[0].dataIndex;
                    return `Date: ${journalData()[index].fullDate}`;
                  },
                  label: function(context: any) {
                    const value = context.parsed.y;
                    return `Journal Entries: ${value}`;
                  }
                }
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Error loading Chart.js or creating charts:', error);
      setError("Failed to load charts");
    }
  };

  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    fetchStatisticsData();
  });

  onMount(() => {
    return () => {
      if (moodChart) moodChart.destroy();
      if (journalChart) journalChart.destroy();
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
          <h1 class="text-3xl md:text-4xl font-bold text-rose-700 mb-6">Statistics</h1>

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
                            <p class="text-sm text-gray-600">Last 30 days</p>
                          </div>
                        </>
                      )}
                      <div class="p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Journal Entries</h3>
                        <p class="text-3xl font-bold text-rose-700">{journalStats.total}</p>
                        <p class="text-sm text-gray-600">Last 30 days</p>
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
                  <h2 class="text-xl font-medium text-gray-900 mb-4">Mood Trend Over Time (Last 30 days)</h2>
                  <div class="h-80">
                    <canvas ref={moodChartRef}></canvas>
                  </div>
                </div>
              )}

              {/* Journal Chart */}
              <div class="p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
                <h2 class="text-xl font-medium text-gray-900 mb-4">Journal Activity Over Time (Last 30 days)</h2>
                <div class="h-80">
                  <canvas ref={journalChartRef}></canvas>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add Chart.js type declaration
declare global {
  interface Window {
    Chart: any;
  }
}

export default Statistics;
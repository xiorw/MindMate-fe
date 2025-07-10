import { Component, createSignal, createEffect, onCleanup } from "solid-js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

gsap.registerPlugin(ScrollTrigger);

const PersonalStats: Component = () => {
  const [isVisible, setIsVisible] = createSignal(false);
  const [chartType, setChartType] = createSignal<"weekly" | "monthly">("weekly");

  let chartRoot: am5.Root | null = null;

  const renderChart = () => {
    const chartDiv = document.getElementById("mood-chart") as HTMLElement | null;
    if (!chartDiv) return;

    // Dispose old chart if exists
    if (chartRoot) {
      chartRoot.dispose();
    }

    chartRoot = am5.Root.new(chartDiv);
    chartRoot.setThemes([am5themes_Animated.new(chartRoot)]);

    const chart = chartRoot.container.children.push(
      am5xy.XYChart.new(chartRoot, {
        panX: true,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
      })
    );

    const cursor = chart.set("cursor", am5xy.XYCursor.new(chartRoot, { behavior: "zoomX" }));
    cursor.lineY.set("visible", false);

    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(chartRoot, {
        baseInterval: { timeUnit: chartType() === "weekly" ? "day" : "month", count: 1 },
        renderer: am5xy.AxisRendererX.new(chartRoot, {}),
        tooltip: am5.Tooltip.new(chartRoot, {}),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(chartRoot, {
        renderer: am5xy.AxisRendererY.new(chartRoot, {}),
        min: 0,
        max: 10,
      })
    );

    const series = chart.series.push(
      am5xy.SmoothedXLineSeries.new(chartRoot, {
        xAxis,
        yAxis,
        valueYField: "mood",
        valueXField: "date",
        tooltip: am5.Tooltip.new(chartRoot, {
          labelText: "Mood: {valueY}",
        }),
      })
    );

    series.bullets.push(() =>
      am5.Bullet.new(chartRoot!, {
        sprite: am5.Circle.new(chartRoot!, {
          radius: 5,
          fill: am5.color(0xfb7185),
          stroke: am5.color(0x000000),
          strokeWidth: 1,
        }),
      })
    );

    const data =
      chartType() === "weekly"
        ? [
            { date: new Date(2025, 6, 1).getTime(), mood: 6 },
            { date: new Date(2025, 6, 2).getTime(), mood: 7 },
            { date: new Date(2025, 6, 3).getTime(), mood: 5 },
            { date: new Date(2025, 6, 4).getTime(), mood: 8 },
            { date: new Date(2025, 6, 5).getTime(), mood: 6 },
            { date: new Date(2025, 6, 6).getTime(), mood: 9 },
            { date: new Date(2025, 6, 7).getTime(), mood: 7 },
          ]
        : [
            { date: new Date(2025, 0, 1).getTime(), mood: 6 },
            { date: new Date(2025, 1, 1).getTime(), mood: 7 },
            { date: new Date(2025, 2, 1).getTime(), mood: 5 },
            { date: new Date(2025, 3, 1).getTime(), mood: 8 },
            { date: new Date(2025, 4, 1).getTime(), mood: 6 },
            { date: new Date(2025, 5, 1).getTime(), mood: 9 },
            { date: new Date(2025, 6, 1).getTime(), mood: 7 },
          ];

    series.data.setAll(data);
    series.appear(500);
    chart.appear(500, 100);
  };

  // Render chart initially & whenever chartType changes
  createEffect(() => {
    renderChart();
  });

  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);

    const content = document.querySelector(".stats-content");
    if (content) {
      gsap.from(content, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });
    }

    const chartPreview = document.querySelector(".chart-preview");
    if (chartPreview) {
      ScrollTrigger.create({
        trigger: chartPreview as HTMLElement,
        start: "top 85%",
        onEnter: () => {
          gsap.to(chartPreview, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
          });
          gsap.to(chartPreview, {
            boxShadow: "0 0 10px rgba(251, 113, 133, 0.5)",
            duration: 1,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            delay: 0.8,
          });
        },
      });
    }
  });

  onCleanup(() => {
    chartRoot?.dispose();
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  });

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-100 to-rose-100 relative overflow-hidden">
      <div class="absolute inset-0">
        {[...Array(10)].map(() => (
          <div
            class="absolute bg-white rounded-full animate-bubble"
            style={{
              width: `${Math.random() * 50 + 20}px`,
              height: `${Math.random() * 50 + 20}px`,
              left: `${Math.random() * 100}vw`,
              top: `${Math.random() * 100}vh`,
              "animation-duration": `${Math.random() * 10 + 10}s`,
              "animation-delay": `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <section class="pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="max-w-7xl mx-auto text-center stats-content">
          <div class={`transition-all duration-1000 ${isVisible() ? "opacity-100" : "opacity-0"}`}>
            <div class="inline-flex items-center bg-yellow-200 text-gray-800 px-5 py-2.5 rounded-full text-sm font-medium mb-6 shadow-sm">
              <span class="mr-2">✨</span>
              Visualize Your Progress
            </div>
            <h1 class="text-4xl sm:text-5xl md:text-7xl font-extrabold text-rose-900 mb-6 leading-tight tracking-tight">
              Personal Stats
            </h1>
            <p class="text-lg md:text-xl text-gray-800 mb-8 max-w-3xl mx-auto leading-relaxed">
              Analyze your emotional journey through beautiful and interactive charts powered by AmCharts 5. Toggle between weekly or monthly data to gain insights into your mood patterns.
            </p>

            {/* Chart Section */}
            <div class="bg-white/70 rounded-2xl p-6 mb-6 backdrop-blur-sm max-w-md mx-auto chart-preview transition-transform hover:scale-105">
              <div class="flex justify-center space-x-4 mb-4">
                {(["weekly", "monthly"] as const).map((type) => (
                  <button
                    class={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors duration-200
                      ${
                        chartType() === type
                          ? "bg-rose-700 text-white hover:bg-rose-800"
                          : "bg-white text-rose-700 border-rose-700 hover:bg-rose-100"
                      }`}
                    onClick={() => setChartType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
              <div class="h-64 rounded-lg border-2 border-rose-700 overflow-hidden relative">
                <div id="mood-chart" class="w-full h-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom CSS */}
      <style>
        {`
          @keyframes bubble {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(${Math.random() * 50 - 25}vw, ${Math.random() * 50 - 25}vh) scale(1.2); }
            100% { transform: translate(0, 0) scale(1); }
          }
          .animate-bubble {
            animation: bubble 10s infinite ease-in-out;
            opacity: 0.3;
          }
        `}
      </style>
    </div>
  );
};

export default PersonalStats;

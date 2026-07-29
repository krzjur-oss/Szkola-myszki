// =========================================================
// RECHARTS ACCURACY PROGRESS CHART VISUALIZER
// =========================================================
import { state } from './state.js';

const GAME_NAMES = {
  click_basic: 'Jednym kliknięciem 👆',
  click_precision: 'Precyzja 🎯',
  double_click: 'Podwójne kliknięcie ✌️',
  drag: 'Przeciąganie 📦',
  maze: 'Labirynt 🌀',
  mixed: 'Wyzwanie 🏆'
};

let activeFilter = 'all';
let rootMap = new Map();

export function renderAccuracyChart(containerId = 'accuracy-chart-root') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!window.React || !window.ReactDOM || !window.Recharts) {
    // If Recharts CDN is still loading or unavailable, try waiting or display fallback message
    container.innerHTML = `
      <div style="text-align:center; padding: 25px 10px; color: var(--muted); font-size: 0.9rem;">
        <div style="font-size: 1.5rem; margin-bottom: 6px;">⏳ Ładowanie wykresu Recharts...</div>
        <div>Jeśli wykres nie pojawi się po chwili, upewnij się, że masz połączenie z siecią.</div>
      </div>
    `;
    setTimeout(() => {
      if (window.Recharts) renderAccuracyChart(containerId);
    }, 800);
    return;
  }

  const history = Array.isArray(state.gameHistory) ? state.gameHistory : [];
  let filtered = history;
  if (activeFilter !== 'all') {
    filtered = history.filter(h => h.gameId === activeFilter);
  }

  const chartData = filtered.map((item, idx) => {
    const d = new Date(item.timestamp || Date.now());
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
    return {
      index: idx + 1,
      label: `#${idx + 1}`,
      time: timeStr,
      fullDate: `${dateStr} ${timeStr}`,
      accuracy: Math.round(item.accuracy || 0),
      gameId: item.gameId,
      gameName: GAME_NAMES[item.gameId] || item.gameId,
      hits: item.hits || 0,
      miss: item.miss || 0,
      score: item.score || 0,
      stars: item.stars || 0,
      levelIdx: (item.levelIdx !== undefined ? item.levelIdx + 1 : 1)
    };
  });

  const { React, ReactDOM, Recharts } = window;
  const e = React.createElement;
  const { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } = Recharts;

  function CustomTooltip({ active, payload }) {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return e('div', {
        style: {
          background: '#0f1c2c',
          border: '1.5px solid #00d4ff',
          borderRadius: '12px',
          padding: '10px 14px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
          color: '#fff',
          fontSize: '0.85rem',
          minWidth: '160px'
        }
      },
        e('div', { style: { fontWeight: 'bold', color: '#00d4ff', marginBottom: '4px' } }, `${data.gameName} (Lvl ${data.levelIdx})`),
        e('div', { style: { color: '#ffd740', fontWeight: '800', fontSize: '1.1rem', marginBottom: '4px' } }, `Celność: ${data.accuracy}%`),
        e('div', { style: { color: '#8ba5c4', fontSize: '0.78rem' } }, `Trafienia: ${data.hits} | Błędy: ${data.miss}`),
        e('div', { style: { color: '#8ba5c4', fontSize: '0.75rem', marginTop: '4px', fontStyle: 'italic' } }, data.fullDate)
      );
    }
    return null;
  }

  function ChartComponent() {
    const [filter, setFilter] = React.useState(activeFilter);

    const onFilterChange = (newFilter) => {
      activeFilter = newFilter;
      setFilter(newFilter);
    };

    const currentFilteredData = React.useMemo(() => {
      if (filter === 'all') return chartData;
      return chartData.filter(d => d.gameId === filter);
    }, [filter]);

    const filters = [
      { id: 'all', label: 'Wszystkie' },
      { id: 'click_basic', label: 'Klikanie 👆' },
      { id: 'click_precision', label: 'Precyzja 🎯' },
      { id: 'double_click', label: 'Podwójne ✌️' },
      { id: 'drag', label: 'Przeciąganie 📦' },
      { id: 'maze', label: 'Labirynt 🌀' },
      { id: 'mixed', label: 'Wyzwanie 🏆' }
    ];

    return e('div', { style: { width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' } },
      // Filter selector pills
      e('div', {
        style: {
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '6px',
          scrollbarWidth: 'none'
        }
      },
        filters.map(f => e('button', {
          key: f.id,
          onClick: () => onFilterChange(f.id),
          style: {
            background: filter === f.id ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
            color: filter === f.id ? '#000' : 'var(--muted)',
            border: filter === f.id ? '1px solid var(--accent)' : '1px solid var(--border)',
            borderRadius: '16px',
            padding: '4px 10px',
            fontSize: '0.76rem',
            fontWeight: '800',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s'
          }
        }, f.label))
      ),

      // Chart area
      currentFilteredData.length === 0
        ? e('div', {
            style: {
              textAlign: 'center',
              padding: '35px 15px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '14px',
              border: '1px dashed var(--border)',
              color: 'var(--muted)',
              fontSize: '0.88rem'
            }
          },
            e('div', { style: { fontSize: '1.8rem', marginBottom: '6px' } }, '📈'),
            e('div', { style: { fontWeight: '700', color: '#fff', marginBottom: '4px' } }, 'Brak wystarczających danych celności'),
            e('div', null, 'Zagraj kilka rozgrywek, aby wygenerować wykres postępu!')
          )
        : e('div', {
            style: {
              width: '100%',
              height: '220px',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '12px 6px 6px 0px'
            }
          },
            e(ResponsiveContainer, { width: '100%', height: '100%' },
              e(LineChart, { data: currentFilteredData, margin: { top: 10, right: 20, left: -15, bottom: 5 } },
                e(CartesianGrid, { strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.08)' }),
                e(XAxis, { dataKey: 'label', stroke: '#8ba5c4', fontSize: 11, tickLine: false }),
                e(YAxis, { domain: [0, 100], unit: '%', stroke: '#8ba5c4', fontSize: 11, tickLine: false }),
                e(Tooltip, { content: e(CustomTooltip) }),
                e(ReferenceLine, { y: 80, stroke: '#00e676', strokeDasharray: '3 3', label: { value: 'Cel 80%', fill: '#00e676', fontSize: 10, position: 'insideTopRight' } }),
                e(Line, {
                  type: 'monotone',
                  dataKey: 'accuracy',
                  stroke: '#00d4ff',
                  strokeWidth: 3,
                  dot: { r: 5, fill: '#00d4ff', stroke: '#0b1726', strokeWidth: 2 },
                  activeDot: { r: 7, fill: '#ffd740', stroke: '#fff', strokeWidth: 2 }
                })
              )
            )
          )
    );
  }

  try {
    if (!rootMap.has(container)) {
      if (ReactDOM.createRoot) {
        const root = ReactDOM.createRoot(container);
        rootMap.set(container, root);
        root.render(e(ChartComponent));
      } else {
        ReactDOM.render(e(ChartComponent), container);
      }
    } else {
      const root = rootMap.get(container);
      root.render(e(ChartComponent));
    }
  } catch(err) {
    console.error('Błąd renderowania wykresu Recharts:', err);
  }
}

window.renderAccuracyChart = renderAccuracyChart;

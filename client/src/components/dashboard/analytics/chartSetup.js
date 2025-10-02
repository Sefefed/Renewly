import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from "chart.js";

let registered = false;

export const ensureChartRegistration = () => {
  if (registered) return;
  ChartJS.register(
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Filler,
    Tooltip,
    Legend,
    ArcElement,
    BarElement
  );
  ChartJS.defaults.font.family = "'Inter', 'Helvetica Neue', Arial, sans-serif";
  ChartJS.defaults.font.size = 14;
  ChartJS.defaults.font.weight = "600";
  ChartJS.defaults.color = "#1a1a1a";
  registered = true;
};

export default ensureChartRegistration;

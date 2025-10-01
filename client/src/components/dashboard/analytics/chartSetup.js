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
  registered = true;
};

export default ensureChartRegistration;

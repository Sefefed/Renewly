import PropTypes from "prop-types";
import InsightCard from "./InsightCard";

const AnalyticsSummaryCards = ({ cards, currency }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    {cards.map((card) => (
      <InsightCard
        key={card.key}
        title={card.title}
        value={card.value}
        trend={card.trend}
        icon={card.icon}
        color={card.color}
        description={card.description}
        currency={currency}
      />
    ))}
  </div>
);

AnalyticsSummaryCards.propTypes = {
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      trend: PropTypes.string,
      icon: PropTypes.string,
      description: PropTypes.string,
      color: PropTypes.string,
    })
  ).isRequired,
  currency: PropTypes.string,
};

AnalyticsSummaryCards.defaultProps = {
  currency: "USD",
};

export default AnalyticsSummaryCards;

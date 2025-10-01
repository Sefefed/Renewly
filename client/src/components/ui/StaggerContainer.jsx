import PropTypes from "prop-types";
import { Children, cloneElement } from "react";

const StaggerContainer = ({ children, delay }) => {
  return Children.map(children, (child, index) => {
    if (!child) return child;
    const existingStyle = child.props?.style || {};
    return cloneElement(child, {
      style: {
        ...existingStyle,
        animationDelay: `${index * delay}ms`,
      },
    });
  });
};

StaggerContainer.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
};

StaggerContainer.defaultProps = {
  delay: 120,
};

export default StaggerContainer;

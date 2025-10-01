import PropTypes from "prop-types";
import { motion } from "framer-motion";

const MotionDiv = motion.div;

const FadeIn = ({ children, delay, className }) => (
  <MotionDiv
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className={className}
  >
    {children}
  </MotionDiv>
);

FadeIn.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
  className: PropTypes.string,
};

FadeIn.defaultProps = {
  delay: 0,
  className: "",
};

export default FadeIn;

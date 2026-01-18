import React, { useLayoutEffect } from "react";
import { motion } from "framer-motion";

// animacije za slide prijelaz stranice
const slideVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

const SlidePageTransition = ({ children, animateOnMount = true }) => {
  // scrollaj na vrh pri promjeni stranice
  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  return (
    <motion.div
      variants={slideVariants}
      initial={animateOnMount ? "initial" : false}
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5, ease: "easeInOut" }}
      style={{ width: "100%", height: "100%" }}
    >
      {children}
    </motion.div>
  );
};

export default SlidePageTransition;

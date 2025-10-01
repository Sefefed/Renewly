import { useEffect, useRef, useState } from "react";

const getExpandedClass = (isExpanded) =>
  isExpanded ? "top-6 bottom-6 max-h-[calc(100vh-3rem)]" : "bottom-6 h-80";

const useAssistantLayout = ({ isOpen, onLayoutChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setIsExpanded(false);
      onLayoutChange?.({ isExpanded: false, width: 0 });
      return;
    }

    const timer = setTimeout(() => setIsExpanded(true), 50);
    return () => clearTimeout(timer);
  }, [isOpen, onLayoutChange]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const node = containerRef.current;
    if (!node) {
      return;
    }

    const notifyLayout = () => {
      onLayoutChange?.({
        isExpanded,
        width: node.getBoundingClientRect().width,
      });
    };

    notifyLayout();

    const ResizeObserverCtor =
      typeof window !== "undefined" ? window.ResizeObserver : undefined;

    if (!ResizeObserverCtor) {
      return;
    }

    const observer = new ResizeObserverCtor(() => {
      notifyLayout();
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, [isExpanded, isOpen, onLayoutChange]);

  return {
    isExpanded,
    containerRef,
    containerLayoutClasses: getExpandedClass(isExpanded),
  };
};

export default useAssistantLayout;

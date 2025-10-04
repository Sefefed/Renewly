import { useEffect, useRef, useState } from "react";

const getExpandedClass = (isExpanded) =>
  isExpanded
    ? "opacity-100 translate-y-0 md:max-h-[calc(100vh-3rem)]"
    : "pointer-events-none opacity-0 translate-y-8 md:translate-y-6";

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

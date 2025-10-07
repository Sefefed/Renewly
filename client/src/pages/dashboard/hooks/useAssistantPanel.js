import { useCallback, useEffect, useMemo, useState } from "react";

const calculateOffset = (layout, viewportWidth) => {
  if (!layout?.isExpanded || !layout?.width || viewportWidth < 768) {
    return 0;
  }
  if (viewportWidth < 1024) {
    return Math.min(layout.width + 24, viewportWidth * 0.6);
  }
  if (viewportWidth < 1440) {
    return Math.min(layout.width + 40, viewportWidth * 0.5);
  }
  return Math.min(layout.width + 64, viewportWidth * 0.45);
};

const useAssistantPanel = () => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantUnread, setAssistantUnread] = useState(0);
  const [assistantLayout, setAssistantLayout] = useState({
    width: 0,
    isExpanded: false,
  });
  const [assistantOffset, setAssistantOffset] = useState(0);

  const handleAssistantLayoutChange = useCallback((layout) => {
    setAssistantLayout(layout);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleResize = () => {
      setAssistantOffset(calculateOffset(assistantLayout, window.innerWidth));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [assistantLayout]);

  const dashboardStyle = useMemo(
    () => ({
      paddingRight: `${assistantOffset}px`,
      transition: "padding-right 0.35s ease",
    }),
    [assistantOffset]
  );

  return {
    isAssistantOpen,
    setIsAssistantOpen,
    assistantUnread,
    setAssistantUnread,
    assistantOffset,
    dashboardStyle,
    handleAssistantLayoutChange,
  };
};

export default useAssistantPanel;

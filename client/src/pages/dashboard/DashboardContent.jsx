import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../../components/Navigation";
import FadeIn from "../../components/ui/FadeIn";
import {
  NotificationBell,
  NotificationCenter,
} from "../../components/Notifications";
import {
  AssistantTrigger,
  FinancialAssistant,
} from "../../components/assistant";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardMainGrid from "./DashboardMainGrid";
import DashboardSidebar from "./DashboardSidebar";

const DashboardContent = ({
  userName,
  token,
  api,
  dashboardStyle,
  handleExportCalendar,
  onOpenSettings,
  setShowNotificationCenter,
  showNotificationCenter,
  isAssistantOpen,
  setIsAssistantOpen,
  assistantUnread,
  setAssistantUnread,
  handleAssistantLayoutChange,
  assistantPrompt,
  onAssistantPromptConsumed,
  mainGridProps,
}) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(
    () => setIsSidebarOpen((prev) => !prev),
    []
  );
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  const handleSidebarNavigate = useCallback(
    (targetId) => {
      const element = document.getElementById(targetId);
      if (targetId?.startsWith("route:")) {
        const route = targetId.slice("route:".length);
        if (route) {
          navigate(route);
        }
        closeSidebar();
        return;
      }

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        closeSidebar();
        return;
      }

      closeSidebar();
    },
    [closeSidebar, navigate]
  );

  useEffect(() => {
    if (!isSidebarOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeSidebar, isSidebarOpen]);

  const openNotifications = () => setShowNotificationCenter(true);
  const closeNotifications = () => setShowNotificationCenter(false);

  const openAssistant = () => {
    setIsAssistantOpen(true);
    setAssistantUnread(0);
  };

  return (
    <div className="dashboard-shell" style={dashboardStyle}>
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onNavigate={handleSidebarNavigate}
      />
      <Navigation
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="dashboard-shell__inner space-y-10">
        <FadeIn delay={0.05}>
          <DashboardHeader
            userName={userName}
            onExportCalendar={handleExportCalendar}
            onOpenSettings={onOpenSettings}
            onOpenNotificationCenter={openNotifications}
            notificationSlot={
              <NotificationBell
                token={token}
                onOpenCenter={openNotifications}
              />
            }
          />
        </FadeIn>

        <DashboardMainGrid {...mainGridProps} />
      </div>

      {!isAssistantOpen ? (
        <AssistantTrigger
          unreadCount={assistantUnread}
          onClick={openAssistant}
        />
      ) : null}

      <FinancialAssistant
        api={api}
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onUnreadChange={setAssistantUnread}
        onLayoutChange={handleAssistantLayoutChange}
        queuedPrompt={assistantPrompt}
        onPromptConsumed={onAssistantPromptConsumed}
      />

      <NotificationCenter
        token={token}
        isOpen={showNotificationCenter}
        onClose={closeNotifications}
      />
    </div>
  );
};

export default DashboardContent;

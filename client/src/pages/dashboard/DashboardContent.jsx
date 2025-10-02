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
import DashboardToasts from "./DashboardToasts";

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
  toasts,
  removeToast,
  toastsStyle,
  assistantPrompt,
  onAssistantPromptConsumed,
  mainGridProps,
}) => {
  const openNotifications = () => setShowNotificationCenter(true);
  const closeNotifications = () => setShowNotificationCenter(false);

  const openAssistant = () => {
    setIsAssistantOpen(true);
    setAssistantUnread(0);
  };

  return (
    <div className="dashboard-shell" style={dashboardStyle}>
      <Navigation />

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

      <DashboardToasts
        toasts={toasts}
        onDismiss={removeToast}
        style={toastsStyle}
      />

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

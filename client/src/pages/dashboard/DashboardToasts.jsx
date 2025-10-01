import { ToastNotification } from "../../components/Notifications";

const DashboardToasts = ({ toasts, onDismiss, style }) => {
  if (!toasts.length) {
    return null;
  }

  return (
    <div
      className="fixed bottom-28 right-4 z-40 space-y-2 transition-[right] duration-300"
      style={style}
    >
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          notification={toast}
          onClose={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
};

export default DashboardToasts;

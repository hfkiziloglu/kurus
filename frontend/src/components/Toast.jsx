import { useToastStore } from "../store";

export function ToastViewport() {
  const { toasts, remove } = useToastStore();
  return (
    <div className="toast-viewport">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => remove(t.id)} style={{ cursor: "pointer" }}>
          <div className="toast-dot" />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

export type AuthMode = "signin" | "signup" | "forgot";

export interface User {
  nickname: string;
}

export interface AuthModalsProps {
  isOpen: boolean;
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
  onLoginSuccess: (user: User) => void;
}

export interface CareerCategory {
  label: string;
  items: string[];
}

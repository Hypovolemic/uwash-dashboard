type TelegramWebAppUser = {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
};

type TelegramWebApp = {
  initDataUnsafe?: {
    user?: TelegramWebAppUser;
  };
};

export type TelegramIdentity = {
  userId: string;
  username: string;
  displayName: string;
};

export function getTelegramIdentity(): TelegramIdentity | null {
  const tg = (window as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;
  const user = tg?.initDataUnsafe?.user;

  if (!user) return null;

  const rawUsername = user.username?.trim();
  const firstName = user.first_name?.trim() ?? "";
  const lastName = user.last_name?.trim() ?? "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ");

  return {
    userId: String(user.id),
    username: rawUsername && rawUsername.length > 0 ? rawUsername : `tg_${user.id}`,
    displayName: displayName || rawUsername || `tg_${user.id}`,
  };
}

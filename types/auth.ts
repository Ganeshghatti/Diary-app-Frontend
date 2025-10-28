export type User = {
  id: string;
  phone: string;
};

export type AuthState = {
  user: User | null;
  loading: boolean;
};

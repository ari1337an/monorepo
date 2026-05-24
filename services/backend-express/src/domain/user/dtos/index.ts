export type UserType = {
  id: string;
  name: string;
  email: string;
};

export type UserCreateType = {
  name: string;
  email: string;
};

export type UserUpdateType = {
  name?: string;
  email?: string;
};

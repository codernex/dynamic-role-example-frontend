import { create } from "zustand";

interface IStore {
  tasks: ITask[];
  users: IUser[];
  setUser: (user: IUser[]) => void;
  createUser: (user: IUser) => void;
  createTask: (task: ITask) => void;
  setTask: (task: ITask[]) => void;
  roles: IAccessController[];
  createRole: (role: IAccessController) => void;
  setRoles: (roles: IAccessController[]) => void;
}

export const useStore = create<IStore>()((set) => ({
  tasks: [],
  roles: [],
  users: [],
  setUser(users) {
    set(() => ({
      users,
    }));
  },
  createUser(user) {
    set((state) => ({
      users: [...state.users, user],
    }));
  },
  createRole: (role) => {
    set((state) => ({
      roles: [...state.roles, role],
    }));
  },
  setTask: (tasks) => {
    set(() => ({
      tasks,
    }));
  },
  createTask(task) {
    set((state) => ({
      tasks: [...state.tasks, task],
    }));
  },
  setRoles(roles) {
    set({
      roles,
    });
  },
}));

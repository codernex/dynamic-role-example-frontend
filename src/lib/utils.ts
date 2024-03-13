import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios, { InternalAxiosRequestConfig } from "axios";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((data: InternalAxiosRequestConfig<unknown>) => {
  data.headers.Authorization = "Bearer " + localStorage.getItem("_auth");
  return data;
});

export const userPermission = [
  "user.view",
  "user.create",
  "user.update",
] as const;
export const taskPermission = ["task.view", "task.create"] as const;
export const rolePermission = ["roles.create", "roles.view"] as const;

export const permissions = [
  ...userPermission,
  ...taskPermission,
  ...rolePermission,
] as const;

export type Permission = (typeof permissions)[number];

export const hasAccess = (
  user: IUser | null,
  ...permissions: Permission[]
): boolean => {
  if (!user) {
    return false;
  }
  if (user.role === "admin") {
    return true;
  } else {
    const userPermissions = user?.accessController?.hasPermission.split(",");
    if (!userPermissions?.length) {
      return false;
    }
    return permissions.some((permission) =>
      userPermissions.includes(permission)
    );
  }
};

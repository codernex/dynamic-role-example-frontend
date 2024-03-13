/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface IAccessController {
  id: string;
  name: string;
  hasPermission: string;
}
interface IUser {
  id: string;
  name?: string;
  mobile: string;
  isVerified: true;
  role: "admin" | "user";
  accessController: IAccessController;
}

interface ITask {
  name: string;
  id: string;
}

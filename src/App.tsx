import { Route, Routes } from "react-router-dom";
import { ProtectedLayout } from "./components/protected";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import Dashboard from "./pages/dashboard";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import { hasAccess } from "./lib/utils";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedLayout fallback="/login" />}>
        <Route index element={<AuthorizedLayout children={<Dashboard />} />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;

const AuthorizedLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const user = useAuthUser<IUser>();
  const signOut = useSignOut();

  if (
    !hasAccess(
      user,
      "user.view",
      "user.create",
      "user.update",
      "roles.create",
      "roles.view",
      "task.create",
      "task.view"
    )
  ) {
    setTimeout(() => {
      const signedOut = signOut();

      if (signedOut) {
        window.location.href = "/login";
      }
    }, 1000);
    return (
      <div className="bg-slate-900 h-screen flex flex-col text-white space-y-3 items-center justify-center">
        <h1 className=" text-center font-semibold text-3xl">
          You Don't Have Access TO Visit This Page
        </h1>
        <p>You will be automatically logged out after 2 seconds</p>
      </div>
    );
  }
  return children;
};

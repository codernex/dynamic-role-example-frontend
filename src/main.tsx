import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import AuthProvider from "react-auth-kit/AuthProvider";
import createStore from "react-auth-kit/createStore";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

const store = createStore({
  authName: "_auth",
  authType: "localstorage",
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider store={store}>
    <BrowserRouter>
      <Toaster />
      <App />
    </BrowserRouter>
  </AuthProvider>
);

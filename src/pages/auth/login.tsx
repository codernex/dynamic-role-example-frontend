import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import { useMemo } from "react";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "@/lib/utils";
const userLoginSchema = z.object({
  mobile: z.string().min(11, { message: "Enter a valid mobile number" }),
  password: z.string().min(4, "At least 6 characters required"),
});

type UserLoginSchema = z.infer<typeof userLoginSchema>;

const Login = () => {
  const auth = useIsAuthenticated();
  const isAuthentiacted = useMemo(() => auth(), [auth]);
  const signIn = useSignIn();
  const navigate = useNavigate();
  const form = useForm<UserLoginSchema>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      mobile: "",
      password: "",
    },
  });

  if (isAuthentiacted) {
    return Navigate({
      to: "/",
    });
  }

  const submit = (data: UserLoginSchema) => {
    api
      .post("/users/login", data)
      .then((res: any) => {
        if (res.data) {
          signIn({
            auth: {
              token: res.data.accessToken,
              type: "bearer",
            },
            userState: res.data.user,
          });
          navigate("/");
        }
      })
      .catch((err) => {
        toast.error(err.response?.data?.message);
      });
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white">
      <Form {...form}>
        <form
          action=""
          className="bg-white text-slate-950 min-w-[400px] px-4 py-3 rounded-xl space-y-3"
          onSubmit={form.handleSubmit(submit)}
        >
          <h2 className="text-center text-2xl font-semibold">Login</h2>
          <FormField
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile</FormLabel>
                <FormControl>
                  <Input
                    className="text-black"
                    placeholder="01888******"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            name="mobile"
            control={form.control}
          />
          <FormField
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    className="text-black"
                    placeholder="*****"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            name="password"
            control={form.control}
          />
          <div className="flex items-center justify-between">
            <Button type="submit">Login</Button>
            <Link className="text-muted-foreground underline" to={"/register"}>
              Don't have an account?
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Login;

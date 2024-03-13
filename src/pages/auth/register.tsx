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
import { useMemo, useState } from "react";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "@/lib/utils";
const userSignUpSchema = z.object({
  mobile: z.string().min(11, { message: "Enter a valid mobile number" }),
  password: z.string().min(4, "At least 6 characters required"),
  name: z.string().optional(),
});
const userOtpSchema = z.object({
  userId: z.string(),
  otp: z.string().min(4, "Enter a valid otp"),
});

type UserOtpSchema = z.infer<typeof userOtpSchema>;
type UserSignUpSchema = z.infer<typeof userSignUpSchema>;

const Register = () => {
  const auth = useIsAuthenticated();
  const isAuthentiacted = useMemo(() => auth(), [auth]);
  const [userRegistered, setUserRegistered] = useState<{
    userId: string;
    otpSend: boolean;
  }>({
    userId: "",
    otpSend: false,
  });
  const form = useForm<UserSignUpSchema>({
    resolver: zodResolver(userSignUpSchema),
    defaultValues: {
      mobile: "",
      password: "",
      name: "",
    },
  });

  if (isAuthentiacted) {
    return Navigate({
      to: "/",
    });
  }

  const submit = (data: UserSignUpSchema) => {
    api
      .post("/users", data)
      .then((res: any) => {
        if (res.data) {
          setUserRegistered({
            userId: res.data.user.id,
            otpSend: res.data.otpSend,
          });
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  if (userRegistered.otpSend) {
    return <VerifyOtp userId={userRegistered.userId} />;
  } else
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white">
        <Form {...form}>
          <form
            action=""
            className="bg-white text-slate-950 min-w-[400px] px-4 py-3 rounded-xl space-y-3"
            onSubmit={form.handleSubmit(submit)}
          >
            <h2 className="text-center text-2xl font-semibold">Sign UP</h2>
            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      className="text-black"
                      placeholder="Borhan U."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              name="name"
              control={form.control}
            />
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
              <Button type="submit">SignUp</Button>
              <Link className="text-muted-foreground underline" to={"/login"}>
                Already have an account?
              </Link>
            </div>
          </form>
        </Form>
      </div>
    );
};

export default Register;

const VerifyOtp: React.FC<{ userId: string }> = ({ userId }) => {
  const signIn = useSignIn();
  const navigate = useNavigate();
  const form = useForm<UserOtpSchema>({
    resolver: zodResolver(userOtpSchema),
    defaultValues: {
      userId,
      otp: "",
    },
  });

  const submit = (data: UserOtpSchema) => {
    api
      .post("/users/verify", data)
      .then((res) => {
        if (res.data) {
          if (res.data.user.isVerified === true) {
            signIn({
              userState: res.data.user,
              auth: {
                token: res.data.accessToken,
                type: "bearer",
              },
            });
            navigate("/", { replace: true });
          }
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message);
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
          <h2 className="text-center text-2xl font-semibold">Enter Your OTP</h2>
          <FormField
            render={({ field }) => (
              <FormItem>
                <FormLabel>OTP</FormLabel>
                <FormControl>
                  <Input className="text-black" placeholder="****" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            name="otp"
            control={form.control}
          />

          <div className="flex items-center justify-between">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

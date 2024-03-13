import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Permission,
  api,
  hasAccess,
  rolePermission,
  taskPermission,
  userPermission,
} from "@/lib/utils";
import { useStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { SetStateAction, memo, useCallback, useEffect, useState } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

export default function AdminUser() {
  const auth = useAuthUser<IUser>();
  const signOut = useSignOut();

  return (
    <div>
      <div className="w-full max-w-7xl mx-auto py-4 flex justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button
          onClick={() => {
            const isSignOut = signOut();

            if (isSignOut) {
              window.location.href = "/login";
            }
          }}
          className="bg-muted text-muted-foreground hover:bg-slate-200 hover:text-slate-900"
        >
          Log Out
        </Button>
      </div>
      <Tabs
        defaultValue={
          hasAccess(auth, "roles.view")
            ? "account"
            : hasAccess(auth, "user.view")
            ? "password"
            : hasAccess(auth, "task.view")
            ? "tasks"
            : "default"
        }
        className="w-full flex flex-col items-center"
      >
        <TabsList className="w-full max-w-7xl mx-auto">
          {hasAccess(auth, "roles.view") && (
            <TabsTrigger value="account">Roles</TabsTrigger>
          )}
          {hasAccess(auth, "user.view", "user.create", "user.update") && (
            <TabsTrigger value="password">Manage Users</TabsTrigger>
          )}

          {hasAccess(auth, "task.view", "task.create") && (
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          )}
        </TabsList>
        <TabsContent className="w-full max-w-7xl mx-auto" value="default">
          <div className="w-full bg-white rounded-md text-slate-950 px-4 py-6 space-y-6">
            <p>Welcome To Dashboard</p>
          </div>
        </TabsContent>
        {hasAccess(auth, "roles.view") && (
          <TabsContent className="w-full max-w-7xl mx-auto" value="account">
            <RolesTab user={auth} />
          </TabsContent>
        )}
        <TabsContent className="w-full max-w-7xl mx-auto" value="password">
          <ManageUsersTab user={auth} />
        </TabsContent>
        <TabsContent className="w-full max-w-7xl mx-auto" value="tasks">
          <TasksTab user={auth} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const RolesTab: React.FC<{ user: IUser | null }> = memo(({ user }) => {
  const { roles, setRoles } = useStore();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (hasAccess(user, "roles.view")) {
      api.get("/roles").then((res) => {
        setRoles(res.data);
      });
    }
  }, [user, setRoles]);

  return (
    <div className="w-full bg-white rounded-md text-slate-950 px-4 py-6 space-y-6">
      {hasAccess(user, "roles.view") && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Roles:</h2>
            {hasAccess(user, "roles.create") && (
              <Button onClick={() => setOpen(true)}>Add Role</Button>
            )}
          </div>
          <Table>
            <TableCaption>A List of Users</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Permissions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="w-[100px]">
                    {role.id.substring(0, 5) + "..."}
                  </TableCell>
                  <TableCell>{role?.name}</TableCell>
                  <TableCell>{role.hasPermission}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      <CreateRoleModal open={open} setOpen={setOpen} />
    </div>
  );
});

const createRoleSchema = z.object({
  name: z.string().min(1, { message: "Role name is required" }),
  hasPermission: z.string().min(1, { message: "Permission is required" }),
});

const CreateRoleModal: React.FC<{
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}> = memo(({ open, setOpen }) => {
  const { createRole } = useStore();
  const [permissionStr, setPermissionStr] = useState<string[]>([]);
  const [selectAllUserPermission, setSelectAllUserPermission] = useState(false);
  const [viewUserPermission, setViewUserPermission] = useState(false);
  const [createUserPermission, setCreateUserPermission] = useState(false);
  const [updateUserPermission, setUpdateUserPermission] = useState(false);
  const [selectAllRolePermission, setSelectAllRolePermission] = useState(false);
  const [viewRolePermission, setViewRolePermission] = useState(false);
  const [createRolePermission, setCreateRolePermission] = useState(false);
  const [selectAllTaskPermission, setSelectAllTaskPermission] = useState(false);
  const [viewTaskPermission, setViewTaskPermission] = useState(false);
  const [createTaskPermission, setCreateTaskPermission] = useState(false);

  const handleCheckBox = useCallback(
    (
      setCheckBox: React.Dispatch<React.SetStateAction<boolean>>,
      permission: Permission
    ) => {
      if (permissionStr.includes(permission)) {
        setPermissionStr((prev) => prev.filter((item) => item !== permission));
      } else {
        setPermissionStr((prev) => [...prev, permission]);
      }
      setCheckBox((prev) => !prev);
    },
    [permissionStr]
  );
  const form = useForm<z.infer<typeof createRoleSchema>>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      hasPermission: "",
    },
  });

  useEffect(() => {
    form.setValue("hasPermission", permissionStr.join(","));
  }, [permissionStr, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogHeader>
        <h2 className="text-2xl font-semibold">Create a Role:</h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              api
                .post("/roles", data)
                .then((res) => {
                  createRole(res.data);
                  toast.success("New Role Created");
                })
                .catch((err) => {
                  toast.error(err?.response?.data?.message);
                });
            })}
            className="space-y-10 items-center"
          >
            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: User" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              name="name"
              control={form.control}
            />
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">User</h2>

                <div className="flex items-center">
                  <FormControl>
                    <Checkbox
                      checked={selectAllUserPermission}
                      onCheckedChange={() => {
                        if (!selectAllUserPermission) {
                          // Add permissions when checkbox is checked
                          setPermissionStr((prev) => [
                            ...prev,
                            ...userPermission.filter(
                              (item) => !prev.includes(item as any)
                            ),
                          ]);
                        } else {
                          // Remove permissions when checkbox is unchecked
                          setPermissionStr((prev) =>
                            prev.filter(
                              (item) => !userPermission.includes(item as any)
                            )
                          );
                        }
                        setSelectAllUserPermission((prev) => !prev);
                        setViewUserPermission((prev) => !prev);
                        setCreateUserPermission((prev) => !prev);
                        setUpdateUserPermission((prev) => !prev);
                      }}
                    />
                  </FormControl>
                  <p>Select All</p>
                </div>
                <div className="space-y-4 min-w-[200px]">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={viewUserPermission}
                      onCheckedChange={() => {
                        handleCheckBox(setViewUserPermission, "user.view");
                      }}
                    />
                    <FormLabel>View User</FormLabel>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={createUserPermission}
                      onCheckedChange={() => {
                        handleCheckBox(setCreateUserPermission, "user.create");
                      }}
                    />
                    <FormLabel>Create User</FormLabel>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={updateUserPermission}
                      onCheckedChange={() => {
                        handleCheckBox(setUpdateUserPermission, "user.update");
                      }}
                    />
                    <FormLabel>Update User</FormLabel>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Role</h2>

                <div className="flex items-center">
                  <FormControl>
                    <Checkbox
                      checked={selectAllRolePermission}
                      onCheckedChange={() => {
                        if (!selectAllRolePermission) {
                          // Add permissions when checkbox is checked
                          setPermissionStr((prev) => [
                            ...prev,
                            ...rolePermission.filter(
                              (item) => !prev.includes(item as any)
                            ),
                          ]);
                        } else {
                          // Remove permissions when checkbox is unchecked
                          setPermissionStr((prev) =>
                            prev.filter(
                              (item) => !rolePermission.includes(item as any)
                            )
                          );
                        }
                        setSelectAllRolePermission((prev) => !prev);
                        setViewRolePermission((prev) => !prev);
                        setCreateRolePermission((prev) => !prev);
                      }}
                    />
                  </FormControl>
                  <p>Select All</p>
                </div>
                <div className="space-y-4 min-w-[200px]">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={viewRolePermission}
                      onCheckedChange={() => {
                        handleCheckBox(setViewRolePermission, "roles.view");
                      }}
                    />
                    <FormLabel>View Role</FormLabel>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={createRolePermission}
                      onCheckedChange={() => {
                        handleCheckBox(setCreateRolePermission, "roles.create");
                      }}
                    />
                    <FormLabel>Create Role</FormLabel>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Task</h2>

                <div className="flex items-center">
                  <FormControl>
                    <Checkbox
                      checked={selectAllTaskPermission}
                      onCheckedChange={() => {
                        if (!selectAllTaskPermission) {
                          // Add permissions when checkbox is checked
                          setPermissionStr((prev) => [
                            ...prev,
                            ...taskPermission.filter(
                              (item) => !prev.includes(item as any)
                            ),
                          ]);
                        } else {
                          // Remove permissions when checkbox is unchecked
                          setPermissionStr((prev) =>
                            prev.filter(
                              (item) => !taskPermission.includes(item as any)
                            )
                          );
                        }
                        setSelectAllTaskPermission((prev) => !prev);
                        setViewTaskPermission((prev) => !prev);
                        setCreateTaskPermission((prev) => !prev);
                      }}
                    />
                  </FormControl>
                  <p>Select All</p>
                </div>
                <div className="space-y-4 min-w-[200px]">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={viewTaskPermission}
                      onCheckedChange={() => {
                        handleCheckBox(setViewTaskPermission, "task.view");
                      }}
                    />
                    <FormLabel>View Task</FormLabel>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={createTaskPermission}
                      onCheckedChange={() => {
                        handleCheckBox(setCreateTaskPermission, "task.create");
                      }}
                    />
                    <FormLabel>Create Task</FormLabel>
                  </div>
                </div>
              </div>
            </div>
            <Button>Create</Button>
          </form>
        </Form>
      </DialogHeader>
    </Dialog>
  );
});

const createTaskSchema = z.object({
  name: z.string().min(1, "Task name is required"),
});

const TasksTab: React.FC<{ user: IUser | null }> = memo(({ user }) => {
  const { setTask, tasks, createTask } = useStore();
  const form = useForm<z.infer<typeof createTaskSchema>>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (hasAccess(user, "task.view")) {
      api.get("/tasks").then((res) => {
        setTask(res.data);
      });
    }
  }, [setTask, user]);
  return (
    <div className="w-full bg-white rounded-md text-slate-950 px-4 py-6 space-y-6">
      {hasAccess(user, "task.view") && (
        <>
          <h2 className="text-2xl font-semibold">Tasks:</h2>
          {tasks.map((task) => {
            return <li key={task.id}>{task.name}</li>;
          })}
        </>
      )}

      {hasAccess(user, "task.create") && (
        <>
          <h2 className="text-2xl font-semibold">Create a task:</h2>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => {
                api
                  .post("/tasks", data)
                  .then((res) => {
                    createTask(res.data);
                    toast.success("New Task Created");
                  })
                  .catch((err) => {
                    toast.error(err?.response?.data?.message);
                  });
              })}
              className="space-y-3 items-center"
            >
              <FormField
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Demo Task" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                name="name"
                control={form.control}
              />
              <Button>Create</Button>
            </form>
          </Form>
        </>
      )}
    </div>
  );
});

const ManageUsersTab: React.FC<{ user: IUser | null }> = memo(({ user }) => {
  const { users, setUser } = useStore();
  const [createUserModal, setCreateUserModal] = useState(false);
  const [updateUserModal, setUpdateUserModal] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<IUser | null>(null);

  useEffect(() => {
    if (hasAccess(user, "user.view")) {
      api.get("/users").then((res) => {
        setUser(res.data);
      });
    }
  }, [setUser, user]);
  return (
    <div className="w-full bg-white rounded-md text-slate-950 px-4 py-6 space-y-6">
      {hasAccess(user, "user.view") && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Users:</h2>
            {hasAccess(user, "user.create") && (
              <Button onClick={() => setCreateUserModal(true)}>Add User</Button>
            )}
          </div>
          <Table>
            <TableCaption>A List of Users</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>NAME</TableHead>
                <TableHead>MOBILE</TableHead>
                <TableHead className="text-right">Role</TableHead>
                {hasAccess(user, "user.update") && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((userData) => (
                <TableRow key={userData.id}>
                  <TableCell className="w-[100px]">
                    {userData?.id?.substring(0, 5) + "..."}
                  </TableCell>
                  <TableCell>{userData?.name}</TableCell>
                  <TableCell>{userData.mobile}</TableCell>
                  <TableCell className="text-right">
                    {userData?.accessController?.name || "Default"}
                  </TableCell>
                  {hasAccess(user, "user.update") && (
                    <TableCell className="text-right">
                      <Button
                        onClick={() => {
                          setUpdateUserModal(true);
                          setUserToUpdate(userData);
                        }}
                      >
                        Update
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      <CreateUserModal open={createUserModal} setOpen={setCreateUserModal} />
      <UpdateUserModal
        user={userToUpdate}
        open={updateUserModal}
        setOpen={setUpdateUserModal}
      />
    </div>
  );
});

const userSignUpSchema = z.object({
  mobile: z.string().min(11, { message: "Enter a valid mobile number" }),
  password: z.string().min(4, "At least 6 characters required"),
  name: z.string().optional(),
  roleId: z.string().uuid("Must be a valid role"),
});
type UserSignUpSchema = z.infer<typeof userSignUpSchema>;
const CreateUserModal: React.FC<{
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}> = memo(({ open, setOpen }) => {
  const { createUser, roles } = useStore();
  const form = useForm<UserSignUpSchema>({
    resolver: zodResolver(userSignUpSchema),
    defaultValues: {
      mobile: "",
      password: "",
      name: "",
      roleId: "",
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader className="font-semibold text-xl">
          Create A New User
        </DialogHeader>
        <Form {...form}>
          <form
            action=""
            className="bg-white text-slate-950 min-w-[400px] px-4 py-3 rounded-xl space-y-3"
            onSubmit={form.handleSubmit((data) => {
              api
                .post("/users/new", data)
                .then((res) => {
                  setOpen(false);
                  createUser(res.data);
                  toast.success("New User Created");
                })
                .catch((err) => {
                  toast.error(err?.response?.data?.message);
                });
            })}
          >
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
            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select A Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles?.map((role, i) => {
                          if (role.name)
                            return (
                              <SelectItem key={i} value={role.id}>
                                {role.name}
                              </SelectItem>
                            );
                          else return null;
                        })}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              name="roleId"
              control={form.control}
            />
            <div className="flex items-center justify-between">
              <Button type="submit">Create User</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});

const updateUserSchema = z.object({
  mobile: z.string().min(11, { message: "Enter a valid mobile number" }),
  password: z.string().optional(),
  name: z.string().optional(),
  roleId: z.string().uuid("Must be a valid role"),
});

const UpdateUserModal: React.FC<{
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  user: IUser | null;
}> = memo(({ open, setOpen, user }) => {
  const { setUser, roles, users } = useStore();
  const form = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      mobile: user?.mobile,
      password: "",
      name: user?.name,
      roleId: user?.accessController?.id,
    },
    values: user
      ? {
          mobile: user?.mobile,
          password: "",
          name: user?.name,
          roleId: user?.accessController?.id,
        }
      : {
          mobile: "",
          password: "",
          roleId: "",
          name: "",
        },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader className="font-semibold text-xl">
          Update User
        </DialogHeader>
        <Form {...form}>
          <form
            action=""
            className="bg-white text-slate-950 min-w-[400px] px-4 py-3 rounded-xl space-y-3"
            onSubmit={form.handleSubmit((data) => {
              api
                .patch(`/users/${user?.id}`, data)
                .then((res) => {
                  setOpen(false);
                  setUser(
                    users.map((u) => (u.id === res.data.id ? res.data : u))
                  );
                  toast.success("User Updated");
                })
                .catch((err) => {
                  toast.error(err?.response?.data?.message);
                });
            })}
          >
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
            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select A Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles?.map((role, i) => {
                          if (role.name)
                            return (
                              <SelectItem key={i} value={role.id}>
                                {role.name}
                              </SelectItem>
                            );
                          else return null;
                        })}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              name="roleId"
              control={form.control}
            />
            <div className="flex items-center justify-between">
              <Button type="submit">Update User</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});

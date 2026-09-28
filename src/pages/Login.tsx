import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole, Mail, HelpCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, type UserType } from "@/contexts/auth-context";
import { SchoolLogo } from "@/components/shared/SchoolLogo";
import { SupportDialog } from "@/components/ui/SupportDialog";
import { StaffRole } from "@/lib/types/common";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(1, "Password is required.").min(6, "Password must contain at least 6 characters."),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the Terms of Service and Privacy Policy"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [accountType, setAccountType] = useState<UserType>("staff");
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", agreeToTerms: false },
  });

  useEffect(() => {
    if (isAuthenticated) {
      if (accountType === "parent") {
        navigate("/parent/dashboard", { replace: true });
      } else {
        // Check user role and redirect accordingly
        const user = localStorage.getItem("user_data");
        if (user) {
          const userData = JSON.parse(user);
          if (userData.user && "role" in userData.user) {
            const role = userData.user.role;
            if (role === StaffRole.BURSARY) {
              navigate("/bursary/dashboard", { replace: true });
            } else {
              navigate("/admin/dashboard", { replace: true });
            }
          } else {
            navigate("/admin/dashboard", { replace: true });
          }
        } else {
          navigate("/admin/dashboard", { replace: true });
        }
      }
    }
  }, [isAuthenticated, accountType, navigate]);

  const onSubmit = async (values: LoginValues) => {
    setSubmitError("");
    try {
      await login(values.email, values.password, accountType);
      
      // The auth context now handles the redirect based on role
      // So we don't need to navigate here anymore
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We could not sign you in. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.78fr)]">
      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-14 xl:px-20">
        <a href="/" className="inline-flex w-fit items-center gap-3 rounded-xl" aria-label="INPS School Portal home">
          <SchoolLogo size="custom" customSize="size-11" variant="icon" showBackground backgroundClassName="bg-primary text-primary-foreground shadow-sm" forceWhiteBackground />
          <span>
            <span className="block text-base font-extrabold tracking-wide text-primary">INPS SCHOOL</span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Management portal</span>
          </span>
        </a>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12 sm:py-16">
          <div className="mb-8">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-accent">Secure access</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">Welcome back</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              Sign in to manage learning, records, and school operations.
            </p>
          </div>

          <Tabs
            value={accountType}
            onValueChange={(value) => {
              setAccountType(value as UserType);
              setSubmitError("");
            }}
            className="mb-7"
          >
            <TabsList className="grid h-12 w-full grid-cols-2 rounded-xl bg-secondary p-1.5">
              <TabsTrigger value="staff" className="h-9 rounded-lg font-semibold data-[state=active]:bg-card data-[state=active]:text-primary">Staff login</TabsTrigger>
              <TabsTrigger value="parent" className="h-9 rounded-lg font-semibold data-[state=active]:bg-card data-[state=active]:text-primary">Parent login</TabsTrigger>
            </TabsList>
          </Tabs>

          {submitError && (
            <Alert variant="destructive" className="mb-5 rounded-xl bg-destructive/5">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder={accountType === "staff" ? "name@inps.edu.ng" : "parent@example.com"}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className="h-12 rounded-xl bg-card pl-11 text-base shadow-sm"
                  {...register("email")}
                />
              </div>
              {errors.email && <p id="email-error" className="text-sm font-medium text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className="h-12 rounded-xl bg-card px-11 text-base shadow-sm"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                </button>
              </div>
              {errors.password && <p id="password-error" className="text-sm font-medium text-destructive">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSupportDialogOpen(true)}
                className="text-sm text-accent hover:text-accent/80 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <Checkbox
                id="agree-terms"
                checked={watch("agreeToTerms")}
                onCheckedChange={(checked) => setValue("agreeToTerms", checked === true)}
                className="rounded border-input data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
              />
              <Label htmlFor="agree-terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I agree to the{" "}
                <Link to="/terms-of-service" className="text-accent hover:underline">
                  Terms of Service
                </Link>
                {" "}and{" "}
                <Link to="/privacy-policy" className="text-accent hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-sm font-medium text-destructive">{errors.agreeToTerms.message}</p>
            )}

            <Button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-xl font-semibold shadow-sm">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setSupportDialogOpen(true)}
              className="w-full rounded-xl font-semibold"
            >
              <HelpCircle className="mr-2 size-4" />
              Contact Admin
            </Button>
          </form>
        </div>
        
        {/* Footer with copyright and terms */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} International Nursery and Primary School. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Powered by <span className="font-semibold text-primary">Saint Tech Concept</span>
            </p>
          </div>
        </div>
      </section>
      
      {/* Right side - visible only on large screens */}
      <section className="hidden lg:flex relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-primary/50" />
        <div className="relative z-10 flex h-full flex-col justify-center px-12 text-center">
          <div className="flex justify-center mb-8">
            <SchoolLogo size="large" variant="full" forceWhiteBackground />
          </div>
          <h2 className="text-4xl font-extrabold text-primary-foreground mb-4">INPS School Portal</h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-md mx-auto">
            Empowering education through technology. Manage students, staff, classes, and results all in one place.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary-foreground/70">
              <LockKeyhole className="size-5" />
              <span>Secure & Reliable</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/70">
              <Mail className="size-5" />
              <span>Real-time Notifications</span>
            </div>
          </div>
          
          {/* Footer with copyright */}
          <div className="mt-12 pt-6 border-t border-primary-foreground/20">
            <div className="text-center space-y-1">
              <p className="text-xs text-primary-foreground/60">
                © {new Date().getFullYear()} International Nursery and Primary School. All rights reserved.
              </p>
              <p className="text-xs text-primary-foreground/60">
                Powered by <span className="font-semibold text-primary-foreground">Saint Tech Concept</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support Dialog */}
      <SupportDialog open={supportDialogOpen} onOpenChange={setSupportDialogOpen} />
    </main>
  );
}

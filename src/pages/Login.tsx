import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye, EyeOff, LockKeyhole, Mail, HelpCircle,
  ClipboardList, BarChart3, Users, GraduationCap, Wallet, MessageSquareText
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
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

const formVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    rotateY: 100 * direction,
    transition: { duration: 0.3, ease: "easeIn" },
  }),
  animate: {
    opacity: 1,
    rotateY: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  exit: (direction: number) => ({
    opacity: 0,
    rotateY: -100 * direction,
    transition: { duration: 0.3, ease: "easeIn" },
  }),
};

const heroContainerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const heroItemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.3, ease: "easeIn" } },
};

const accountTypes = [
  { id: 'staff', label: 'Staff Login' },
  { id: 'parent', label: 'Parent Login' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [accountType, setAccountType] = useState<UserType>("staff");
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  const [animationDirection, setAnimationDirection] = useState(1);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", agreeToTerms: false },
  });

  useEffect(() => {
    if (isAuthenticated) {
      if (accountType === "parent") {
        navigate("/parent/dashboard", { replace: true });
      } else {
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
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We could not sign you in. Please try again.");
    }
  };

  const handleAccountTypeChange = (value: string) => {
    const newType = value as UserType;
    setAnimationDirection(newType === 'staff' ? -1 : 1);
    setAccountType(newType);
    setSubmitError("");
    reset({ email: "", password: "", agreeToTerms: watch("agreeToTerms") });
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
            onValueChange={handleAccountTypeChange}
            className="mb-7"
          >
            <TabsList className="relative grid h-12 w-full grid-cols-2 rounded-xl bg-secondary p-1.5">
              {accountTypes.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="relative h-9 rounded-lg font-semibold text-muted-foreground data-[state=active]:text-primary"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  {accountType === tab.id && (
                    <motion.span
                      layoutId="active-tab-indicator"
                      className="absolute inset-0 z-10 bg-card shadow-sm"
                      style={{ borderRadius: 8 }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-20">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative" style={{ perspective: "1500px" }}>
            <AnimatePresence mode="wait" custom={animationDirection}>
              <motion.div
                key={accountType}
                custom={animationDirection}
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ transformStyle: "preserve-3d" }}
              >
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
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        <div className="mt-auto pt-6 border-t border-border">
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
      
      <section className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-blue-700 via-purple-700 to-indigo-800 animated-gradient">
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div className="flex justify-center">
            <SchoolLogo size="large" variant="full" forceWhiteBackground />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={accountType}
              variants={heroContainerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center text-center"
            >
              {accountType === 'staff' ? (
                <>
                  <motion.h2 variants={heroItemVariants} className="text-3xl font-extrabold mb-4">Streamline School Management</motion.h2>
                  <motion.p variants={heroItemVariants} className="text-lg text-primary-foreground/80 mb-8 max-w-md mx-auto">
                    Access powerful tools to manage student data, track academic progress, and collaborate with colleagues efficiently.
                  </motion.p>
                  <div className="space-y-4 text-left">
                    <motion.div variants={heroItemVariants} className="flex items-center gap-3 text-primary-foreground/80">
                      <ClipboardList className="size-5 flex-shrink-0" />
                      <span>Comprehensive Student Records</span>
                    </motion.div>
                    <motion.div variants={heroItemVariants} className="flex items-center gap-3 text-primary-foreground/80">
                      <BarChart3 className="size-5 flex-shrink-0" />
                      <span>Insightful Performance Analytics</span>
                    </motion.div>
                    <motion.div variants={heroItemVariants} className="flex items-center gap-3 text-primary-foreground/80">
                      <Users className="size-5 flex-shrink-0" />
                      <span>Seamless Staff Collaboration</span>
                    </motion.div>
                  </div>
                </>
              ) : (
                <>
                  <motion.h2 variants={heroItemVariants} className="text-3xl font-extrabold mb-4">Your Child's Journey, Simplified</motion.h2>
                  <motion.p variants={heroItemVariants} className="text-lg text-primary-foreground/80 mb-8 max-w-md mx-auto">
                    Stay informed and engaged in your child's education. Track progress, view results, and handle payments with ease.
                  </motion.p>
                  <div className="space-y-4 text-left">
                    <motion.div variants={heroItemVariants} className="flex items-center gap-3 text-primary-foreground/80">
                      <GraduationCap className="size-5 flex-shrink-0" />
                      <span>Real-time Academic Updates</span>
                    </motion.div>
                    <motion.div variants={heroItemVariants} className="flex items-center gap-3 text-primary-foreground/80">
                      <Wallet className="size-5 flex-shrink-0" />
                      <span>Convenient Fee Payments</span>
                    </motion.div>
                    <motion.div variants={heroItemVariants} className="flex items-center gap-3 text-primary-foreground/80">
                      <MessageSquareText className="size-5 flex-shrink-0" />
                      <span>Direct School Communication</span>
                    </motion.div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
          
          <div className="pt-6 border-t border-primary-foreground/20">
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

      <SupportDialog open={supportDialogOpen} onOpenChange={setSupportDialogOpen} />
    </main>
  );
}
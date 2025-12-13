'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/features/authSlice';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BookOpen, CheckCircle2, GraduationCap, Library, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleDevLogin = async () => {
    try {
      const data = await authService.loginDev("student@example.com");
      dispatch(setCredentials({ user: data.user, token: data.token }));
      toast.success('Dev Login Successful!');
      router.push('/');
    } catch (error) {
      console.error(error);
      toast.error('Dev Login Failed');
    }
  };

  const handleSuccess = async (credentialResponse: any) => {
    try {
      if (credentialResponse.credential) {
        // In a real scenario, we verify this with the backend
        // For now, if the backend endpoint is not ready, this might error.
        // If testing without backend, one might mock this.
        const data = await authService.loginWithGoogle(credentialResponse.credential);
        dispatch(setCredentials({ user: data.user, token: data.token }));
        toast.success('Login Successful!');
        router.push('/');
      }
    } catch (error) {
      console.error(error);
      toast.error('Login Failed');
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden relative">
      {/* Absolute blurry shapes for background effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />


      {/* Left Column: Branding & Testimonials (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gray-50 border-r dark:bg-gray-950/20 backdrop-blur-3xl z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
            R
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground">RAG Student</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
            Unlock your <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-violet-600">learning potential</span>
            <br /> with AI.
          </h2>
          <div className="space-y-4 max-w-md">
            <div className="flex items-start gap-3 text-muted-foreground">
              <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
              <p className="text-lg">Chat with your PDF textbooks and lecture notes.</p>
            </div>
            <div className="flex items-start gap-3 text-muted-foreground">
              <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
              <p className="text-lg">Get instant answers with precise citations.</p>
            </div>
            <div className="flex items-start gap-3 text-muted-foreground">
              <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
              <p className="text-lg">Generate summaries and study guides in seconds.</p>
            </div>
          </div>
        </div>

        <div className="relative p-6 rounded-3xl bg-white dark:bg-gray-900 border shadow-sm">
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((s) => <Sparkles key={s} size={16} className="text-yellow-400 fill-yellow-400" />)}
          </div>
          <p className="text-foreground/80 font-medium italic mb-4">
            "This tool completely changed how I study. I can find any concept in my 500-page textbook in seconds."
          </p>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-linear-to-br from-pink-500 to-orange-400" />
            <div>
              <p className="text-sm font-semibold text-foreground">Sarah J.</p>
              <p className="text-xs text-muted-foreground">Medical Student</p>
            </div>
          </div>
        </div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      </div>

      {/* Right Column: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-2 text-base">
              Sign in to your account to continue your research.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Continue with
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4 items-center w-full">
              <div className="w-full flex justify-center"> {/* Container to center the button */}
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={() => toast.error('Google Login Failed')}
                  theme="filled_blue"
                  shape="rectangular"
                  size="large"
                  width="100%"
                  text="continue_with"
                />
              </div>
              <div className="w-full flex justify-center">
                <button
                  onClick={handleDevLogin}
                  className="w-full max-w-[240px] px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-medium transition-colors"
                >
                  Dev Login
                </button>
              </div>
            </div>
          </div>

          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

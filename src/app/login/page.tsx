import GoogleLoginButton from '@/components/GoogleLoginButton';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0E] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <GoogleLoginButton />
      </div>
    </div>
  );
}
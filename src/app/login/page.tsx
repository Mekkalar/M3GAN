import LoginPages from './loginpages';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 font-sans">
            <LoginPages endpoint={'/api/auth/login'} />
        </div>
    );
}

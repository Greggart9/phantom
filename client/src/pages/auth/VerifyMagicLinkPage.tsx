import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function VerifyMagicLinkPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyMagicLink } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Authenticating your session...');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in URL.');
      return;
    }

    const verify = async () => {
      const res = await verifyMagicLink(token);
      if (res.success) {
        setStatus('success');
        setMessage('You are now signed in to Phantom.');
        setTimeout(() => {
          navigate('/shop');
        }, 2000);
      } else {
        setStatus('error');
        setMessage(res.message);
      }
    };

    verify();
  }, [token, verifyMagicLink, navigate]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#121110] text-white">
      <div className="max-w-md w-full p-8 border border-neutral-800 bg-neutral-950 text-center space-y-6">
        <span className="text-xs font-bold tracking-[0.3em] uppercase text-neutral-400">
          PHANTOM AUTHENTICATION
        </span>

        {status === 'verifying' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-sm text-neutral-300 font-normal">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <p className="text-base text-white font-medium">{message}</p>
            <p className="text-xs text-neutral-400">Redirecting you to the shop...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <p className="text-sm text-red-300">{message}</p>
            <Link
              to="/"
              className="mt-4 px-6 py-2.5 bg-white text-neutral-950 text-xs font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors"
            >
              Return Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

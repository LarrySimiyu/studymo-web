'use client';

import Image, { type StaticImageData } from 'next/image';
import googleIcon from '@/assets/google-icon.png';
import appleIcon from '@/assets/apple-icon.png';

type SocialAuthButtonsProps = {
  onGoogle: () => void;
  onApple: () => void;
  disabled?: boolean;
  error?: string | null;
};

export default function SocialAuthButtons({ onGoogle, onApple, disabled, error }: SocialAuthButtonsProps) {
  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div
          className="p-3 rounded-2xl text-sm text-center"
          style={{
            backgroundColor: 'var(--danger-subtle)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger)',
          }}
        >
          {error}
        </div>
      )}

      <ProviderButton icon={googleIcon} label="Continue with Google" onClick={onGoogle} disabled={disabled} />
      <ProviderButton icon={appleIcon} label="Continue with Apple" onClick={onApple} disabled={disabled} />
    </div>
  );
}

type ProviderButtonProps = {
  icon: StaticImageData;
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

function ProviderButton({ icon, label, onClick, disabled }: ProviderButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full min-h-[50px] py-3 px-5 rounded-full text-sm font-medium flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-md)',
        color: 'var(--text-1)',
      }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
    >
      <Image src={icon} alt="" width={18} height={18} className="shrink-0" />
      {label}
    </button>
  );
}

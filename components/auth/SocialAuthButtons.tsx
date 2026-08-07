'use client';

import Image, { type StaticImageData } from 'next/image';
import googleIcon from '@/assets/google-icon.png';
import appleIcon from '@/assets/apple-icon.png';
import { Button } from '@/components/ui/Button';

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
    <Button
      variant="outline"
      size="lg"
      onClick={onClick}
      disabled={disabled}
      className="w-full min-h-[50px] gap-3 bg-[var(--bg-card)] font-medium"
    >
      <Image src={icon} alt="" width={18} height={18} className="shrink-0" />
      {label}
    </Button>
  );
}

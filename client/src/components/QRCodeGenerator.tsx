
import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
}

export function QRCodeGenerator({ url, size = 300 }: QRCodeGeneratorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling({
        width: size,
        height: size,
        data: url,
        dotsOptions: {
          color: '#8B5CF6',
          type: 'rounded',
        },
        backgroundOptions: {
          color: '#0A0A0F',
        },
        cornersSquareOptions: {
          color: '#06B6D4',
          type: 'extra-rounded',
        },
        cornersDotOptions: {
          color: '#EC4899',
          type: 'dot',
        },
      });
    }

    if (ref.current) {
      ref.current.innerHTML = '';
      qrCode.current.append(ref.current);
    }
  }, [url, size]);

  const handleDownload = () => {
    qrCode.current?.download({
      name: 'neropage-qr',
      extension: 'png',
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={ref} className="rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg" />
      <Button onClick={handleDownload} variant="outline" className="gap-2">
        <Download className="w-4 h-4" />
        Download QR Code
      </Button>
    </div>
  );
}

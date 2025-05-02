import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QRCodeReader = ({ onScan }) => {
  const scannerRef = useRef(null);
  const isRunningRef = useRef(false); 
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          await scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (decodedText) => {
              onScan(decodedText);
              setDetected(true);
              setTimeout(() => setDetected(false), 1000);
              if (isRunningRef.current) {
                scanner.stop().then(() => {
                  isRunningRef.current = false;
                }).catch(() => {});
              }
            },
            (errorMessage) => {
              console.log("Scanning error", errorMessage);
            }
          );
          isRunningRef.current = true; 
        } else {
          console.error("No cameras found.");
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    startScanner();

    return () => {
      if (isRunningRef.current) {
        scanner.stop()
          .then(() => scanner.clear())
          .catch(() => {});
      }
    };
  }, [onScan]);

  return <div id="qr-reader" className={detected ? 'detected' : ''} />;
};

export default QRCodeReader;

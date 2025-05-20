// components/PackageScanner.jsx
import React, { useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const PackageScanner = ({ onDetected }) => {
    const scannerRef = useRef(null);
    const [manualCode, setManualCode] = useState('');

    React.useEffect(() => {
        const config = {
            fps: 10,
            qrbox: {
                width: 300,
                height: 100, 
            },
            formatsToSupport: [
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9
            ],
            disableFlip: false
        };

        const scanner = new Html5QrcodeScanner(
            'scanner',
            config,
            false
        );

        scanner.render(
            (decodedText) => {
                scanner.clear();
                onDetected(decodedText);
            },
            (errorMessage) => {
                // optional: console.warn(errorMessage);
            }
        );

        return () => {
            scanner.clear().catch(() => {});
        };
    }, [onDetected]);

    return (
        <div style={{ padding: 16 }}>
            <h2 style={{ textAlign: 'center' }}>สแกนบาร์โค้ด / QR Code</h2>
            <div id="scanner" style={{ marginBottom: 16 }} />

            <div style={{ textAlign: 'center', marginTop: 16 }}>
                <input
                    placeholder="กรอกรหัสด้วยตนเอง"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    style={{ padding: 8, width: '80%', fontSize: 16 }}
                />
                <br />
                <button
                    onClick={() => manualCode && onDetected(manualCode)}
                    style={{ marginTop: 12 }}
                >
                    ยืนยันรหัส
                </button>
            </div>
        </div>
    );
};

export default PackageScanner;

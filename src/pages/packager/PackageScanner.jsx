import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

const PackageScanner = ({ onClose, onDetected }) => {
    const scannerRef = useRef(null);
    const [manualCode, setManualCode] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    const startCamera = async () => {
        if (isScanning) return;
        const qr = new Html5Qrcode("qr-reader");
        scannerRef.current = qr;
        setIsScanning(true);
        try {
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length) {
                await qr.start(
                    { facingMode: "environment" }
                    , {
                        fps: 10,
                        qrbox: function (viewfinderWidth, viewfinderHeight) {
                            return { width: 0.6 * viewfinderWidth, height: 0.2 * viewfinderHeight };
                        }
                    }, (text) => {
                        qr.stop();
                        setIsScanning(false);
                        onDetected(text);
                    });
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        startCamera();
    })

    const stopCamera = async () => {
        if (scannerRef.current) {
            await scannerRef.current.stop();
            setIsScanning(false);
        }
    };

    const scanImageFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const qr = new Html5Qrcode("qr-reader");
        const result = await qr.scanFile(file, true);
        onDetected(result);
    };

    return (
        <div className="scan-backdrop">
            <button className="go-back-button" onClick={onClose}><FontAwesomeIcon icon={faChevronLeft} /> ย้อนกลับ</button>

            <h2>แสกน QR Code</h2>
            <p></p>

            <div id="qr-reader" className="qr-reader" />

            <div className="scan-button-row">
                <button onClick={startCamera}>📷 เปิดกล้อง</button>
                <button onClick={stopCamera}>🛑 หยุด</button>
                <label className="upload-button">
                    📁 รูป
                    <input type="file" accept="image/*" onChange={scanImageFile} hidden />
                </label>
            </div>

            <div className="manual-input-row">
                <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="กรอกรหัสด้วยตนเอง"
                />
                <button onClick={() => manualCode && onDetected(manualCode)}>ยืนยัน</button>
            </div>
        </div>
    );
};

export default PackageScanner;

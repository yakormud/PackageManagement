import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faExclamation, faVideoSlash } from '@fortawesome/free-solid-svg-icons';

const PackageScanner = ({ onClose, onDetected }) => {
    const scannerRef = useRef(null);
    const [manualCode, setManualCode] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    const [cameraErr, setCameraErr] = useState(null);

    const startCamera = async () => {
        if (isScanning) {
            console.log("RETURN")
            return;
        }
        const qr = new Html5Qrcode("qr-reader");
        scannerRef.current = qr;
        try {
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length) {
                setIsScanning(true);
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
            setIsScanning(false)
            setCameraErr(err)
            console.error(err);
            alert("ไม่สามารถเรียกใช้งานกล้องได้")
        }
    };

    useEffect(() => {
        startCamera();
    }, [])

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

            {!isScanning && (
                <div className="no-scan">
                    <FontAwesomeIcon icon={faVideoSlash} color="white" />
                    <p>
                        {cameraErr?.message === "Requested device not found"
                            ? "ไม่พบกล้องบนอุปกรณ์ของคุณ"
                            : cameraErr?.message || "ไม่สามารถเปิดกล้องได้"}
                    </p>
                </div>
            )}
            <div id="qr-reader" className="qr-reader" />

            <div className="scan-button-row">
                {!isScanning && <label onClick={() => startCamera()} className='mybtn btn-peel btn-white'>📷 เรียกใช้กล้อง</label>}
                {/* <button onClick={stopCamera}>🛑 หยุด</button> */}
                <label className="mybtn btn-peel btn-white">
                    📁 แสกนจากรูปภาพ
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
                <button className="mybtn" onClick={() => manualCode && onDetected(manualCode)}>ยืนยัน</button>
            </div>
        </div>
    );
};

export default PackageScanner;

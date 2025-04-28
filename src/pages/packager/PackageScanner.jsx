import React, { useEffect, useState } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';

const PackageScanner = ({ onDetected, onCancel }) => {
    const [cameraAllowed, setCameraAllowed] = useState(true);

    const handleRetryCameraAccess = () => {
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then(() => {
                setCameraAllowed(true);
            })
            .catch(() => {
                setCameraAllowed(false);
            });
    };

    useEffect(() => {
        handleRetryCameraAccess();
    }, []);

    return (
        <div className="scanner-overlay">
            {cameraAllowed ? (
                <>
                    <BarcodeScannerComponent
                        width={1000}
                        height={400}
                        delay={500}
                        onUpdate={(err, result) => {
                            if (result) {
                                console.log(result.text)
                            }
                        }}
                    />
                    <button onClick={onCancel}>ยกเลิก</button>
                </>
            ) : (
                <div style={{ textAlign: 'center' }}>
                    <p>ไม่สามารถเปิดกล้องได้</p>
                    <button onClick={handleRetryCameraAccess}>อนุญาตสิทธิ์การเข้าถึงกล้อง</button>
                    <div><button onClick={onCancel}>ปิด</button></div>
                </div>
            )}
        </div>
    );
};

export default PackageScanner;


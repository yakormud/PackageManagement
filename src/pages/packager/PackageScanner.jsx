import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faExclamation, faVideoSlash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const PackageScanner = ({ onClose, onDetected, isDeliverMode = false, isBarcode = false}) => {
    const scannerRef = useRef(null);
    const [manualCode, setManualCode] = useState('');
    const [isScanning, setIsScanning] = useState(false);


    const [isPicScan, setIsPicScan] = useState(false)
    const [cameraErr, setCameraErr] = useState(null);

    const startCamera = async () => {
        setIsPicScan(false);
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
                            if(isBarcode) {
                                return { width: 0.6 * viewfinderWidth, height: 0.2 * viewfinderHeight };
                            }else {
                                return { width: 0.3 * viewfinderWidth, height: 0.3 * viewfinderWidth };
                            }
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
            Swal.fire({
                icon: 'error',
                title: 'ไม่สามารถเรียกใช้งานกล้องได้',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            });
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
        setIsScanning(false);
        const qr = new Html5Qrcode("qr-reader");
        try {
            const result = await qr.scanFile(file, false);
            onDetected(result);
        } catch (error) {
            setIsPicScan(true);
            console.warn("Scan failed:", error);
        }

        e.target.value = null;
    };

    return (
        <div className="scan-backdrop">
            <button className="go-back-button" onClick={onClose}><FontAwesomeIcon icon={faChevronLeft} /> ย้อนกลับ</button>

            {!isScanning && !isPicScan && (
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
            {isPicScan && <p style={{ marginTop: "50px", marginBottom: "50px" }}>ไม่สามารถอ่านค่าจากรูปดังกล่าวได้</p>}

            <div className="scan-button-row">

                {/* ตอนแสกน */}
                {isScanning ? (
                    <>
                        <label onClick={() => stopCamera()} className='mybtn btn-peel btn-white'>📷 ปิดกล้อง</label>
                        <label className="mybtn btn-peel btn-white">
                            📁 แสกนจากรูปภาพ
                            <input type="file" accept="image/*" onChange={scanImageFile} hidden />
                        </label>
                    </>
                ) : isPicScan ? (
                    <>
                    </>
                ) : (
                    <>
                        <label onClick={() => startCamera()} className='mybtn btn-peel btn-white'>📷 เรียกใช้กล้อง</label>
                        <label className="mybtn btn-peel btn-white">
                            📁 แสกนจากรูปภาพ
                            <input type="file" accept="image/*" onChange={scanImageFile} hidden />
                        </label>
                    </>
                )}

                {/* ตอนอัพรูปละไม่เจอรูป */}
                {isPicScan && (
                    <>
                        <label onClick={() => startCamera()} className='mybtn btn-peel btn-white'>📷 แสกนจากกล้องแทน</label>
                        <label className="mybtn btn-peel btn-white">
                            📁 เลือกภาพใหม่
                            <input type="file" accept="image/*" onChange={scanImageFile} hidden />
                        </label>
                    </>
                )}


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
            {isDeliverMode && <h5 style={{cursor:"pointer"}} onClick={()=> onDetected('-99')}>นำจ่ายพัสดุที่ไม่มีผู้เช่าในระบบ</h5>}
        </div>
    );
};

export default PackageScanner;

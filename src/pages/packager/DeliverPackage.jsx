import React, { useEffect } from 'react'
import { useState } from 'react'
import BarcodeScannerComponent from 'react-qr-barcode-scanner';

const DeliverPackage = () => {

  const [userCode, setUserCode] = useState("");

  const [cameraAllowed, setCameraAllowed] = useState(true);
  const [cameraError, setCameraError] = useState(null);

  const handleChange = (e) => {
    setUserCode(e.target.value);
  }

  const handleRetryCameraAccess = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        setCameraAllowed(true);
        setCameraError(null);
      })
      .catch((err) => {
        console.error("Camera permission denied", err);
        setCameraAllowed(false);
        setCameraError("Camera permission denied.");
      });
  };

  useEffect(() => {
    handleRetryCameraAccess();
  }, []);


  return (
    <div className="form-container">
      <h2 className="form-title">นำจ่ายพัสดุ</h2>

      {cameraAllowed ? (
        <BarcodeScannerComponent
          width={500}
          height={500}
          onUpdate={(err, result) => {
            if (result) {
              checkDormCode(result.text);
            }
          }}
        />
      ) : (
        <div>
          <div className='black-square'>
            <div>
              <p>ไม่สามารถเข้าถึงกล้องได้</p>
              <button onClick={handleRetryCameraAccess}>อนุญาตสิทธิ์การเข้าถึงกล้อง</button>
            </div>
          </div>
        </div>
      )}


      <div>
        <input
          id='userCode'
          type="text"
          name="userCode"
          value={userCode}
          onChange={handleChange}
          placeholder="Tracking No."
        />
      </div>
    </div>
  )
}

export default DeliverPackage
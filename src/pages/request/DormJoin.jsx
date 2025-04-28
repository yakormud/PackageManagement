import React, { useEffect, useState } from 'react'
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import api from '../../utils/api';
import DormJoinForm from './DormJoinForm';

const DormJoin = () => {

  const [data, setData] = useState("Not Found");
  const [cameraAllowed, setCameraAllowed] = useState(true);
  const [cameraError, setCameraError] = useState(null);

  const [input, setInput] = useState("BIMUBZRRMO");
  const [dormCode, setDormCode] = useState("");

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

  const checkDormCode = async (result) => {
    try {
      const res = await api.get(`/dorm/check-invite/${result}`);
      if (res.data.exists) {
        alert("dorm code exists")
        setDormCode(result); 
      } else {
        alert("dorm code not exists")
      }
    } catch (err) {
      console.log(err)
    }
  };

  return (
    <div className='page-center'>
      {dormCode.length == 0 ? (
        <>
          <h2>เข้าร่วมหอพัก</h2>
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

          <div style={{ marginTop: '30px' }}>
            <p>กรอกรหัส QR Code</p>
            
            <div>
            <input
              type="text"
              placeholder="กรอกรหัสหอพัก"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="form-input"
              style={{ marginTop: '10px', padding: '8px', width: '250px' }}
            />
            </div>
            <button
              className='mybutton'
              onClick={() => checkDormCode(input)}
              style={{ marginTop: '10px' }}
            >
              ยืนยัน
            </button>
          </div>
        </>
      ) : (
        <DormJoinForm code={dormCode} />
      )}
    </div>
  );

}

export default DormJoin
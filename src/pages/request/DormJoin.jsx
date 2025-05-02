// import React, { useEffect, useRef, useState } from 'react';
// import { Html5Qrcode } from 'html5-qrcode';
// import api from '../../utils/api';
// import DormJoinForm from './DormJoinForm';

// const DormJoin = () => {
//   const [dormCode, setDormCode] = useState("");
//   const [input, setInput] = useState("BIMUBZRRMO");
//   const [cameraError, setCameraError] = useState(null);

//   const qrRef = useRef(null);
//   const scannerRef = useRef(null);

//   const checkDormCode = async (result) => {
//     try {
//       const res = await api.get(`/dorm/check-invite/${result}`);
//       if (res.data.exists) {
//         alert("dorm code exists");
//         setDormCode(result);
//         scannerRef.current?.stop(); 
//       } else {
//         alert("dorm code not exists");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     const config = { fps: 10, qrbox: 250 };
//     const scanner = new Html5Qrcode("qr-reader");
//     scannerRef.current = scanner;

//     Html5Qrcode.getCameras()
//       .then((devices) => {
//         if (devices && devices.length) {
//           scanner.start(
//             { facingMode: "environment" },
//             config,
//             (decodedText, decodedResult) => {
//               checkDormCode(decodedText);
//             },
//             (err) => {
//               console.warn("QR scan error", err);
//             }
//           );
//         } else {
//           setCameraError("ไม่พบกล้อง");
//         }
//       })
//       .catch((err) => {
//         console.error("Camera access error", err);
//         setCameraError("ไม่สามารถเข้าถึงกล้องได้");
//       });

//     return () => {
//       scanner.stop().catch(() => {});
//     };
//   }, []);

//   return (
//     <div className='page-center'>
//       {dormCode.length === 0 ? (
//         <>
//           <h2>เข้าร่วมหอพัก</h2>

//           {cameraError ? (
//             <div className='black-square'>
//               <p>{cameraError}</p>
//             </div>
//           ) : (
//             <div id="qr-reader" style={{ width: '300px' }} />
//           )}

//           <div style={{ marginTop: '30px' }}>
//             <p>กรอกรหัส QR Code</p>
//             <input
//               type="text"
//               placeholder="กรอกรหัสหอพัก"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               className="form-input"
//               style={{ marginTop: '10px', padding: '8px', width: '250px' }}
//             />
//             <button
//               className='mybutton'
//               onClick={() => checkDormCode(input)}
//               style={{ marginTop: '10px' }}
//             >
//               ยืนยัน
//             </button>
//           </div>
//         </>
//       ) : (
//         <DormJoinForm code={dormCode} />
//       )}
//     </div>
//   );
// };

// export default DormJoin;

import React, { useState } from 'react';
import QrReader from './QRCodeReader';

const QrPage = () => {
  const [result, setResult] = useState('');

  return (
    <div className='scan-backdrop'>
      <h2>Scan QR Code</h2>
      <QrReader onScan={(text) => setResult(text)} />
      <p className="scan-result">Scanned Result: {result ? result : 'not-found'}</p>
    </div>
  );
};

export default QrPage;


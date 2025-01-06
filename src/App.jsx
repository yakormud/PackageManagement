import React, { useState, useEffect } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import QRCode from "react-qr-code"; // Import react-qr-code for generating QR codes

function App() {
  const [data, setData] = useState("Not Found");
  const [cameraAllowed, setCameraAllowed] = useState(true); // To track camera permission
  const [cameraError, setCameraError] = useState(null);
  const [qrInput, setQrInput] = useState(""); // Input for QR code generation

  const handleRetryCameraAccess = () => {
    // Function to retry camera access
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        setCameraAllowed(true);
        setCameraError(null); // Reset error when camera access is granted
      })
      .catch((err) => {
        console.error("Camera permission denied", err);
        setCameraAllowed(false);
        setCameraError("Camera permission denied.");
      });
  };

  useEffect(() => {
    // On mount, check camera permissions
    handleRetryCameraAccess();
  }, []);

  return (
    <>
      {/* Barcode Scanner Section */}
      {cameraAllowed ? (
        <BarcodeScannerComponent
          width={500}
          height={500}
          onUpdate={(err, result) => {
            if (result) {
              setData(result.text);
            } else {
              setData("Not Found");
            }
          }}
        />
      ) : (
        <div>
          <p>{cameraError || "Camera access denied"}</p>
          <button onClick={handleRetryCameraAccess}>Allow Camera Access</button>
        </div>
      )}

      <p>Scan Result: {data}</p>

      {/* QR Code Generator Section */}
      <h3>Generate a QR Code</h3>
      <input
        type="text"
        value={qrInput}
        onChange={(e) => setQrInput(e.target.value)}
        placeholder="Enter text for QR Code"
      />
      {qrInput && (
        <div style={{ marginTop: "20px" }}>
          <QRCode value={qrInput} />
        </div>
      )}
    </>
  );
}

export default App;

import { useState } from "react";
import { useZxing } from "react-zxing";

const Test = () => {
  const [result, setResult] = useState("");
  const [paused, setPaused] = useState(false);

  const { ref, stop } = useZxing({
    onDecodeResult(decodedResult) {
      const text = decodedResult.getText();
      setResult(text);

      // หยุดกล้องทันทีที่อ่านได้
      stop();
      setPaused(true);
    },
    // อ่านเฉพาะ barcode (ไม่อ่าน QR)
    formats: [
      "CODE_128",
      "CODE_39",
      "EAN_13",
      "EAN_8",
      "UPC_A",
      "UPC_E",
      "ITF",
      // ไม่ใส่ QR_CODE
    ],
  });

  return (
    <div>
      <h2>Barcode Scanner</h2>
      <video ref={ref} playsInline muted style={{ width: "300px", border: "1px solid black" }} />
      <p>
        <strong>Last result:</strong> {result || "ยังไม่มีผลลัพธ์"}
      </p>
      {paused && <p style={{ color: "green" }}>✅ หยุดกล้องแล้ว หลังจากอ่านสำเร็จ</p>}
    </div>
  );
};

export default Test;
import React, { useRef, useState } from 'react';
import api from '../../utils/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const DormCreate = () => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        ownerName: '',
        phoneNo: '',
    });

    const fileInputRef = useRef();
    const defaultImage = '../../image/dorm1.jpg';

    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            console.log("file: ", file)
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
                console.log("reader result: ", reader.result)
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setPreviewUrl("");

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { name, address, ownerName, phoneNo } = formData;
        if (!name || !address || !ownerName || !phoneNo) {
            await Swal.fire({
                icon: 'info',
                title: 'เกิดข้อผิดพลาด',
                text: 'กรุณากรอกข้อมูลให้ครบ',
            });
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('name', name);
        formDataToSend.append('address', address);
        formDataToSend.append('ownerName', ownerName);
        formDataToSend.append('phoneNo', phoneNo);
        if (image) {
            formDataToSend.append('picture', image);
        }

        try {
            const res = await api.post('/dorm/create', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            await Swal.fire({
                icon: 'success',
                title: 'สำเร็จ',
                text: 'สร้างหอพักเรียบร้อย',
            });
            navigate('/dashboard');
        } catch (err) {
            console.error('Error saving dorm:', err);
            await Swal.fire({
                icon: 'error',
                title: 'ล้มเหลว',
                text: err?.response?.data?.message || 'เกิดข้อผิดพลาด',
            });
        }
    };


    return (
        <div className="form-container">

            <h2 className="form-title">สร้างหอพักใหม่</h2>
            <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                    <label htmlFor="name">ชื่อหอพัก</label>
                    <input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="address">ที่อยู่</label>
                    <input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="ownerName">ชื่อเจ้าของหอพัก</label>
                    <input
                        id="ownerName"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phoneNo">เบอร์โทร</label>
                    <input
                        id="phoneNo"
                        name="phoneNo"
                        value={formData.phoneNo}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="picture">รูปหอพัก</label>
                    <input
                        id="picture"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="form-input"
                        ref={fileInputRef}
                    />
                </div>

                <div className="form-group img-wrap">
                    {previewUrl && <img src={previewUrl} alt="dorm" className="img-preview" />}
                    {image && (
                        <button onClick={handleRemoveImage}>
                            ลบรูปภาพ
                        </button>
                    )}
                </div>

                <button type="submit" className="mybtn btn-full-width btn-black" style={{ marginBottom: "50px" }}>บันทึก</button>
            </form>
        </div>
    );
};

export default DormCreate;


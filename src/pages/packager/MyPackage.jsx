import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { BASE_URL } from '../../utils/api';
import PackageInfo from './PackageInfo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode } from '@fortawesome/free-solid-svg-icons';
import defaultPic from '../../assets/noimage.png'

const MyPackage = () => {
    const [selectedStatus, setSelectedStatus] = useState('wait_for_deliver');
    const [packages, setPackages] = useState([]);
    const [dorms, setDorms] = useState([]);

    const [search, setSearch] = useState("");
    const [selectedDorm, setSelectedDorm] = useState("");
    const [date, setDate] = useState("")
    const navigate = useNavigate();

    const [limit] = useState(25);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const [showInfo, setShowInfo] = useState(false);
    const [selectInfo, setSelectInfo] = useState(null);

    const fetchPackages = async (isLoadMore = false) => {
        try {
            const res = await api.post('/package/myPackage', {
                status: selectedStatus,
                search,
                dormID: selectedDorm,
                date,
                limit,
                offset: isLoadMore ? offset : 0,
            });

            console.log("RESULT: ", res.data)
            if (isLoadMore) {
                setPackages(prev => [...prev, ...res.data]);
            } else {
                setPackages(res.data);
            }

            if (res.data.length < limit) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            if (!isLoadMore) {
                setOffset(limit);
            } else {
                setOffset(prev => prev + limit);
            }


        } catch (err) {
            console.error('Failed to fetch packages:', err);
        }
    };

    useEffect(() => {
        console.log(packages)
    }, [packages])

    const fetchDorms = async () => {
        try {
            const res = await api.post('/dorm-user/getByUserID');
            const Dorms = res.data.map(d => ({
                dormID: d.dormID,
                dormName: d.dormName,
            }));
            setDorms(Dorms);
        } catch (err) {
            console.error('Failed to fetch dorms:', err);
        }
    };

    useEffect(() => {
        fetchDorms();
    }, []);

    useEffect(() => {
        setOffset(0);
        fetchPackages(false);
    }, [selectedStatus, search, selectedDorm, date]);

    function formatThaiDateTime(isoString) {
        const isDev = import.meta.env.MODE === 'development';
        const date = new Date(isoString);
        const thaiDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));

        if (!isDev) {
            thaiDate.setHours(date.getHours() - 7);
        }

        const day = thaiDate.getDate();
        const month = thaiDate.getMonth();
        const year = thaiDate.getFullYear() + 543;
        const hours = thaiDate.getHours().toString().padStart(2, '0');
        const minutes = thaiDate.getMinutes().toString().padStart(2, '0');

        const thaiMonths = [
            'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
            'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
        ];

        return `${day} ${thaiMonths[month]} ${year} ${hours}:${minutes} น.`;
    }

    const closeInfo = () => {
        setShowInfo(false)
        setSelectInfo(null)
    }

    return (
        <div style={{ width: "100%" }}>
            <div className="flex-between-menu">
                <h2>รายการพัสดุของฉัน</h2>
            </div>

            <div className='search-package-container'>

                <div className='search-group'>
                    <label style={{ marginBottom: '4px' }}>
                        ค้นหา
                    </label>
                    <input
                        type="text"
                        className="myinput"
                        placeholder="🔍 ค้นด้วยเลขพัสดุ"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }} className='input-group'>
                    <label style={{ marginBottom: '4px' }}>
                        หอพัก
                    </label>
                    <select
                        className="myinput input-180"
                        value={selectedDorm}
                        onChange={(e) => setSelectedDorm(e.target.value)}
                    >
                        <option value="">-- เลือกหอพัก --</option>
                        {dorms.map(d => (
                            <option key={d.dormID} value={d.dormID}>
                                {d.dormName}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }} className='input-group'>
                    <label style={{ marginBottom: '4px' }}>
                        {selectedStatus === 'delivered' ? 'วันที่รับพัสดุ' : 'วันที่เข้าสู่ระบบ'}
                    </label>
                    <input
                        type="date"
                        className="myinput input-180"
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </div>


            <div className="line-wrap" style={{ marginTop: "10px" }}>
                <div
                    className={`line-item ${selectedStatus === 'wait_for_deliver' ? 'selected' : ''}`}
                    onClick={() => setSelectedStatus('wait_for_deliver')}
                >
                    ยังไม่ได้รับ
                </div>
                <div
                    className={`line-item ${selectedStatus === 'delivered' ? 'selected' : ''}`}
                    onClick={() => setSelectedStatus('delivered')}
                >
                    ได้รับแล้ว
                </div>
            </div>

            <div className="package-container">
                {packages.length == 0 && <p style={{ textAlign: "center" }}>ไม่พบรายการพัสดุ</p>}
                {packages.map(pkg => (
                    <div className="package-card" key={pkg.id} onClick={() => {
                        setSelectInfo(pkg.id)
                        setShowInfo(true)
                    }}>
                        <div className="package-image">
                            <img src={pkg.pathToPicture ? `${BASE_URL}${pkg.pathToPicture}` : defaultPic} alt="package" />
                        </div>
                        <div className="package-info">
                            <p><strong>หอพัก {pkg.dormName} ห้องพัก {pkg.recipientRoomNo}</strong></p>
                            <h3 style={{ color: "#191970" }}><FontAwesomeIcon icon={faBarcode} /> {pkg.trackingNo}</h3>
                            <p>เจ้าของพัสดุ: {pkg.recipientName}</p>
                            <p>
                                🗓️ {pkg.status === 'delivered' ? 'นำจ่ายเมื่อ' : 'เข้าสู่ระบบเมื่อ'}: {formatThaiDateTime(pkg.status === 'delivered' ? pkg.deliverTime : pkg.registerTime)}
                            </p>
                            <p>
                                👤 {pkg.status === 'delivered' ? 'ผู้รับ' : 'เพิ่มโดย'}: {pkg.status === 'delivered' ? pkg.receiver : pkg.registerBy}
                            </p>
                        </div>
                        <div className="package-action">
                            {/* <button className="qr-button">
                <FontAwesomeIcon icon={faQrcode} />
              </button> */}
                        </div>
                    </div>
                ))}
                {hasMore && (
                    <button onClick={() => fetchPackages(true)} style={{ marginTop: 20 }} className='mybtn btn-full-width'>
                        โหลดเพิ่ม
                    </button>
                )}

                {showInfo && <PackageInfo id={selectInfo} onClose={closeInfo} />}
            </div>

        </div>
    );
};

export default MyPackage;

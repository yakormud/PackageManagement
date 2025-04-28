import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';


import Dashboard from './pages/dashboard/Dashboard';

import Unknown from './pages/unknown/Unknown'

import Login from './pages/login/Login';
import Register from './pages/login/Register';
import Dorm from './pages/dormRoom/DormRoomManagement';
import DormInfo from './pages/dorm/DormInfo';
import DormLayout from './pages/dorm/DormLayout';
import DormPackage from './pages/packager/dormPackage';
import DormQRCode from './pages/dorm/DormQRCode';
import DormRequest from './pages/request/DormRequest';
import DormUserManagement from './pages/dormUser/DormUserManagement';
import DormRoomManagement from './pages/dormRoom/DormRoomManagement';
import DeliverPackage from './pages/packager/DeliverPackage';
import DormCreate from './pages/dorm/DormCreate';
import DormJoin from './pages/request/DormJoin';
import TenantPackage from './pages/packager/TenantPackage';
import TenantQRCode from './pages/packager/TenantQRCode';
import AddPackage from './pages/packager/AddPackage';
import Test from './pages/test/Test';

const App = () => {

  // const { auth } = useContext(AuthContext);
  //let auth;

  return (
    <Router basename="/PackageManagement">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path='/test' element={<Test />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path='create-dorm' element={<DormCreate/>}/>
          <Route path='join-dorm' element={<DormJoin/>}/>

          <Route path="dorm/:id" element={<DormLayout />}>
            <Route index element={<Navigate to="./info"/>} /> 

            <Route path="info" element={<DormInfo />} />
            <Route path="qrinvite" element={<DormQRCode/>}/>
            <Route path="requests" element={<DormRequest/>}/>
            <Route path="users" element={<DormUserManagement/>}/>
            <Route path="rooms" element={<DormRoomManagement/>}/>


            <Route path="mypackage" element={<TenantPackage />} />
            <Route path="myqrcode" element={<TenantQRCode/>} />

            <Route path="allpackage" element={<DormPackage />} />
            <Route path="deliver" element={<DeliverPackage/>}/>
            <Route path='addpackage' element={<AddPackage/>}/>
            {/* <Route path="packages" element={<DormPackages />} /> */}
            {/* <Route path="users" element={<DormUsers />} /> */}
            {/* <Route path="rooms" element={<DormRooms />} /> */}
            {/* etc... */}
          </Route>

          <Route path="*" element={<Unknown />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App
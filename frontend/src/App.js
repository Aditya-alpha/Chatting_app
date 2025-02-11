import React from 'react';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./home/home";
import SignUp from './signup/signup';
import Otp from './signupotp/otp';
import Chat from './chat/chat';
import Signin from './signin/signin';
import ForgotPassword from './signin-fp/signin-fp';
import VerifyOtp from './signin-vp/signin-vp';
import ChangePassword from './signin-up/signin-up';
import Upload from './upload/upload';
import Gallery from './gallery/gallery';
import Allchat from './allchat/allchat';
import Profile from './profile/profile';
import UpdatePassword from './profile-up/profile-up';
import ForgotProfilePassword from './profile-fp/profile-fp';
import VerifyProfileOtp from './profile-vp/profile-vp';
import ChangeProfilePassword from './profile-cp/profile-cp';
import Groups from './groups/groups';

export const Context = React.createContext()

function App() {

  let [isSignedin, setIsSignedin] = useState(false)

  return (
    <div className="bg-[#262523] h-screen w-full">
      <Context.Provider value={[isSignedin, setIsSignedin]} >
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signup/otp" element={<Otp />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signin/forgotpassword" element={<ForgotPassword />} />
            <Route path="/signin/forgotpassword/verify" element={<VerifyOtp />} />
            <Route path="/signin/updatepassword" element={<ChangePassword />} />
            <Route path="/:username/chats" element={<Chat />} />
            <Route path="/:username/groups" element={<Groups />} />
            <Route path="/:username/upload" element={<Upload />} />
            <Route path="/:username/gallery" element={<Gallery />} />
            <Route path="/:username/allchat" element={<Allchat />} />
            <Route path="/:username/profile" element={<Profile />} />
            <Route path="/:username/profile/updatepassword" element={<UpdatePassword />} />
            <Route path="/:username/profile/forgotpassword" element={<ForgotProfilePassword />} />
            <Route path="/:username/profile/forgotpassword/verify" element={<VerifyProfileOtp />} />
            <Route path="/:username/profile/changepassword" element={<ChangeProfilePassword />} />
          </Routes>
        </Router>
      </Context.Provider>
    </div>
  );
}

export default App;

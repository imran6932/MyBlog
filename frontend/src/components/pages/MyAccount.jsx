import "./MyAccount.css";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { userProfileAPI } from "../../features/users/getProfileSlice"; // Adjust API call accordingly
import ProfileView from "../user/ProfileView";
import { useTheme } from "../../contexts/ThemeContext";

const MyAccount = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    document.title = "Blog | Profile";
  }, [location]); // location is now correctly included as a dependency

  useEffect(() => {
    dispatch(userProfileAPI());
  }, [dispatch]);

  const clickEditHandle = (e) => {
    e.preventDefault();
    navigate("/update-profile");
  };

  return (
    <div className="myaccount-wrapper">
      <div className="myaccount-container">
        {/* Profile Content */}
        <div className="profile-content">
          <ProfileView onEditClick={clickEditHandle} />
        </div>
      </div>
    </div>
  );
};

export default MyAccount;

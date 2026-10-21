import React from "react";
import Rightmenu from "../component/Rightmenu";
import {
  FiSearch,
  FiChevronDown,
  FiUser,
  FiBox,
  FiPackage,
  FiAlertTriangle,
  FiUsers,
} from "react-icons/fi";
import Store from "../component/Store";

const Maindashboard = () => {
  return (
    <div className="maindashboard">
      <div className="right">
        <Rightmenu />
      </div>
      <div className="left">
        <header className="topheader">
          <div className="topheaderbar">
            <div className="topheadersearch">
              <span className="topheadersearchicon">
                <FiSearch />
              </span>
              <input
                className="topheadersearchinput"
                type="text"
                placeholder="جستجو در انبار یا مشتریان..."
              />
            </div>
            <div className="topheaderuser">
              <div className="topheaderavatar">
                <FiUser />
              </div>
              <div className="topheaderusertext">
                <div className="topheadername">علی کیوانلو</div>
                <div className="topheaderrole">مدیر</div>
              </div>
              <span className="topheaderchevron">
                <FiChevronDown />
              </span>
            </div>
          </div>

          <div className="topheaderwelcome">
            <div className="topheaderwelcomeinfo">
              <div className="topheaderwelcomeicon">
                <FiBox />
              </div>
              <div className="topheaderwelcometexts">
                <h2 className="topheaderwelcometitle">
                  به پنل مدیریت انبار خوش آمدید
                </h2>
                <p className="topheaderwelcometext">
                  در این بخش می‌توانید موجودی تیفه‌ها و مشتریان خود را مدیریت
                  کنید.
                </p>
              </div>
            </div>

            <div className="topheaderstats">
              <div className="topheaderstat topheaderstatpurple">
                <div className="topheaderstaticon">
                  <FiPackage />
                </div>
                <div className="topheaderstatinfo">
                  <div className="topheaderstatlabel">موجودی کل</div>
                  <div className="topheaderstatvalue">۲,۸۶۰</div>
                  <div className="topheaderstatunit">شاخه</div>
                </div>
              </div>

              <div className="topheaderstat topheaderstatorange">
                <div className="topheaderstaticon">
                  <FiAlertTriangle />
                </div>
                <div className="topheaderstatinfo">
                  <div className="topheaderstatlabel">موجودی کم</div>
                  <div className="topheaderstatvalue">۵</div>
                </div>
              </div>

              <div className="topheaderstat topheaderstatgreen">
                <div className="topheaderstaticon">
                  <FiBox />
                </div>
                <div className="topheaderstatinfo">
                  <div className="topheaderstatlabel">کل تیفه‌ها</div>
                  <div className="topheaderstatvalue">۲۸۶</div>
                </div>
              </div>

              <div className="topheaderstat topheaderstatblue">
                <div className="topheaderstaticon">
                  <FiUsers />
                </div>
                <div className="topheaderstatinfo">
                  <div className="topheaderstatlabel">کل مشتریان</div>
                  <div className="topheaderstatvalue">۱۸</div>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="content">
            <Store/>
        </div>
      </div>
    </div>
  );
};

export default Maindashboard;

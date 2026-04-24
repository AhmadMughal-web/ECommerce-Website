import React, { useState } from 'react'
import Header from '../components/layout/Header'
import styles from '../styles/style'
import ProfileSideBar from '../components/Profile/ProfileSideBar'
import ProfileContent from '../components/Profile/ProfileContent'
const ProfilePage = () => {
    const [active,setActive] = useState(1)
  return (
    <div>
      <Header/>

      <div className={`${styles.section} flex bg-[#e8e4e4] pt-8 mb-40 `}>
        <div className='w-[50px]  800px:w-[335px] 800px:mt-0 mt-44'>
            <ProfileSideBar active={active} setActive={setActive }/>
        </div>
        <ProfileContent active={active}/>
      </div>
    </div>
  )
}

export default ProfilePage
import { Image } from 'antd'
import React from 'react'

const ProfileInfo = ({profileInfo = {}}) => {
  console.log(profileInfo)
  return (
    <div>
      <div className='w-100 d-flex justify-content-center'>
        <Image
          style={{ borderRadius: '50%', background: 'white', height: '50px', width: '50px' }}
          src={profileInfo.avatar || 'user.jpg'}
          preview={false}
        />
      </div>
      <div>
        <span className='fw-bolder me-2'>User Name:</span>
        <span>{profileInfo.userName}</span>
      </div>
      <div>
        <span className='fw-bolder me-2'>Email:</span>
        <span>{profileInfo.email}</span>
      </div>
    </div>
  )
}

export default ProfileInfo

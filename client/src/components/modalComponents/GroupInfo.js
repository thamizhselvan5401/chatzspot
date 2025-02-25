import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons'
import { Button, Image } from 'antd'
import React, { useState } from 'react'
import ProfileInfo from './ProfileInfo'
import GroupHandler from './GroupHandler'

const GroupInfo = ({ groupInfo, isGroupUpdated, userId }) => {
  const members = groupInfo?.users.filter(user => user._id !== groupInfo.groupAdmin._id)
  const [componentName, setShowComponentName] = useState('group')
  const [componentInfo, setComponentInfo] = useState(null)


  const viewProfile = (compoent, info) => {
    setShowComponentName(compoent)
    setComponentInfo(info)
  }

  return (
    <div>
      {componentName === 'profile' &&
        <>
        <ArrowLeftOutlined onClick={() => viewProfile('group', null)} />
        <ProfileInfo profileInfo={componentInfo} />
        </>}
        {componentName === 'group' && <>
        {userId === groupInfo.groupAdmin._id && <Button
          type='primary'
          className='mb-3'
          onClick={() => viewProfile('updateGroup', groupInfo)}
          icon={<EditOutlined onClick={() => viewProfile(false, null)} />}
        >Edit Group</Button>}
          <div className='mb-2 d-flex justify-content-center'>
            <Image style={{ height: '80px', width: '80px', borderRadius: '50%', border: '2px solid black' }} preview={false} src={groupInfo.avatar || 'group.jpeg'} />
          </div>
          <div>
            <span className='fw-bolder me-2'>Group Name:</span>
            <span>{groupInfo.chatName}</span>
          </div>
          <div>
            <span className='fw-bolder me-2'>Group Admin:</span>
            <div className={`w-100 mb-1 d-flex align-items-center ps-2 rounded-2 hover bg-info`}
              onClick={() => viewProfile('profile', groupInfo.groupAdmin)}
            >
              <div style={{ borderRadius: '50%', background: 'white', height: '25px', width: '25px' }} className='me-2'>
                <Image
                  style={{ borderRadius: '50%', background: 'white', height: '25px', width: '25px' }}
                  src={groupInfo.groupAdmin.avatar || 'group.jpeg'}
                  preview={false}
                />
              </div>
              <div className=''>
                <div className='fs-5'>{groupInfo.groupAdmin.userName}</div>
                {/* <div className='text-start' style={{}}>hii</div> */}
              </div>
            </div>
          </div>
          <div className='mt-2'>
            <span className='fw-bolder'>Members:</span>
            {members.map(member => <div className={`w-100 mb-1 d-flex ps-2 align-items-center rounded-2 hover bg-secondary`}
              onClick={() => viewProfile('profile', member)}
            >
              <div style={{ borderRadius: '50%', background: 'white', height: '25px', width: '25px' }} className='me-2'>
                <Image
                  style={{ borderRadius: '50%', background: 'white', height: '25px', width: '25px' }}
                  src={member.avatar || 'group.jpeg'}
                  preview={false}
                />
              </div>
              <div className=''>
                <div className='fs-5'>{member.userName}</div>
                {/* <div className='text-start' style={{}}>hii</div> */}
              </div>
            </div>)}
          </div>
        </>}
        {componentName === 'updateGroup' &&
        <>
        <GroupHandler isGroupUpdated={isGroupUpdated} groupInfo={componentInfo} isUpdate={true} cancelUpdate={viewProfile} />
        </>}
    </div>
  )
}

export default GroupInfo

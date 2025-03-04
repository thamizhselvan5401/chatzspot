import { ArrowLeftOutlined, EditOutlined, LogoutOutlined } from '@ant-design/icons'
import { Button, Image, Popconfirm } from 'antd'
import React, { useState } from 'react'
import ProfileInfo from './ProfileInfo'
import GroupHandler from './GroupHandler'
import axios from 'axios'

const GroupInfo = ({ groupInfo, isGroupUpdated, userId, exitGroup }) => {
  const [loading, setLoading] = useState(false)
  const members = groupInfo?.users.filter(user => user._id !== groupInfo.groupAdmin._id)
  const [componentName, setShowComponentName] = useState('group')
  const [componentInfo, setComponentInfo] = useState(null)


  const viewProfile = (compoent, info) => {
    setShowComponentName(compoent)
    setComponentInfo(info)
  }

  const exitFromGroup = async () => {
    setLoading(true)
    const updatedChat = {
      chatName: groupInfo.chatName,
      users: groupInfo.users.map(user => user._id).filter(id => id !== userId),
      _id: groupInfo._id,
      avatar: groupInfo.avatar,
      exit: true
    }
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      }
      const response = await axios.post('/api/chat/updateGroup', { updatedChat }, config)
      const status = response.status
      if (status === 200) {
        exitGroup()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
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
          className='mb-3 me-2'
          onClick={() => viewProfile('updateGroup', groupInfo)}
          icon={<EditOutlined />}
        >Edit Group</Button>}
        <Popconfirm 
          overlayClassName='custom-popconfirm'
          okText='Yes'
          icon={null} cancelText='No'
          placement='top'
          title='Are you sure you want to exit?'
          color='#1d1d1d' onConfirm={() => exitFromGroup()}
        >
          <Button loading={loading} icon={<LogoutOutlined />}>Exit</Button>
        </Popconfirm>
          <div className='mb-2 d-flex justify-content-center'>
            <Image style={{ height: '80px', width: '80px', borderRadius: '50%', border: '2px solid black' }} preview={false} src={groupInfo.avatar || 'group.jpeg'} />
          </div>
          <div>
            <span className='fw-bolder me-2'>Group Name:</span>
            <span>{groupInfo.chatName}</span>
          </div>
          <div>
            <span className='fw-bolder me-2'>Group Admin:</span>
            <div className={`w-100 mb-1 d-flex align-items-center ps-2 rounded-2 hover primary-bg`}
              onClick={() => viewProfile('profile', groupInfo.groupAdmin)}
            >
              <div style={{ borderRadius: '50%', background: 'white', height: '25px', width: '25px' }} className='me-2'>
                <Image
                  style={{ borderRadius: '50%', background: 'white', height: '25px', width: '25px' }}
                  src={groupInfo.groupAdmin.avatar || 'group.jpeg'}
                  preview={false}
                />
              </div>
              <div className='fs-5'>{groupInfo.groupAdmin.userName}</div>
            </div>
          </div>
          <div className='mt-2'>
            <span className='fw-bolder'>Members:</span>
            {members.map((member, i) => <div key={member.userName + i} className={`w-100 mb-1 d-flex ps-2 align-items-center rounded-2 hover primary-bg`}
              onClick={() => viewProfile('profile', member)}
            >
              <div style={{ borderRadius: '50%', background: 'white', height: '25px', width: '25px' }} className='me-2'>
                <Image
                  style={{ borderRadius: '50%', background: 'white', height: '25px', width: '25px' }}
                  src={member.avatar || 'group.jpeg'}
                  preview={false}
                />
              </div>
              <div className='fs-5'>{member.userName}</div>
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

import React from 'react'
import { Image } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Messages from './Messages'

const ChatPage = ({ messages, selectedUser, selectedUserId, userId, sendMessage, typingHandler, typing, unselectChat, previewProfile }) => {
  const selectedUserName = selectedUser?.userName || selectedUser?.users.find(user => user._id !== userId).userName
  const profile = selectedUser?.users?.find(user => user._id !== userId) || selectedUser
  const isGroupChat = selectedUser?.isGroupChat || false
  return (
    <div className='d-flex flex-column h-100'>
      <div className='d-flex bottom-panel panel-bg text-white align-items-center py-2 px-2 justify-content-between'>
        <div className='d-flex align-items-center w-100' style={{ height: '50px' }}>
          <ArrowLeftOutlined className='previous-icon' onClick={() => unselectChat()}/>
          {<div style={{ borderRadius: '50%', background: 'white' }} className='me-3'>
            <Image
              style={{ borderRadius: '50%', background: 'white', height: '50px', width: '50px' }}
              src={isGroupChat ? (selectedUser.avatar || 'group.jpeg') : (profile?.avatar || 'user.jpg')}
            />
          </div>}
          <div className='d-flex flex-column justify-content-center'>
            <div className='fw-bolder fs-5' style={{ cursor: 'pointer' }}
              onClick={() =>{
                previewProfile(isGroupChat ? selectedUser : profile, isGroupChat ? 'group' : 'profile')
              }}
            >
              {isGroupChat ? selectedUser?.chatName : selectedUserName}
            </div>
            {typing && <span className='text-success'>{isGroupChat ? `${typing?.name} is typing` : 'typing...'}</span>}
          </div>
        </div>
      </div>
      <div className='w-100' style={{ height: 'calc(100% - 50.5px - 1rem)' }}>
        <Messages typingHandler={typingHandler} selectedUserId={selectedUserId} sendMessage={sendMessage} userId={userId} messages={messages}/>
      </div>
    </div>
  )
}

export default ChatPage

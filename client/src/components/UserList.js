import { Badge, Image, Spin } from 'antd'
import React, { useEffect, useState } from 'react'

const UserList = ({ users = [], chatType, userId, selectedChat, setSelectedUser, usersList = [], typingList, loadingId }) => {
  const [chatList, setChatList] = useState(users)

  useEffect(() => {
    const list = users.filter(chat => chatType === 'group' ? chat.isGroupChat : !chat.isGroupChat)
    setChatList(list)
  }, [chatType, users])

  const renderDate = (latestMessage = {}) => {
    const localDate = latestMessage.createdAt || latestMessage.updatedAt;
    if (!localDate) return;

    const dateObj = new Date(localDate);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const messageDate = dateObj.toISOString().split("T")[0];
    const todayDate = today.toISOString().split("T")[0];
    const yesterdayDate = yesterday.toISOString().split("T")[0];

    if (messageDate === todayDate) {
      return dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    if (messageDate === yesterdayDate) {
      return "Yesterday";
    }

    return messageDate;
  };

  const RenderUsers = ({ name, avatar, user, type }) => {
    return (<Spin spinning={loadingId === user._id}><div style={{ height: '55px' }} className={`w-100 mb-2 d-flex align-items-center px-2 rounded-2 hover text-white panel-bg ${selectedChat?._id === user._id ? 'active-panel-bg' : 'panel-bg'}`} onClick={() => {
      setSelectedUser({...user, type}, 'search')
      }}>
      <div className='me-2 h-100 d-flex align-items-center py-2'>
        <Image
          style={{ borderRadius: '50%', background: 'white', width: '45px', height: '45px' }}
          src={avatar || 'user.jpg'}
          preview={false}
        />
      </div>
      <div className='fs-5'>{name}</div>
    </div></Spin>)
  }

  const RenderChats = ({ name, type, user, id = '', avatar = chatType === 'group' ? 'group.jpeg' : 'user.jpg', count, latestMessage }) => {
    return (<Spin spinning={loadingId === id}><div style={{ height: '55px' }} className={`w-100 mb-2 d-flex px-2 rounded-2 hover text-white ${selectedChat?._id === id ? 'active-panel-bg' : 'panel-bg'}`} onClick={() => { setSelectedUser(user, type)}}>
      <div className='me-2 h-100 d-flex align-items-center py-2'>
        <Image
          style={{ borderRadius: '50%', background: 'white', width: '45px', height: '45px' }}
          src={avatar}
          preview={false}
        />
      </div>
      {latestMessage ? <div className='w-100 overflow-hidden'>
        <div className='d-flex justify-content-between'>
          <div className='truncate' style={{ width: '65%' }}>{name}</div>
          <div className='text-end' style={{ width: '35%' }}>{renderDate(latestMessage)}</div>
        </div>
        <div className='d-flex justify-content-between'>
          <div className='truncate' style={{ width: '90%' }}>{typingList.includes(id) ? <span className='text-success'>{chatType === 'group' ? 'Someone is typing' : 'typing...'}</span> : latestMessage?.sender ? <span >{(chatType === 'group' ? `${latestMessage?.sender.userName}: ` : '') + latestMessage.content}</span> : null}</div>
          <div className='text-end' style={{ width: '10%' }}>
            <Badge
              className="me-2"
              count={count}
            />
          </div>
        </div>
      </div> : <div className='truncate d-flex align-items-center' style={{ width: '95%' }}>{name}</div>}
    </div></Spin>)
  }
  return (
    <>
      {!!usersList.length ?
        usersList.map((user, i) => {
          return <RenderUsers key={i} type='search' name={user.userName} avatar={user.avatar} user={user} />
        })
        : chatList.map((user, i) => {
          return (
              user.type === 'search' ? <RenderUsers key={i} type='search' name={user.userName} avatar={user.avatar} user={user} />  : <RenderChats
              key={i}
              type="chat"
              user={user}
              id={user._id}
              latestMessage={user.latestMessage}
              avatar={
                (user.isGroupChat
                  ? user.avatar
                  : user.users?.find(u => u._id !== userId)?.avatar) || user.avatar
              }
              name={
                (user.isGroupChat
                  ? user.chatName
                  : user.users?.find(u => u._id !== userId)?.userName) || user.userName
              }
              count={user.unreadMessages?.[userId]}
            />
          );
        })}
    </>
  )
}

export default UserList

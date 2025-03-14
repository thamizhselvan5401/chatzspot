import { AppstoreAddOutlined, ArrowLeftOutlined, LogoutOutlined, MoreOutlined, SearchOutlined, SettingOutlined, UsergroupAddOutlined, UserOutlined } from '@ant-design/icons'
import { Image, Input, Popconfirm, Popover, Segmented, Spin } from 'antd'
import React, { memo, useEffect, useState } from 'react'
import UserList from './UserList'
import axios from 'axios'
import ChatPage from './ChatPage'
import io from 'socket.io-client'
import { useLocation, useNavigate } from 'react-router-dom'
import ModalWrapper from './modalComponents/ModalWrapper'

const ENDPOINT = 'https://chatzspot.onrender.com/'
let socket

const Home = () => {
  const [userProfile, setUserProfile] = useState(null)
  const [userId, setUserId] = useState('')
  const [chatsList, setChatsList] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [chatId, setChatId] = useState('')
  const [socketConnected, setSocketConnected] = useState(false)
  const [typing, setTyping] = useState(null)
  const [showMessage, setShowMessage] = useState(false)
  const [chatType, setChatType] = useState('individual')
  const [showModal, setShowModal] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [usersList, setUsersList] = useState([])
  const [otherProfile, setOtherProfile] = useState(null)
  const [typingList, setTypingList] = useState([])
  const [loadingId, setLoadingId] = useState('')
  const [searchText, setSearchText] = useState('')
  const [fetchingList, setFethcingList] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    socket = io(ENDPOINT)
    getUserProfile()
    getChats()
  }, [])

  useEffect(() => {
    if (location.pathname === '/') {
      setShowMessage(false)
      setSelectedChat(null)
      setChatId('')
    }
  }, [location.pathname])

  useEffect(() => {
    if (!userId) return;

    socket.on('message received', (newMessage) => {

      if (!chatId || chatId !== newMessage.chat._id) {
        socket.emit('unread messages', { chatId: newMessage.chat._id, userId, seen: false, newList: true });
      } else {
        socket.emit('unread messages', { chatId: newMessage.chat._id, userId, seen: true, newList: false });
        setChatsList(chats =>
          chats.map(chat =>
            chat.id === newMessage.chat._id ? { ...chat, latestMessage: newMessage } : chat
          )
        )
        setSelectedChat((chat) => ({...chat, latestMessage: newMessage}))
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    socket.on('unread chatlist', (list) => {
      setChatsList(list)
    })

    socket.on('typing', ({ name, typingChatId, id }) => {

      // Prevent duplicate entries
      setTypingList((list) => {
        return list.includes(typingChatId) ? list : [typingChatId, ...list];
      });

      if (typingChatId === chatId) {
        setTyping({ name, typingChatId, id });
      }
    });

    socket.on('stop typing', ({ id, typingChatId }) => {

      setTypingList((list) => list.filter((typeId) => typeId !== typingChatId));

      if (typingChatId === chatId) {
        setTyping(null);
      }
    });


    return () => {
      socket.off('message received');
    };
  }, [userId, chatId]);

  const typingHandler = () => {
    if (!socketConnected || !userId || !selectedChat.users) return
    const users = selectedChat.users.map(user => user._id)

    if (!typing) {
      socket.emit('typing', { userId: userId, users, chatId, name: userProfile.userName })
    }

    let lastTypingTime = new Date().getTime()
    const timerLength = 3000

    setTimeout(() => {
      const timeNow = new Date().getTime()
      const timeDiff = timeNow - lastTypingTime

      if (timeDiff >= timerLength) {
        socket.emit('stop typing', { userId: userId, users, chatId })
        setTyping(null)
      }
    }, timerLength)
  }

  const findChat = async (chat) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }

    try {
      const response = await axios.post('/api/chat/access/' + chat._id, {}, config)
      const status = response.status
      const data = response.data
      if (status === 200) {
        const filteredList = chatsList.filter(list => data._id !== list._id)
        setChatsList([data, ...filteredList])
        setChatId(data._id)
        setSelectedChat(data)
        getMessages(data._id)
        setLoadingId(data._id)
      }
    } catch (err) {
      const filteredList = chatsList.filter(list => chat._id !== list._id)
      setChatsList([chat, ...filteredList])
      setSelectedUserId(chat._id)
      setSelectedChat(chat)
      setLoadingId(chat._id)
      setLoadingId('')
      console.error(err)
    }
  }

  const getMessages = async (selectedChatId) => {
    try {
      const config = {
        headers: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      }
      const response = await axios.get('/api/message/' + selectedChatId, config)
      const status = response.status
      const data = response.data
      if (status === 200) {
        setMessages(data)
        const unreadCount = chatsList.find(list => list._id === selectedChatId).unreadMessages[userId]
        if (unreadCount && unreadCount > 0) {
          socket.emit('unread messages', { chatId: selectedChatId, userId, seen: true, newList: true });
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingId('')
    }
  }

  const getSelectedChats = async (chat, type) => {
    let selectedChatId = chat._id
    if (selectedChat?._id === selectedChatId) return
    setLoadingId(chat._id)
    setShowMessage(true)
    setMessages([])
    setSearchText('')
    navigate(`/${chat._id}`, { replace: location.pathname !== '/' })
    if (type === 'search') {
      await findChat(chat)
      setUsersList([])
      return
    }
    setSelectedChat(chat)
    setChatId(selectedChatId)
    getMessages(selectedChatId)
  }

  const getUserProfile = async () => {
    try {
      const config = {
        headers: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      }
      const response = await axios.get('/api/user/getUser', config)
      const status = response.status
      const data = response.data
      if (status === 200) {
        setUserProfile(data || [])
        setUserId(data._id)
        socket.emit('setup', data._id)
        socket.on('connected', () => setSocketConnected(true))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getChats = async () => {
    setFethcingList(true)
    try {
      const config = {
        headers: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      }
      const response = await axios.post('/api/chat', {}, config)
      const status = response.status
      const data = response.data
      if (status === 200) {
        setChatsList(data || [])
        data.length ? setChatsList(data) : searchUsers('', true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFethcingList(false)
    }
  }

  const searchUsers = async (name, noChats = false) => {
    setSearchText(name)
    if (!name && !noChats) {
      setUsersList([])
      return
    }
    try {
      const config = {
        headers: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        }
      }
      const response = await axios.get('/api/user?search=' + name, config)
      const status = response.status
      const data = response.data
      if (status === 200) {
        setUsersList(data || [])
      }
    } catch (err) {
      console.error('Error searching users:', err)
    }
  }

  const sendMessage = async (message) => {
    let newChatId = null
    let chatData = null
    const users = selectedChat.users ? selectedChat.users.map(user => user._id) : []
    socket.emit('stop typing', { userId, chatId, users })
    const isNewChat = !messages.length && !selectedChat.isGroupChat
    const date = new Date()
    setMessages([...messages, { sending: true, sender: userProfile, createdAt: date.toISOString(), content: message}])
    if (!message) return
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }

    if (isNewChat) {
      try {
        const response = await axios.post('/api/chat/create/' + selectedUserId, {}, config)
        const status = response.status
        const data = response.data
        if (status === 200) {
          newChatId = data._id
          chatData = data
        } else {
          console.error('Failed to send message')
        }
      } catch (err) {
        console.error(err)
      }
    }

    const payload = {
      content: message,
      chatId: newChatId || chatId
    }


    try {
      const response = await axios.post('/api/message', payload, config)
      const status = response.status
      const data = response.data
      if (status === 200) {
        socket.emit('new message', data)
        socket.emit('unread messages', { chatId: data.chat._id, userId, seen: true, newList: true });
        setMessages([...messages, data])
        if (isNewChat) {
          getSelectedChats(chatData, 'chat')
        }
      } else {
        console.error('Failed to send message')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const openModal = (menuItem) => {
    setSelectedMenu(menuItem)
    setShowModal(true)
  }

  const MenuItems = (
    <div>
      <div className='fw-bold text-white px-2 py-1 hover rounded-2' onClick={() => openModal('createGroup')} ><AppstoreAddOutlined className='me-2' />Create Group</div>
      <div className='fw-bold text-white px-2 py-1 hover rounded-2' onClick={() => { setOtherProfile(null); openModal('profile') }} ><UserOutlined className='me-2' />Profile</div>
      <div className='fw-bold text-white px-2 py-1 hover rounded-2' onClick={() => openModal('settings')} ><SettingOutlined className='me-2' />Settings</div>
      <Popconfirm overlayClassName='custom-popconfirm' okText='Yes' icon={null} cancelText='No' placement='topRight' title='Are you sure you want to logout?' color='#1d1d1d' onConfirm={() => logout()}><div className='fw-bold text-white px-2 py-1 hover rounded-2' ><LogoutOutlined className='me-2' />Logout</div></Popconfirm>
    </div>
  )

  const previewProfile = (profile, type) => {
    setShowModal(true)
    setSelectedMenu(type)
    setOtherProfile(profile)
  }

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const isGroupUpdated = (updatedChat, isNew) => {
    if (isNew) {
      setChatsList((list) => [updatedChat, ...list])
    } else {
      setSelectedChat(updatedChat)
      setChatsList((chats) => chats.map(chat => chat._id === updatedChat._id ? updatedChat : chat))
      setOtherProfile(updatedChat)
    }
  }

  const unselectChat = () => {
    // setShowMessage(false)
    // setSelectedChat(null)
    // setChatId('')
    navigate('/')
  }

  const exitGroup = () => {
    setShowModal(false)
    setChatsList((usersList) => usersList.filter(exList => exList._id !== selectedChat._id))
    setMessages([])
    setSelectedChat(null)
    setChatId('')
  }

  return (
    <div className='d-flex w-100' style={{ height: '100dvh' }}>
      <Spin spinning={fetchingList} fullscreen/>
      <div className={`list-container primary-bg text-white side-panel h-100 ${showMessage ? 'display-none' : 'display-block'}`}>
        <div className='d-flex flex-column h-100'>
          <div >
            <div className='w-100 d-flex ps-2 mb-2 align-items-center  justify-content-between mt-2'>
              {!!usersList.length && <div className='me-2 hover p-1 rounded-2'><ArrowLeftOutlined onClick={() => {setUsersList([]); setSearchText('')}}/></div>}
              <Input prefix={<SearchOutlined />} className='ant-input bg-transparent' placeholder='Search User' value={searchText} onChange={(e) => searchUsers(e.target.value)} />
              {/* <AppstoreAddOutlined style={{ fontSize: '20px' }} /> */}
              <Popover arrow={false} overlayInnerStyle={{ padding: 0, backgroundColor: '#1d1d1d' }} placement="bottomRight" trigger='click' content={MenuItems}>
                <div className='ms-2 hover py-1 rounded-3 me-1'><MoreOutlined style={{ fontSize: 28 }} /></div>
              </Popover>
            </div>
            <hr />
            {!!chatsList.length && <div className='px-2 d-flex justify-content-center'>
              <Segmented
                value={chatType}
                onChange={(type) => setChatType(type)}
                className='custom-segmented'
                style={{ color: '#fff' }}
                options={[
                  {
                    label: 'Chats',
                    value: 'individual',
                    icon: <UserOutlined />,
                    className: 'text-white'
                  },
                  {
                    label: 'Groups',
                    value: 'group',
                    icon: <UsergroupAddOutlined />,
                    className: 'text-white'
                  },
                ]}
              />
            </div>}
          </div>
          <div className='h-100 w-100 mt-2 px-2 custom-scrollbar rounded-3' style={{ overflowY: 'auto' }} >
            <UserList
              showMessage={showMessage}
              setShowMessage={setShowMessage}
              users={chatsList}
              typingList={typingList}
              usersList={usersList}
              chatId={chatId}
              chatType={chatType}
              userId={userId}
              typing={typing}
              selectedChat={selectedChat}
              loadingId={loadingId}
              setSelectedUser={getSelectedChats}
              fetchingList={fetchingList}
            />
          </div>
        </div>
      </div>
      {selectedChat ? <div className={`w-100 bg-danger ${showMessage ? 'display-block' : 'display-none'}`}>
        <ChatPage
          showMessage={showMessage}
          unselectChat={unselectChat}
          typingHandler={typingHandler}
          typing={typing}
          messages={messages}
          sendMessage={sendMessage}
          previewProfile={previewProfile}
          userId={userId}
          selectedUser={selectedChat}
        /></div> : <div className={'display-flex display-none secondary-bg flex-column align-items-center justify-content-center w-100 h-100 text-white'}>
          {/* <div> */}
            <Image preview={false} style={{ height: '150px' }} src='rocket_png.png' />
            <div className='text-center fs-3'>Select a chat or user to start a conversation</div>
          {/* </div> */}
        </div>}
      <ModalWrapper
        userId={userId}
        showModal={showModal}
        profileInfo={otherProfile || userProfile}
        setShowModal={setShowModal}
        selectedMenu={selectedMenu}
        isGroupUpdated={isGroupUpdated}
        setSelectedMenu={setSelectedMenu}
        setUserProfile={setUserProfile}
        exitGroup={exitGroup}
      />
    </div>
  )
}

export default memo(Home)

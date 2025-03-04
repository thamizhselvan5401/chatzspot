import { Button, Image, Input, message, Tag } from 'antd'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import compressImage from '../utils/compressImage'

const GroupHandler = ({ setShowModal, groupInfo, isUpdate, cancelUpdate, isGroupUpdated }) => {
  const [groupName, setGroupName] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [usersList, setUsersList] = useState([])
  const [loading, setLoading] = useState(false)
  const [avatar, setAvatar] = useState('')

  useEffect(() => {
    if (groupInfo) {
      setGroupName(groupInfo.chatName)
      setSelectedUsers(groupInfo.users)
    }
  }, [groupInfo])

  const createGroup = async () => {
    const payload = {
      name: groupName.trim(),
      users: JSON.stringify(selectedUsers.map(user => user._id)),
      avatar: avatar || ''
    }
    setLoading(true)
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      }
      const response = await axios.post('/api/chat/createGroup', payload, config)
      const status = response.status
      const data = response.data
      if (status === 200) {
        message.success('Group Created Successfully')
        isGroupUpdated(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateGroup = async () => {
    const updatedChat = {
      chatName: groupName.trim(),
      users: selectedUsers.map(user => user._id),
      _id: groupInfo._id,
      avatar: avatar || ''
    }
    setLoading(true)
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      }
      const response = await axios.post('/api/chat/updateGroup', { updatedChat }, config)
      const status = response.status
      const data = response.data
      if (status === 200) {
        // setUsers(data || [])
        isGroupUpdated(data)
        cancelUpdate('group', null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async (name) => {
    if (!name) return
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        }
      }
      const response = await axios.get('/api/user?search=' + name, config)
      const status = response.status
      const data = response.data
      if (status === 200) {
        setUsersList(data.slice(0, 4) || [])
      }
    } catch (err) {
      console.log('Error searching users:', err)
    }
  }

  return (
    <div>
      <div className='mb-2'>
        <label htmlFor='image_upload' className='d-flex justify-content-center' style={{ cursor: 'pointer' }}>
          <Image style={{ height: '80px', width: '80px', borderRadius: '50%', border: '2px solid black' }} preview={false} src={avatar || 'group.jpeg'} />
        </label>
        <Input
          style={{ display: 'none' }}
          type='file'
          id='image_upload'
          placeholder='User Name'
          accept='image/*'
          onChange={(e) => {
            const file = e.target.files[0]
            if (file) {
              compressImage({ img: file }).then((compressed) => {
                setAvatar(compressed)
              })

              // const reader = new FileReader();
              // reader.onload = (event) => {
              //   compressImage(file)
              //   setImage(event.target.result); // Set the Base64 string as the image source
              // };
              // reader.readAsDataURL(file); // Read the file as a Base64-encoded string
            }
          }}
        />
      </div>
      <div className='mb-2'>
        <label htmlFor='group-name'>Group Name</label>
        <Input
          id='group-name'
          placeholder='Enter Group Name'
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
      </div>
      <div className='mb-2'>
        <label htmlFor='search-users'>Search Users</label>
        <Input
          placeholder='Search Users'
          id='search-users'
          onChange={(e) => searchUsers(e.target.value)}
        />
      </div>
      <div className='mb-2'>
        {selectedUsers.map((user, i) => <Tag
          key={i}
          closable={user._id !== groupInfo?.groupAdmin?._id}
          className='mb-1'
          onClose={() => {
            const updatedSelectedUsers = selectedUsers.filter(exUser => exUser._id !== user._id)
            setSelectedUsers(updatedSelectedUsers)
          }}
        >
            <Image
              style={{ height: '20px', width: '20px' }}
              className='rounded-5 my-1'
              src={user.avatar}
            />
            <span className='ms-2'>{user.userName}</span>
        </Tag>)}
      </div>
      <div>
        {usersList.map((user, i) => (
          <div
            className={`d-flex align-items-center mb-2 ${selectedUsers.find(exUser=> exUser._id === user._id) ? 'bg-primary' : 'bg-secondary'} px-2 py-1 rounded-2`}
            onClick={() => {
              if (selectedUsers.find((exUser) => exUser._id === user._id)) return
              const selected = [...selectedUsers, user]
              setSelectedUsers(selected)
            }}
          >
            <Image
              style={{ height: '30px', width: '30px' }}
              className='rounded-5'
              src={user.avatar}
            />
            <div className='ms-2'>{user.userName}</div>
          </div>
        ))}
      </div>
      <div className='d-flex justify-content-end mt-4'>
        <Button
          className='me-2'
          onClick={() => {
            isUpdate ? cancelUpdate('group', null) : setShowModal(false)
          }}
        >Cancel</Button>
        <Button
          type='primary'
          loading={loading}
          onClick={isUpdate ? updateGroup : createGroup}
        >{isUpdate ? 'Update Group' : 'Create Group'}</Button>
      </div>
    </div>
  )
}

export default GroupHandler

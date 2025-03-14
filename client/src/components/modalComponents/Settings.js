import { Button, Image, Input } from 'antd'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import compressImage from '../utils/compressImage'
import axios from 'axios'

const Settings = ({ profileInfo, setUserProfile }) => {

  const { setValue, handleSubmit, register, getValues, reset, watch } = useForm({
    defaultValues: {
      userName: '',
      email: '',
      avatar: null
    }
  })

  const { userName, email, avatar } = watch()

  useEffect(() => {
    const { userName = '', email  = '', avatar = '', _id } = profileInfo
    reset({
      userName, email, avatar, _id
    })
  }, [])

  const updateProfile = async (updatedProfile) => {
    // setLoading(true)
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      }
      const response = await axios.post('/api/user/updateProfile', updatedProfile, config)
      const status = response.status
      const data = response.data
      if (status === 200) {
        // setUsers(data || [])
        // isGroupUpdated(data)
        // cancelUpdate('group', null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      // setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit((data) => updateProfile(data, '', reset))}>
        <div style={{ marginBottom: '.5rem' }}>
          <label htmlFor='image_upload' className='d-flex justify-content-center' style={{ cursor: 'pointer' }}>
            <Image style={{ height: '80px', width: '80px', borderRadius: '50%', border: '2px solid black' }} preview={false} src={avatar || 'user.jpg'} />
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
                  setValue('avatar', compressed)
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
        <div style={{ marginBottom: '.5rem' }}>
          <label>User Name</label>
          <Input
            placeholder='User Name'
            value={userName}
            {...register('userName', { required: true })}
            onChange={(e) => setValue('userName', e.target.value)}
          />
        </div>
        <div style={{ marginBottom: '.5rem' }}>
          <label>User Name</label>
          <Input
            type='email'
            value={email}
            placeholder='Email'
            {...register('email', { required: true })}
            onChange={(e) => setValue('email', e.target.value)}
          />
        </div>
        <div className='d-flex justify-content-end mt-3'>
          <Button type='primary' htmlType='submit'>Update</Button>
        </div>
      </form>
    </div>
  )
}

export default Settings

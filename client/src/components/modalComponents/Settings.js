import { Badge, Button, Image, Input, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import compressImage from '../utils/compressImage'
import axios from 'axios'
import { CloseCircleTwoTone } from '@ant-design/icons'

const Settings = ({ profileInfo, setUserProfile }) => {
  const [loading, setLoading] = useState(false)

  const { setValue, handleSubmit,  register, formState: { errors }, getValues, reset, watch } = useForm({
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
    setLoading(true)
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
        setUserProfile(data)
        message.success('Profile updated successfully')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit((data) => updateProfile(data, '', reset))}>
        <div style={{ marginBottom: '.5rem' }}>
          <div className='d-flex justify-content-center'>
            <label htmlFor='image_upload' style={{ cursor: 'pointer' }}>
              <Badge count={avatar && <div onClick={(e) => {e.stopPropagation(); e.preventDefault(); setValue('avatar', null)}} className='bg-bright rounded'><CloseCircleTwoTone twoToneColor={'#F00'}/></div>} style={{ fontSize: '16px' }} status='error' className='bg-primary' offset={[-10, 10]} styles={{ root: {borderRadius: '50%'} }}>
                <Image style={{ height: '80px', width: '80px', borderRadius: '50%', border: '2px solid black' }} preview={false} src={avatar || 'user.jpg'} />
              </Badge>
            </label>
          </div>
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
            className={`ant-input bg-transparent ${errors.userName ? 'border-danger' : ''}`}
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
            className={`ant-input bg-transparent ${errors.email ? 'border-danger' : ''}`}
            {...register('email', { required: true })}
            onChange={(e) => setValue('email', e.target.value)}
          />
        </div>
        <div className='d-flex justify-content-end mt-3'>
          <Button type='primary' loading={loading} htmlType='submit'>Update</Button>
        </div>
      </form>
    </div>
  )
}

export default Settings

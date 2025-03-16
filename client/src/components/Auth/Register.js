import { Badge, Button, Image, Input } from 'antd'
import React from 'react'
import compressImage from '../utils/compressImage'
import { useForm } from 'react-hook-form'
import { CloseCircleTwoTone } from '@ant-design/icons'

const Register = ({ onSubmit, loading }) => {
  const { Password } = Input

  const {
    setValue,
    handleSubmit,
    register,
    formState: { errors },
    watch,
    reset,
    trigger
  } = useForm({
    defaultValues: {
      userName: '',
      password: '',
      email: '',
      confirmPassword: '',
      avatar: null
    }
  })

  const {password, avatar} = watch() // Watch password field for changes

  return (
    <div>
      <form onSubmit={handleSubmit((data) => onSubmit(data, '', reset))}>
        {/* Profile Image Upload */}
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
            accept='image/*'
            onChange={(e) => {
              const file = e.target.files[0]
              if (file) {
                compressImage({ img: file }).then((compressed) => {
                  setValue('avatar', compressed, { shouldValidate: true }) // Validate after setting value
                })
              }
            }}
          />
        </div>

        {/* Username Field */}
        <div style={{ marginBottom: '.5rem' }}>
          <label className='text-white' htmlFor='userName'>User Name</label>
          <Input
            id='userName'
            placeholder='User Name'
            className={`bg-transparent ${errors.userName ? 'border-danger' : ''}`}
            {...register('userName', { required: 'Username is required' })}
            onChange={(e) => setValue('userName', e.target.value, { shouldValidate: true })}
          />
          {errors.userName && <div className='text-danger'>{errors.userName.message}</div>}
        </div>

        {/* Email Field */}
        <div style={{ marginBottom: '.5rem' }}>
          <label className='text-white' htmlFor='email'>Email</label>
          <Input
            id='email'
            type='email'
            className={`bg-transparent ${errors.email ? 'border-danger' : ''}`}
            placeholder='Email'
            {...register('email', { required: 'Email is required' })}
            onChange={(e) => setValue('email', e.target.value, { shouldValidate: true })}
          />
          {errors.email && <div className='text-danger'>{errors.email.message}</div>}
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: '.5rem' }}>
          <label className='text-white' htmlFor='password'>Password</label>
          <Password
            id='password'
            placeholder='Password'
            className={`bg-transparent ${errors.password ? 'border-danger' : ''}`}
            {...register('password', { required: 'Password is required' })}
            onChange={(e) => {
              setValue('password', e.target.value, { shouldValidate: true })
              trigger('confirmPassword') // Validate confirmPassword when password changes
            }}
          />
          {errors.password && <div className='text-danger'>{errors.password.message}</div>}
        </div>

        {/* Confirm Password Field */}
        <div style={{ marginBottom: '.5rem' }}>
          <label className='text-white' htmlFor='confirmPassword'>Confirm Password</label>
          <Password
            id='confirmPassword'
            placeholder='Confirm Password'
            className={`bg-transparent ${errors.confirmPassword ? 'border-danger' : ''}`}
            {...register('confirmPassword', {
              required: 'Confirm password is required.',
              validate: {
                matchesPassword: value => value === password || 'Passwords do not match',
              },
            })}
            onChange={(e) => setValue('confirmPassword', e.target.value, { shouldValidate: true })}
          />
          {errors.confirmPassword && <div className='text-danger'>{errors.confirmPassword.message}</div>}
        </div>

        {/* Submit Button */}
        <Button type='primary' loading={loading} htmlType='submit'>Register</Button>
      </form>
    </div>
  )
}

export default Register

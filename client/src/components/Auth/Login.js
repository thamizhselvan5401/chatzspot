import React from 'react'
import { Button, Input } from 'antd'
import { useForm } from 'react-hook-form'

const Login = (prop) => {
  const { Password } = Input
  const { setValue, register, handleSubmit, reset, formState: { errors }, watch  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    },
    mode: 'onChange'
  })
  const { email, password } = watch()

  console.log(errors)

  return (
    <div>
      <form onSubmit={handleSubmit((data) => prop.onSubmit(data, '/login', reset))}>
        <div style={{ marginBottom: '.5rem' }}>
          {/* <label>User Name</label> */}
          <Input
            placeholder='Email'
            value={email}
            className={`ant-input bg-transparent ${errors.email ? 'border-danger' : ''}`}
            {...register('email', { required: 'Email is Required' })}
            onChange={(e) => setValue('email', e.target.value, { shouldValidate: true })}
          />
          <div className='text-danger'>{errors.email?.message}</div>
        </div>
        <div style={{ marginBottom: '.5rem' }}>
          {/* <label>Password</label> */}
          <Password
            placeholder='Password'
            value={password}
            className={`ant-input bg-transparent ${errors.password ? 'border-danger' : ''}`}
            {...register('password', { required: 'Password is Required' })}
            onChange={(e) => setValue('password', e.target.value, { shouldValidate: true })}
          />
          <div className='text-danger'>{errors.password?.message}</div>
        </div>
        <Button htmlType='submit' type='primary'>Login</Button>
      </form>
    </div>
  )
}

export default Login

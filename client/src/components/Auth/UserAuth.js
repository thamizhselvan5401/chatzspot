import { Card, message, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import Login from './Login';
import Register from './Register';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserAuth = () => {
  const [activeTab, setActiveTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const [, tabName] = pathname.split('/')
    setActiveTab(tabName)
  }, [pathname])

  const onAuthinticate = async (payload, path = '', reset) => {
    setLoading(true)

    try {
      const config = {
        headers: { 'Content-type': 'application/json' }
      }

      const response = await axios.post(
        `/api/user${path}`,
        payload,
        config
      )
      const resData = response.data
      const success = resData.success
      const data = resData.data
      if (success) {
        localStorage.setItem('token', data.token)
        !path && message.success('Account Created Successfully')
        navigate('/')
        // localStorage.setItem('userInfo', JSON.stringify(data.userAcc))
        reset()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const authTabs = [
    {
      label: 'Login',
      key: 'login',
      children: <Login onSubmit={onAuthinticate} loading={loading} />
    },
    {
      label: 'Register',
      key: 'register',
      children: <Register onSubmit={onAuthinticate} loading={loading} />
    }
  ];

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      className='primary-bg'
    >
      <Card size="small" className='secondary-bg' bordered={false} style={{ width: 300 }}>
        <Tabs 
          centered
          className='custom-tab'
          activeKey={activeTab}
          size="small"
          defaultActiveKey="login"
          items={authTabs}
          onChange={(tab) => {
            navigate(`/${tab}`)
          }}
        />
      </Card>
    </div>
  );
};

export default UserAuth;

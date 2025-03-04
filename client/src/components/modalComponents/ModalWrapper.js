import { Modal } from 'antd'
import React from 'react'
import GroupHandler from './GroupHandler'
import ProfileInfo from './ProfileInfo';
import GroupInfo from './GroupInfo';
import Settings from './Settings';
import { CloseOutlined } from '@ant-design/icons';

const SelectedComponent = ({ selectedMenu, setShowModal, profileInfo = {}, isGroupUpdated, userId, setUserProfile, exitGroup }) => {
  const component = {
    createGroup: GroupHandler,
    profile: ProfileInfo,
    group: GroupInfo,
    settings: Settings
  };

  const props = {
    createGroup: { setShowModal },
    profile: { profileInfo },
    group: { groupInfo: profileInfo, isGroupUpdated, userId, exitGroup },
    settings: { profileInfo, setUserProfile }
  }

  const ComponentToRender = component[selectedMenu];

  return ComponentToRender ? <ComponentToRender {...props[selectedMenu]} /> : null;
};

const ModalWrapper = (props) => {
  const { showModal, setShowModal, setSelectedMenu } = props
  return (
    <div>
      <Modal
        footer={null}
        closeIcon={<CloseOutlined className='text-white'/>}
        destroyOnClose
        open={showModal}
        className='custom-modal rounded-3'
        onCancel={() => {
          setShowModal(false);
          setSelectedMenu(null);
        }}
      >
        <SelectedComponent
          {...props}
        />
      </Modal>
    </div>
  );
}

export default ModalWrapper;

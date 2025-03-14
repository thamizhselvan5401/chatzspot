import { ClockCircleOutlined, SendOutlined, SmileOutlined } from '@ant-design/icons'
import { Input, Popover, Spin } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data"

const Messages = ({ messages, userId, sendMessage, typingHandler }) => {
  const [draftMessage, setDraftMessage] = useState('');
  let lastDisplayedDate = null;

  const containerRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom when messages update
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="d-flex flex-column primary-bg h-100">
      <div className="d-flex px-2 w-100 align-items-end custom-scrollbar" ref={containerRef} style={{ overflowY: 'auto', height: 'calc(100% - 60px)' }}>
        <div className="w-100 h-auto mh-100 mb-0">
          {messages.map((message, i) => {
            const [date] = message.createdAt.split("T");
            const isNewDate = lastDisplayedDate !== date;
            const dateString = new Date(message.createdAt);

            const localHours = String(dateString.getHours()).padStart(2, '0');
            const localMinutes = String(dateString.getMinutes()).padStart(2, '0');
            const formattedTime = `${localHours}:${localMinutes}`;

            if (isNewDate) lastDisplayedDate = date;

            return (
              <div key={i}>
                {/* Date separator */}
                {isNewDate && (
                  <div className="text-center my-3">
                    <span className="px-3 py-1 active-panel-bg rounded-pill small text-white">
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}

                {/* Message content */}
                <div
                  className={`d-flex w-100 my-2 ${message.sender._id === userId ? 'justify-content-end' : 'justify-content-start'
                    }`}
                >
                  <div
                    className={`p-2 rounded-3 message-bubble text-white ${message.sender._id === userId ? 'sent panel-bg' : 'received panel-bg'
                      }`}
                  >
                    <span>{message.content}{message.sending ? <Spin className='ms-2'/> : null}</span>
                    <span className="time text-secondary">{message.sending ? <ClockCircleOutlined /> : formattedTime}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      <div style={{ height: '60px' }} className="px-3 d-flex align-items-center panel-bg mt-2">
        <Input
          className="w-100 bg-transparent ant-input"
          size="large"
          placeholder="Type a message..."
          value={draftMessage}
          prefix={<Popover arrow={false} overlayInnerStyle={{ padding: 0, borderRadius: '.7rem' }} overlayClassName='rounded-4' placement="topLeft" trigger='click'
            content={<Picker data={data} previewPosition={'none'} onEmojiSelect={(emoji) => setDraftMessage((prevText) => prevText + emoji.native)}/>}
            >
              <div className='hover p-1 rounded-3'><SmileOutlined style={{ fontSize: 18 }} /></div>
          </Popover>}
          onPressEnter={(e) => {
            setDraftMessage('');
            sendMessage(e.target.value.trim());
          }}
          onChange={(e) => {
            typingHandler();
            setDraftMessage(e.target.value);
          }}
          suffix={
            <SendOutlined
              className='text-white'
              onClick={() => {
                setDraftMessage('');
                sendMessage(draftMessage.trim());
              }}
            />
          }
        />
      </div>
    </div>
  );
};


export default Messages

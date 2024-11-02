import React from 'react';
import Menus from '../menu-file/menu-bar'

const SideMessages = () => {
    const messages = [
        { id: 2, text: "Hola Mundo 2" },
        { id: 3, text: "Hola Mundo 3" },

    ];

    return (
        <div className="side-messages-container">
            <div className="navBar">
                <Menus />
            </div>
            <div className="messages">
                {messages.map((message) => (
                    <div key={message.id} className="message">
                        {message.text}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SideMessages;

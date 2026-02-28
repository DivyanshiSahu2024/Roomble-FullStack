
/**
 * This component renders a placeholder UI for an empty chat box when no chat is selected.
 * It displays a message or visual indicator to inform the user that no conversation is active.
 */

import React from 'react';
import '../../css/MessageBoxStyle/ChatBoxEmpty.css';
import NoChatSelected from './NoChatSelected';

function ChatBoxEmpty() {
    return (
        <div className="chatBoxEmpty">
            <div className="chatBoxEmptyText">
                <h2 className='heading-conversation'><NoChatSelected/></h2>
            </div>
        </div>
    )
}

export default ChatBoxEmpty;
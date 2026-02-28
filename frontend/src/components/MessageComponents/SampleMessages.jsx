
/**
 * SampleMessages component renders a chat interface with sample messages
 * exchanged between users. It includes functionality to auto-scroll to the
 * bottom of the chat when the component mounts.
 */

import React, { useRef, useEffect } from 'react';
import DoneAllIcon from '@mui/icons-material/DoneAll';

function SampleMessages() {
    const endRef = useRef(null);

    // Scroll to the bottom of the chat when the component mounts
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    return (
        <div className="chatBody">
            {/* Message from another user */}
            <div className="message">
                <img src="/sampleUser_Img.png" alt="Name" className="active-sender" />
                <div className="msgBox">
                    <p className="msgText">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum laborum consectetur tempore eum enim at, animi dicta et, repudiandae eos incidunt ducimus, maiores dolore vitae sapiente rem aliquam est doloremque?
                    </p>
                    <span className="sentTime">1 min ago</span>
                </div>
            </div>

            {/* Message from the current user */}
            <div className="message own">
                <div className="msgBox">
                    <img src="/sampleUser_Img.png" alt="Name" className="img-msg" />
                    <p className="msgText">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum laborum consectetur tempore eum enim at, animi dicta et, repudiandae eos incidunt ducimus, maiores dolore vitae sapiente rem aliquam est doloremque?
                        <DoneAllIcon style={{ fontSize: 18, color: "#FDE6E8", marginLeft: 5 }} />
                    </p>
                    <span className="sentTime">1 min ago</span>
                </div>
            </div>

            {/* Another message from another user */}
            <div className="message">
                <img src="/sampleUser_Img.png" alt="Name" className="active-sender" />
                <div className="msgBox">
                    <p className="msgText">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum laborum consectetur tempore eum enim at, animi dicta et, repudiandae eos incidunt ducimus, maiores dolore vitae sapiente rem aliquam est doloremque?
                    </p>
                    <span className="sentTime">1 min ago</span>
                </div>
            </div>

            {/* Another message from the current user */}
            <div className="message own">
                <div className="msgBox">
                    <p className="msgText">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum laborum consectetur tempore eum enim at, animi dicta et, repudiandae eos incidunt ducimus, maiores dolore vitae sapiente rem aliquam est doloremque?
                        <DoneAllIcon style={{ fontSize: 18, color: "#FDE6E8", marginLeft: 5 }} />
                    </p>
                    <span className="sentTime">1 min ago</span>
                </div>
            </div>

            {/* Another message from another user */}
            <div className="message">
                <div className="msgBox">
                    <p className="msgText">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum laborum consectetur tempore eum enim at, animi dicta et, repudiandae eos incidunt ducimus, maiores dolore vitae sapiente rem aliquam est doloremque?
                    </p>
                    <span className="sentTime">1 min ago</span>
                </div>
            </div>

            {/* Short message from the current user */}
            <div className="message own">
                <div className="msgBox">
                    <p className="msgText">
                        hello
                        <DoneAllIcon style={{ fontSize: 18, color: "#FDE6E8", marginLeft: 5 }} />
                    </p>
                    <span className="sentTime">1 min ago</span>
                </div>
            </div>

            {/* Another short message from the current user */}
            <div className="message own">
                <div className="msgBox">
                    <p className="msgText">
                        Hello
                        <DoneAllIcon style={{ fontSize: 18, color: "#FDE6E8", marginLeft: 5 }} />
                    </p>
                    <span className="sentTime">1 min ago</span>
                </div>
            </div>

            {/* Invisible div to scroll to the bottom */}
            <div ref={endRef}></div>
        </div>
    );
}

export default SampleMessages;
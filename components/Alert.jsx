import React from 'react';

const CustomAlert = ({ style, options, message, close }) => (
    <div style={{ ...style, padding: "10px", borderRadius: "5px", backgroundColor: options.type === "error" ? "red" : "green", color: "#fff" }}>
        {message}
        <button onClick={close} style={{ marginLeft: "10px", background: "black", color: "white", padding: "5px", borderRadius: "3px" }}>
            X
        </button>
    </div>
);

export default CustomAlert;

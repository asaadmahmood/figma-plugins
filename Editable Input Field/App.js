// src/App.js
import React, { useState, useEffect } from 'react';

function App() {
    const [focusedTextId, setFocusedTextId] = useState(null);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        window.onmessage = (event) => {
            const msg = event.data.pluginMessage;
            if (msg.type === 'input-created') {
                setFocusedTextId(msg.textId);
            }
        };
    }, []);

    const handleKeyDown = (e) => {
        if (focusedTextId) {
            const newInputValue = inputValue + e.key;
            setInputValue(newInputValue);
            parent.postMessage(
                {
                    pluginMessage: {
                        type: 'update-text',
                        textId: focusedTextId,
                        characters: newInputValue,
                    },
                },
                '*'
            );
        }
    };

    return (
        <div className="App">
            <h3>Editable Input Fields React</h3>
            <button
                onClick={() =>
                    parent.postMessage(
                        { pluginMessage: { type: 'create-input' } },
                        '*'
                    )
                }
            >
                Create Input Field
            </button>
            <div>
                <p>Type in the input field below:</p>
                <div
                    tabIndex="0"
                    onKeyDown={handleKeyDown}
                    style={{
                        border: '1px solid black',
                        padding: '10px',
                        margin: '10px 0',
                    }}
                >
                    {inputValue}
                </div>
            </div>
        </div>
    );
}

export default App;

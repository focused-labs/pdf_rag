import React, {useState} from 'react';
import './App.css';
import {fetchEventSource} from "@microsoft/fetch-event-source";


interface Message {
  message: string;
  isUser: boolean;
  sources?: string[];
}

function App() {
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<Message[]>([]);

  const setPartialMessage = (chunk: string, sources: string[] = []) => {
    setMessages(prevMessages => {
      let lastMessage = prevMessages[prevMessages.length - 1];
      if (prevMessages.length === 0 || !lastMessage.isUser) {
        return [...prevMessages.slice(0, -1), {
          message: lastMessage.message + chunk,
          isUser: false,
          sources: lastMessage.sources ? [...lastMessage.sources, ...sources] : sources
        }];
      }

      return [...prevMessages, {message: chunk, isUser: false, sources}];
    })
  }

  function handleReceiveMessage(data: string) {
    let parsedData = JSON.parse(data);

    if (parsedData.answer) {
      setPartialMessage(parsedData.answer.content)
    }

    if (parsedData.docs) {
      setPartialMessage("", parsedData.docs.map((doc: any) => doc.metadata.source))
    }
  }

  const handleSendMessage = async (message: string) => {
    setInputValue("")

    setMessages(prevMessages => [...prevMessages, {message, isUser: true}]);

    await fetchEventSource(`${process.env.REACT_APP_BACKEND_URL}/rag/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          question: message,
        }
      }),
      onmessage(event) {
        if (event.event === "data") {
          handleReceiveMessage(event.data);
        }
      },
    })
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      handleSendMessage(inputValue.trim())
    }
  }

  function formatSource(source: string) {
    return source.split("/").pop() || "";
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 text-white text-center p-4">
        Epic v. Apple Legal Assistant
      </header>
      <main className="flex-grow container mx-auto p-4 flex-col">
        <div className="flex-grow bg-gray-700 shadow overflow-hidden sm:rounded-lg">
          <div className="border-b border-gray-600 p-4">
            {messages.map((msg, index) => (
              <div key={index}
                   className={`p-3 my-3 rounded-lg text-white ml-auto ${msg.isUser ? "bg-gray-800" : "bg-gray-900"}`}>
                {msg.message}
                {/*  Source */}
                {!msg.isUser && (
                  <div className={"text-xs"}>
                    <hr className="border-b mt-5 mb-5"></hr>
                    {msg.sources?.map((source, index) => (
                      <div>
                        <a
                          target="_blank"
                          download
                          href={`${"http://localhost:8000"}/rag/static/${encodeURI(formatSource(source))}`}
                          rel="noreferrer"
                        >{formatSource(source)}</a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-800">
            <textarea
              className="form-textarea w-full p-2 border rounded text-white bg-gray-900 border-gray-600 resize-none h-auto"
              placeholder="Enter your message here..."
              onKeyUp={handleKeyPress}
              onChange={(e) => setInputValue(e.target.value)}
              value={inputValue}
            ></textarea>
            <button
              className="mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleSendMessage(inputValue.trim())}
            >
              Send
            </button>
          </div>
        </div>

      </main>
      <footer className="bg-gray-800 text-white text-center p-4 text-xs">
        *AI Agents can make mistakes. Consider checking important information.
        <br/>
        All training data derived from public records
        <br/>
        <br/>
        © 2024 Focused Labs
      </footer>

    </div>
  );
}

export default App;

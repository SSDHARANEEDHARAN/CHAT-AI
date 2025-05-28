'use client';

import React, { useState } from 'react';
import { IoCodeSlash, IoSend } from 'react-icons/io5';
import { BiPlanet, BiReset } from 'react-icons/bi';
import { FaPython, FaRobot, FaChild, FaLock } from 'react-icons/fa';
import { TbMessageChatbot } from 'react-icons/tb';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

type MessageType = {
  type: "userMsg" | "responseMsg";
  text: string;
};

type ExampleCardType = {
  title: string;
  text: string;
  icon: React.ReactNode;
  bg: string;
  border: string;
};

const App = () => {
  const [message, setMessage] = useState("");
  const [isResponseScreen, setIsResponseScreen] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [parentalControl, setParentalControl] = useState(false);
  const [showParentalWarning, setShowParentalWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  // List of restricted topics when parental control is enabled
  const restrictedTopics = [
    'adult', 'porn', 'sex', 'nude', 'drug', 'alcohol', 'violence', 
    'gun', 'weapon', 'suicide', 'kill', 'murder', 'hate', 'racism',
    'nsfw', '18+', 'xxx', 'erotic', 'fuck', 'shit', 'bitch', 'asshole'
  ];

  const hitRequest = () => {
    if (message.trim()) {
      if (parentalControl && containsRestrictedContent(message)) {
        setWarningMessage("This content is restricted by parental controls.");
        setShowParentalWarning(true);
        return;
      }
      generateResponse(message);
    } else {
      alert("Please enter a message...");
    }
  };

  const containsRestrictedContent = (msg: string): boolean => {
    const lowerMsg = msg.toLowerCase();
    return restrictedTopics.some(topic => lowerMsg.includes(topic));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      hitRequest();
    }
  };

  const generateResponse = async (msg: string) => {
    if (!msg.trim()) return;
    
    try {
      setIsLoading(true);
      const newUserMessage: MessageType = { type: "userMsg", text: msg };
      setMessages(prev => [...prev, newUserMessage]);
      setMessage("");
      setIsResponseScreen(true);

      const genAI = new GoogleGenerativeAI("AIzaSyAjdYe217-vx6-BFLt9dCE97FZSDqWeax8");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const safetySettings = parentalControl ? [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        }
      ] : [];
      
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: msg }] }],
        safetySettings
      });
      
      const responseText = await result.response.text();

      if (parentalControl && containsRestrictedContent(responseText)) {
        const newResponseMessage: MessageType = { 
          type: "responseMsg", 
          text: "I can't provide that information due to parental control restrictions." 
        };
        setMessages(prev => [...prev, newResponseMessage]);
      } else {
        const newResponseMessage: MessageType = { type: "responseMsg", text: responseText };
        setMessages(prev => [...prev, newResponseMessage]);
      }
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage: MessageType = { 
        type: "responseMsg", 
        text: "Sorry, I couldn't process your request. Please try again." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const newChat = () => {
    if (messages.length > 0 && !window.confirm("Start a new chat? Your current conversation will be lost.")) {
      return;
    }
    setIsResponseScreen(false);
    setMessages([]);
  };

  const handleExampleClick = (exampleText: string) => {
    if (parentalControl && containsRestrictedContent(exampleText)) {
      setWarningMessage("This example is restricted by parental controls.");
      setShowParentalWarning(true);
      return;
    }
    setMessage(exampleText);
    const messageBox = document.getElementById('messageBox');
    if (messageBox) messageBox.focus();
  };

  const toggleParentalControl = () => {
    if (!parentalControl) {
      const confirmEnable = window.confirm(
        "Enabling parental controls will restrict adult, violent, and other sensitive content. Continue?"
      );
      if (confirmEnable) {
        setParentalControl(true);
      }
    } else {
      const confirmDisable = window.confirm(
        "You need to enter the parental control password to disable this feature."
      );
      if (confirmDisable) {
        setParentalControl(false);
      }
    }
  };

  const getFilteredExamples = (): ExampleCardType[] => {
    const allExamples: ExampleCardType[] = [
      {
        title: "Learn Coding",
        text: "What is coding?",
        icon: <IoCodeSlash size={20} style={{ color: '#60a5fa' }} />,
        bg: "bg-blue-900/20",
        border: "border-blue-400"
      },
      {
        title: "Space Facts",
        text: "Red planet?",
        icon: <BiPlanet size={20} style={{ color: '#f472b6' }} />,
        bg: "bg-pink-900/20",
        border: "border-pink-400"
      },
      {
        title: "Tech History",
        text: "Python history?",
        icon: <FaPython size={20} style={{ color: '#fbbf24' }} />,
        bg: "bg-yellow-900/20",
        border: "border-yellow-400"
      },
      {
        title: "AI Applications",
        text: "AI uses?",
        icon: <TbMessageChatbot size={20} style={{ color: '#4ade80' }} />,
        bg: "bg-green-900/20",
        border: "border-green-400"
      },
      {
        title: "Biology",
        text: "Human reproduction?",
        icon: <FaChild size={20} style={{ color: '#a78bfa' }} />,
        bg: "bg-purple-900/20",
        border: "border-purple-400"
      },
      {
        title: "Chemistry",
        text: "How alcohol affects body?",
        icon: <FaLock size={20} style={{ color: '#f87171' }} />,
        bg: "bg-red-900/20",
        border: "border-red-400"
      }
    ];

    if (!parentalControl) return allExamples;
    
    return allExamples.filter(example => 
      !containsRestrictedContent(example.text) && 
      !containsRestrictedContent(example.title)
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-gray-200 p-[50px]">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        {isResponseScreen ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a] bg-[#0a0a0a]">
              <div className="flex items-center space-x-2">
                <FaRobot style={{ color: '#9333ea', fontSize: '18px' }} />
                <h2 className="text-lg font-semibold">AssistMe</h2>
                {parentalControl && (
                  <span className="text-xs bg-purple-900/50 px-2 py-0.5 flex items-center">
                    <FaLock style={{ fontSize: '12px', marginRight: '4px' }} /> Parental Controls
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={toggleParentalControl}
                  className={`flex items-center space-x-1 text-xs px-3 py-1 transition-colors ${
                    parentalControl 
                      ? "bg-purple-600 hover:bg-purple-700" 
                      : "bg-[#1a1a1a] hover:bg-[#252525]"
                  }`}
                >
                  {parentalControl ? (
                    <FaLock style={{ color: '#ffffff', fontSize: '14px' }} />
                  ) : (
                    <FaChild style={{ color: '#9ca3af', fontSize: '14px' }} />
                  )}
                  <span>{parentalControl ? "Controls ON" : "Parental"}</span>
                </button>
                <button 
                  onClick={newChat}
                  className="flex items-center space-x-1 bg-[#1a1a1a] hover:bg-[#252525] text-xs px-3 py-1 transition-colors"
                >
                  <BiReset style={{ color: '#9ca3af', fontSize: '14px' }} />
                  <span>New Chat</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <FaRobot style={{ color: '#9333ea', fontSize: '48px', opacity: 0.7, marginBottom: '12px' }} />
                  <h3 className="text-lg mb-1">How can I help you today?</h3>
                  <p className="mb-4 text-sm">Ask me anything or try one of these examples:</p>
                  <div className="grid grid-cols-2 gap-2 max-w-md">
                    {getFilteredExamples().slice(0, 4).map((example, i) => (
                      <div 
                        key={i}
                        onClick={() => handleExampleClick(example.text)}
                        className="bg-[#1a1a1a] hover:bg-[#252525] p-2 cursor-pointer text-xs transition-colors"
                      >
                        {example.text}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex ${msg.type === "userMsg" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-xs p-3 ${msg.type === "userMsg" ? "bg-purple-900/50" : "bg-[#1a1a1a]"}`}>
                      <div className="flex items-center mb-1">
                        {msg.type === "userMsg" ? (
                          <div className="w-5 h-5 bg-purple-700 flex items-center justify-center text-xs mr-1">You</div>
                        ) : (
                          <div className="w-5 h-5 bg-purple-600 flex items-center justify-center text-white mr-1">
                            <FaRobot style={{ fontSize: '12px' }} />
                          </div>
                        )}
                        <span className="font-medium text-sm">{msg.type === "userMsg" ? "You" : "AssistMe"}</span>
                      </div>
                      <div className="whitespace-pre-wrap text-sm">
                        {msg.text.split('\n').map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-xs p-3 bg-[#1a1a1a]">
                    <div className="flex items-center mb-1">
                      <div className="w-5 h-5 bg-purple-600 flex items-center justify-center text-white mr-1">
                        <FaRobot style={{ fontSize: '12px' }} />
                      </div>
                      <span className="font-medium text-sm">AssistMe</span>
                    </div>
                    <div className="flex space-x-1 py-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center max-w-md">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <FaRobot style={{ color: '#9333ea', fontSize: '30px' }} />
                <h1 className="text-3xl font-bold">AssistMe</h1>
                {parentalControl && (
                  <span className="text-xs bg-purple-900/50 px-2 py-0.5 flex items-center">
                    <FaLock style={{ fontSize: '12px', marginRight: '4px' }} /> Parental Controls
                  </span>
                )}
              </div>
              <p className="text-gray-400 mb-8 text-sm">Your AI-powered assistant for any question</p>
              
              <div className="grid grid-cols-2 gap-4">
                {getFilteredExamples().map((card, index) => (
                  <div 
                    key={index}
                    onClick={() => handleExampleClick(card.text)}
                    className={`${card.bg} border ${card.border} p-3 cursor-pointer hover:opacity-90 transition-opacity`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`p-1 ${card.bg}`}>
                        {card.icon}
                      </div>
                      <h3 className="text-sm font-semibold">{card.title}</h3>
                    </div>
                    <p className="text-gray-400 text-xs">{card.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="p-3 border-t border-[#1a1a1a] bg-[#0a0a0a]">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                id="messageBox"
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message AssistMe..."
                className="w-full bg-[#1a1a1a] border border-[#252525] py-2 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <button
                onClick={hitRequest}
                disabled={!message.trim() || isLoading}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <IoSend style={{ fontSize: '20px' }} />
              </button>
            </div>
            
            <div className="flex justify-center mt-3">
              <button
                onClick={toggleParentalControl}
                className={`flex items-center space-x-1 text-xs px-3 py-1 transition-colors ${
                  parentalControl 
                    ? "bg-purple-600 hover:bg-purple-700" 
                    : "bg-[#1a1a1a] hover:bg-[#252525]"
                }`}
              >
                {parentalControl ? (
                  <FaLock style={{ color: '#ffffff', fontSize: '14px' }} />
                ) : (
                  <FaChild style={{ color: '#9ca3af', fontSize: '14px' }} />
                )}
                <span>{parentalControl ? "Parental Controls ON" : "Enable Parental Controls"}</span>
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              AssistMe may produce inaccurate information. Powered By @2025// Tharanee.
            </p>
          </div>
        </div>
      </div>

      {showParentalWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] p-6 max-w-sm w-full mx-4 border border-purple-600">
            <div className="flex items-center justify-center mb-4">
              <FaLock style={{ color: '#ef4444', fontSize: '30px', marginRight: '8px' }} />
              <h3 className="text-lg font-semibold">Content Restricted</h3>
            </div>
            <p className="text-gray-300 mb-4 text-sm">{warningMessage}</p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowParentalWarning(false)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 text-sm"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
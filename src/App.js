import { UserName, Background, ChatContacts, ChatContainer, ChatInput, ChatInputArea, ChatItem, ChatMessages, ChatMessagesArea, ChatOptions, GreenStripe, JoinButton, LastMessage, LoginContainer, Main, Message, MessageContainer, ProfileImg, SendMessage, SendMessageContainer, TitleChatContainer, TitleMessage, UserNameInput } from "./App-style";
import profileImage from './assets/profissao-programador.png'
import sendIcon from './assets/send.png'
import socket from 'socket.io-client'
import { useEffect, useState, useRef } from "react";

const io = socket('http://localhost:4000');

function App() {

  const [userName, setUserName] = useState('');
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [myID, setMyID] = useState('');

  useEffect(() => {
    io.on("users", (users) => {
      setUsers(users);
    })
    io.on("message", (message) => setMessages((messages) => [...messages, message]));
    io.on("connect", () => setMyID(io.id))
  }, [])

  const handleJoin = () => {
    if(userName) {
      io.emit("join", userName);
      setJoined(true);
    }
  }

  const textAreaRef = useRef(null);
  
  const handleTextareaChange = () => {
    
    const content = textAreaRef.current.value;

    if (content.includes('\n')) {
      const textarea = textAreaRef.current;
      textarea.style.height = 'auto'; 
      textarea.style.height = `${textarea.scrollHeight}px`; 
    }
  };


  const handleMessage = () => {
    if(message.trim()) {
      io.emit("message", {message, userName});
      setMessage('');
      if (textAreaRef.current) {
        textAreaRef.current.focus()
      }
    }
  }

  if (!joined) {
    return (
      <Main>
        <Background />
        <LoginContainer>
          <GreenStripe>Digite seu nome</GreenStripe>
          <UserNameInput
            placeholder="Digite o seu nome"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <JoinButton onClick={handleJoin}>Entrar</JoinButton>
        </LoginContainer>
      </Main>
    );
  }
  

  let lastMessage = {};
  if (messages.length > 0) {
    lastMessage = messages[messages.length - 1];
  }

  return (
   <Main>
    <Background></Background>
    <ChatContainer>

      <ChatContacts>
        <ChatOptions></ChatOptions>
        <ChatItem>
          <ProfileImg alt="Imagem de perfil" src={profileImage} />
          <TitleChatContainer>
            <TitleMessage>NetWorking Profissão Programador</TitleMessage>
            <LastMessage>{lastMessage.userName}: {lastMessage.message}</LastMessage>
          </TitleChatContainer>
        </ChatItem>
      </ChatContacts>

      <ChatMessages>
        <ChatOptions>
        <ChatItem>
          <ProfileImg alt="Imagem de perfil" src={profileImage} />
          <TitleChatContainer>
            <TitleMessage>NetWorking Profissão Programador</TitleMessage>
            <LastMessage>
             {users.map((user, index) => (
              <span key={index}> 
              {user.userName}{index + 1 < users.length && users.length !== 0? ', ' : ''}
              
              </span>
             ))}
            </LastMessage>
          </TitleChatContainer>
        </ChatItem>
        </ChatOptions>

        <ChatMessagesArea>
          {messages.map((message, index) => (
            <MessageContainer
            key={index}
            myMessage={message.userID === myID}
            >
              <Message 
                myMessage={message.userID === myID}
              >
                {message.userName? <UserName myMessage={message.userID === myID}>{message.userName}</UserName>: ''}<br/> {message.message}
              </Message>
            </MessageContainer>
          ))}
        </ChatMessagesArea>



        <ChatInputArea>
          <ChatInput 
            placeholder="Mensagem"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              handleTextareaChange()
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleMessage();
              }
            }}
            ref={textAreaRef}
            currentHeight={textAreaRef.current ? textAreaRef.current.scrollHeight : 0}
          />
          <SendMessageContainer>
            <SendMessage alt="Ícone enviar" src={sendIcon} onClick={() => handleMessage()}/>
          </SendMessageContainer>
        </ChatInputArea>

      </ChatMessages>

    </ChatContainer>
   </Main>
  );
}

export default App;
